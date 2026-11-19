#!/usr/bin/env bash
# Build the committed HEAD and deploy it as a no-traffic Cloud Run revision behind the "preview" tag.
#
#   scripts/deploy-preview.sh
#
# Refuses unless HEAD contains origin/main. Builds from `git archive HEAD`, never from the working tree,
# and stamps the revision with the label commit=<full sha>, which scripts/promote.sh requires.
#
# public/ and site/public/ hold almost all of the source's bytes and rarely change, so they skip the source
# upload. Each directory's files go to $MEDIA once, as one tar named after the directory's git listing, and
# the upload carries .media-manifest/ instead. The first step of cloudbuild.preview.yaml puts the files
# back before the Docker build, so the image is the same. Only tars missing from $MEDIA are uploaded.
set -euo pipefail

PROJECT=conthunt-dev
REGION=us-central1
SERVICE=conthunt-lp
BACKEND_URL=https://mcp.conthunt.app
MEDIA=gs://${PROJECT}_cloudbuild/media

die() { echo "deploy-preview: $*" >&2; exit 1; }

cd "$(git rev-parse --show-toplevel)"

git fetch --quiet origin
commit=$(git rev-parse HEAD)
main=$(git rev-parse origin/main)
if ! git merge-base --is-ancestor "$main" "$commit"; then
  die "HEAD ($commit) does not contain origin/main ($main). Rebase or merge origin/main, then retry."
fi
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "deploy-preview: uncommitted changes are NOT in this build; it builds the committed HEAD only." >&2
fi
echo "deploy-preview: building commit $commit ($(git log -1 --format=%s "$commit"))"

work=$(mktemp -d "${TMPDIR:-/tmp}/conthunt-lp-preview.XXXXXX")
trap 'rm -rf "$work"' EXIT
src=$work/src
mkdir "$src" "$work/blobs"
git archive "$commit" | tar -x -C "$src"

manifest=$src/.media-manifest
mkdir "$manifest" "$work/media"
git -c core.quotePath=false ls-tree -r "$commit" -- public site/public \
  | awk -F'\t' '{ split($1, f, " "); print f[3], $2 }' > "$manifest/files"
cut -d' ' -f2- "$manifest/files" | sed 's|/[^/]*$||' | sort -u | while IFS= read -r dir; do
  key=$(git --literal-pathspecs -c core.quotePath=false ls-tree "$commit" -- "$dir/" | awk '$2 == "blob"' | git hash-object --stdin)
  echo "$key $dir"
done > "$manifest/bundles"

# A failed listing only means every tar is uploaded again.
gcloud storage ls "$MEDIA/" 2>/dev/null | sed 's|.*/||; s|\.tar$||' | sort -u > "$work/cached" || true
while read -r key dir; do
  grep -qx "$key" "$work/cached" && continue
  awk -v d="$dir" '{ p = substr($0, 42); sub(/\/[^\/]*$/, "", p) } p == d { print substr($0, 42) }' "$manifest/files" \
    | tr '\n' '\0' | xargs -0 git --literal-pathspecs archive --format=tar -o "$work/media/$key.tar" "$commit" --
done < "$manifest/bundles"
echo "deploy-preview: uploading $(find "$work/media" -type f | wc -l | tr -d ' ') of $(wc -l < "$manifest/bundles" | tr -d ' ') media tars"
if [ -n "$(ls "$work/media")" ]; then
  gcloud storage cp --no-user-output-enabled --project "$PROJECT" "$work/media/*" "$MEDIA/"
fi
cut -d' ' -f2- "$manifest/files" | (cd "$src" && tr '\n' '\0' | xargs -0 rm)

gcloud builds submit "$src" \
  --project "$PROJECT" \
  --config "$src/cloudbuild.preview.yaml" \
  --substitutions="_COMMIT_SHA=$commit,_NEXT_PUBLIC_BACKEND_URL=$BACKEND_URL"

IFS=, read -r revision url < <(gcloud run services describe "$SERVICE" --project "$PROJECT" --region "$REGION" \
  --format='value(status.traffic.filter("tag=preview").extract(revisionName,url).flatten())')
[ -n "${revision:-}" ] || die "no revision behind the preview tag"

label=$(gcloud run revisions describe "$revision" --project "$PROJECT" --region "$REGION" \
  --format='value(metadata.labels.commit)')
[ "$label" = "$commit" ] || die "revision $revision carries commit label '$label', expected $commit"

echo
echo "preview revision: $revision"
echo "preview url:      $url"
echo "commit:           $commit"
echo "check it:         node site/scripts/check-routes.mjs $url"
echo "promote it:       scripts/promote.sh $revision"
