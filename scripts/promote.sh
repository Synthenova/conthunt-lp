#!/usr/bin/env bash
# Move all conthunt.app traffic to a tested preview revision, check the live site, and roll back on failure.
#
#   scripts/promote.sh <revision>
#
# Refuses unless the revision's commit label (set by scripts/deploy-preview.sh) contains origin/main.
# The last line is always "RESULT ok <rev>" or "RESULT rolled back to <rev>: <reason>" (or a refusal).
set -euo pipefail

PROJECT=conthunt-dev
REGION=us-central1
SERVICE=conthunt-lp
LIVE_URL=https://conthunt.app

target=${1:-}
[ -n "$target" ] || { echo "usage: scripts/promote.sh <revision>" >&2; exit 2; }

refuse() { echo "promote: $*" >&2; echo "RESULT refused: $*"; exit 1; }
run() { echo "+ $*"; "$@"; }

repo=$(git rev-parse --show-toplevel)
cd "$repo"
work=$(mktemp -d "${TMPDIR:-/tmp}/conthunt-lp-promote.XXXXXX")
trap 'rm -rf "$work"' EXIT

gc() { gcloud "$@" --project "$PROJECT" --region "$REGION"; }

# Checks read the expectations (redirects, post list) of the commit being checked, not of this checkout.
export_checks() {
  local commit=$1 dir=$work/$1
  mkdir -p "$dir"
  git archive "$commit" nginx.conf site/content/blog | tar -x -C "$dir"
  echo "$dir"
}

git fetch --quiet origin
main=$(git rev-parse origin/main)

previous=$(gc run services describe "$SERVICE" \
  --format='value(status.traffic.filter("percent=100").extract(revisionName).flatten())')
[ -n "$previous" ] || refuse "no single revision serves 100% of traffic; settle the split by hand first"

commit=$(gc run revisions describe "$target" --format='value(metadata.labels.commit)') \
  || refuse "revision $target not found"
[[ "$commit" =~ ^[0-9a-f]{40}$ ]] || refuse "revision $target has no commit label (got '$commit'); deploy it with scripts/deploy-preview.sh"
git cat-file -e "$commit^{commit}" 2>/dev/null || refuse "commit $commit of $target is not in this clone; fetch it first"
git merge-base --is-ancestor "$main" "$commit" \
  || refuse "revision $target was built from $commit, which does not contain origin/main ($main)"

latest=$(gc run services describe "$SERVICE" --format='value(status.latestCreatedRevisionName)')
echo "promote: $target (commit $commit), currently live: $previous"

if [ "$target" = "$latest" ]; then
  run gc run services update-traffic "$SERVICE" --to-latest
else
  echo "promote: $target is not the latest created revision ($latest), so traffic is pinned to it."
  echo "promote: later deploys stay at 0% until a newer revision is promoted with --to-latest."
  run gc run services update-traffic "$SERVICE" --to-revisions="$target=100"
fi

checks=$(export_checks "$commit")
if node site/scripts/check-routes.mjs "$LIVE_URL" --root "$checks"; then
  echo "RESULT ok $target"
  exit 0
fi

reason="live checks failed on $target (see the failures above)"
echo "promote: $reason; moving traffic back to $previous" >&2
run gc run services update-traffic "$SERVICE" --to-revisions="$previous=100"

previous_commit=$(gc run revisions describe "$previous" --format='value(metadata.labels.commit)' || true)
if [[ "$previous_commit" =~ ^[0-9a-f]{40}$ ]] && git cat-file -e "$previous_commit^{commit}" 2>/dev/null; then
  expectations=$previous_commit
else
  expectations=$main
  echo "promote: $previous has no usable commit label; checking its redirects against origin/main" >&2
fi
if ! node site/scripts/check-routes.mjs "$LIVE_URL" --redirects-only --root "$(export_checks "$expectations")"; then
  reason="$reason; redirects still fail after the rollback"
fi
echo "RESULT rolled back to $previous: $reason"
exit 1
