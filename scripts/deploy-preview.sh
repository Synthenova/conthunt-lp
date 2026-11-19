#!/usr/bin/env bash
# Build the committed HEAD and deploy it as a no-traffic Cloud Run revision behind the "preview" tag.
#
#   scripts/deploy-preview.sh
#
# Refuses unless HEAD contains origin/main. Builds from `git archive HEAD`, never from the working tree,
# and stamps the revision with the label commit=<full sha>, which scripts/promote.sh requires.
#
# The files under public/ and site/public/ (almost all of the source's bytes, and rarely changed) do not go
# in the source upload. Each one is stored once in $BLOBS under its git blob id, and the upload carries
# .blob-manifest ("<blob id> <path>" lines) instead. The first step of cloudbuild.preview.yaml puts the
# files back before the Docker build, so the image is the same. Only blobs missing from $BLOBS are uploaded.
set -euo pipefail

PROJECT=conthunt-dev
REGION=us-central1
SERVICE=conthunt-lp
BACKEND_URL=https://mcp.conthunt.app
BLOBS=gs://${PROJECT}_cloudbuild/blobs

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

git -c core.quotePath=false ls-tree -r "$commit" -- public site/public \
  | awk -F'\t' '{ split($1, f, " "); print f[3], $2 }' > "$src/.blob-manifest"
# A failed listing only means every blob is uploaded again.
gcloud storage ls "$BLOBS/" 2>/dev/null | sed 's|.*/||' | sort -u > "$work/cached" || true
cut -d' ' -f1 "$src/.blob-manifest" | sort -u | comm -23 - "$work/cached" > "$work/missing"
while read -r blob; do git cat-file blob "$blob" > "$work/blobs/$blob"; done < "$work/missing"
echo "deploy-preview: $(wc -l < "$work/missing" | tr -d ' ') new of $(wc -l < "$src/.blob-manifest" | tr -d ' ') files under public/ and site/public/"
if [ -s "$work/missing" ]; then
  gcloud storage cp --project "$PROJECT" "$work/blobs/*" "$BLOBS/"
fi
while read -r _ path; do rm "$src/$path"; done < "$src/.blob-manifest"

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
