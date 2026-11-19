#!/usr/bin/env bash
# Exercises scripts/promote.sh against fake gcloud and node executables. Moves no real traffic.
#
#   scripts/test/promote.test.sh
#
# Expectations are eval'd strings, so their $vars expand late on purpose.
# shellcheck disable=SC2016,SC2034
set -euo pipefail

here=$(cd "$(dirname "$0")" && pwd)
promote=$here/../promote.sh
tmp=$(mktemp -d "${TMPDIR:-/tmp}/promote-test.XXXXXX")
trap 'rm -rf "$tmp"' EXIT

mkdir -p "$tmp/bin"
cat > "$tmp/bin/gcloud" <<'FAKE'
#!/usr/bin/env bash
echo "gcloud $*" >> "$FAKE_LOG"
case "$*" in
  *"services describe"*'percent=100'*) echo "$FAKE_PREVIOUS" ;;
  *"services describe"*latestCreatedRevisionName*) echo "$FAKE_LATEST" ;;
  *"revisions describe"*)
    rev=$4
    var="FAKE_LABEL_${rev//-/_}"
    [ -n "${!var+set}" ] || { echo "ERROR: Cannot find revision [$rev]" >&2; exit 1; }
    echo "${!var}" ;;
  *"update-traffic"*) ;;
  *) echo "fake gcloud: unexpected call: $*" >&2; exit 64 ;;
esac
FAKE
cat > "$tmp/bin/node" <<'FAKE'
#!/usr/bin/env bash
FAKE_ARGS=" $* "
root=
while [ $# -gt 0 ]; do [ "$1" = --root ] && root=$2; shift; done
[ -f "$root/nginx.conf" ] && [ -d "$root/site/content/blog" ] || { echo "fake node: bad --root $root" >&2; exit 65; }
if [[ "$FAKE_ARGS" == *" --redirects-only "* ]]; then
  echo "node redirects $(cat "$root/nginx.conf")" >> "$FAKE_LOG"; exit "${FAKE_REDIRECTS_RC:-0}"
fi
echo "node full $(cat "$root/nginx.conf")" >> "$FAKE_LOG"; exit "${FAKE_CHECK_RC:-0}"
FAKE
chmod +x "$tmp/bin/gcloud" "$tmp/bin/node"

# origin has main at M. The clone has C (built on M) and B (a branch that never merged M).
git init -q --bare "$tmp/origin.git"
git init -q -b main "$tmp/repo"
cd "$tmp/repo"
git config user.email test@example.com && git config user.name test
mkdir -p scripts site/content/blog site/scripts
cp "$promote" scripts/promote.sh
touch site/content/blog/post.md site/scripts/check-routes.mjs
commit() { echo "$1" > nginx.conf; git add -A; git commit -q -m "$1"; git rev-parse HEAD; }
base=$(commit base)
B=$(git switch -q -c stale && commit stale)
git switch -q main
M=$(commit main)
git remote add origin "$tmp/origin.git" && git push -q origin main
C=$(git switch -q -c feature && commit feature)

pass=0 fail=0
expect() {
  if eval "$2"; then pass=$((pass + 1)); echo "ok   $1"; else fail=$((fail + 1)); echo "FAIL $1"; sed 's/^/     | /' "$FAKE_LOG" "$tmp/out"; fi
}
promote_case() {
  export FAKE_LOG=$tmp/log
  : > "$FAKE_LOG"
  set +e
  env PATH="$tmp/bin:$PATH" FAKE_PREVIOUS=rev-old FAKE_LATEST="${LATEST:-rev-new}" "$@" scripts/promote.sh rev-new > "$tmp/out" 2>&1
  code=$?
  set -e
  last=$(tail -n 1 "$tmp/out")
}
traffic() { grep 'update-traffic' "$FAKE_LOG" | sed 's/.*update-traffic conthunt-lp //; s/ --project.*//'; }

promote_case FAKE_LABEL_rev_new="$C" FAKE_LABEL_rev_old="$M"
expect "success: exit 0 and RESULT ok" '[ $code = 0 ] && [ "$last" = "RESULT ok rev-new" ]'
expect "success: latest target moves with --to-latest only" '[ "$(traffic)" = "--to-latest" ]'
expect "success: full check runs on the target commit's nginx.conf" 'grep -qx "node full feature" "$FAKE_LOG"'

LATEST=rev-newer promote_case FAKE_LABEL_rev_new="$C"
expect "non-latest target is pinned with --to-revisions and says so" \
  '[ "$(traffic)" = "--to-revisions=rev-new=100" ] && grep -q "not the latest created revision" "$tmp/out" && [ $code = 0 ]'

promote_case FAKE_LABEL_rev_new="$C" FAKE_LABEL_rev_old="$base" FAKE_CHECK_RC=1
expect "failed check: traffic moves to the target, then back to the recorded revision" \
  '[ "$(traffic | tr "\n" " ")" = "--to-latest --to-revisions=rev-old=100 " ]'
expect "failed check: redirects re-checked against the previous revision's commit" 'grep -qx "node redirects base" "$FAKE_LOG"'
expect "failed check: exit 1 and RESULT rolled back" \
  '[ $code = 1 ] && [[ "$last" == "RESULT rolled back to rev-old: live checks failed on rev-new"* ]]'

promote_case FAKE_LABEL_rev_new="$C" FAKE_LABEL_rev_old="" FAKE_CHECK_RC=1 FAKE_REDIRECTS_RC=1
expect "failed rollback re-check is named; unlabelled previous falls back to origin/main" \
  '[ $code = 1 ] && [[ "$last" == *"redirects still fail after the rollback" ]] && grep -qx "node redirects main" "$FAKE_LOG"'

promote_case FAKE_LABEL_rev_new=""
expect "missing commit label: refused, no traffic moved" '[ $code = 1 ] && [[ "$last" == "RESULT refused: revision rev-new has no commit label"* ]] && [ -z "$(traffic)" ]'

promote_case FAKE_LABEL_rev_new=unknown
expect "commit label 'unknown': refused, no traffic moved" '[ $code = 1 ] && [[ "$last" == "RESULT refused:"* ]] && [ -z "$(traffic)" ]'

promote_case FAKE_LABEL_rev_new="$B"
expect "label without origin/main: refused, no traffic moved" \
  '[ $code = 1 ] && [[ "$last" == *"does not contain origin/main"* ]] && [ -z "$(traffic)" ]'

promote_case
expect "unknown revision: refused, no traffic moved" '[ $code = 1 ] && [[ "$last" == "RESULT refused: revision rev-new not found" ]] && [ -z "$(traffic)" ]'

promote_case FAKE_PREVIOUS="" FAKE_LABEL_rev_new="$C"
expect "no single 100% revision: refused, no traffic moved" '[ $code = 1 ] && [[ "$last" == "RESULT refused: no single revision"* ]] && [ -z "$(traffic)" ]'

# origin/main moves past the target after it was built: the fresh fetch must catch it.
git switch -q main && commit main2 > /dev/null && git push -q origin main && git reset -q --hard "$M" && git switch -q feature
promote_case FAKE_LABEL_rev_new="$C"
expect "origin/main advanced since the build: refused after a fresh fetch" \
  '[ $code = 1 ] && [[ "$last" == *"does not contain origin/main"* ]] && [ -z "$(traffic)" ]'

echo
echo "$pass passed, $fail failed"
[ "$fail" = 0 ]
