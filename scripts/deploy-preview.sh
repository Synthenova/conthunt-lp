#!/usr/bin/env bash
# Build the committed HEAD and deploy it as a no-traffic Cloud Run revision behind the "preview" tag.
#
#   scripts/deploy-preview.sh
#
# Refuses unless HEAD contains origin/main. Builds from `git archive HEAD`, never from the working tree,
# and stamps the revision with the label commit=<full sha>, which scripts/promote.sh requires.
set -euo pipefail

PROJECT=conthunt-dev
REGION=us-central1
SERVICE=conthunt-lp
BACKEND_URL=https://mcp.conthunt.app

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

src=$(mktemp -d "${TMPDIR:-/tmp}/conthunt-lp-preview.XXXXXX")
trap 'rm -rf "$src"' EXIT
git archive "$commit" | tar -x -C "$src"

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
