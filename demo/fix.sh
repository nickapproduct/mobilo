#!/usr/bin/env bash
#
# The conference demo: a finding becomes a pull request.
#
#   ./demo/fix.sh fnd_2b0f50a4_02
#
# In the order an audience can follow: put the app back to broken, read the finding off
# dev.approduct.ai with the real screenshots from the device walk, look up how other apps solve the
# same moment, change the code, push a branch, open a pull request citing both.
#
# Re-runnable on purpose. `broken` is the branch the app resets to, so the same demo can be given
# again twenty minutes later without anybody unpicking a merge.

set -euo pipefail
cd "$(dirname "$0")/.."

FINDING="${1:-fnd_2b0f50a4_02}"
APPRODUCT_APP="${APPRODUCT_APP:-01M40NYJ0K1NCY98S5XJYND472}"
export APPRODUCT_APP
BRANCH="fix/${FINDING}"
REPO="nickapproduct/mobilo"

say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }

if [ -z "${APPRODUCT_MCP_KEY:-}" ]; then
  echo "APPRODUCT_MCP_KEY is not set." >&2
  echo "It is a read-only key pinned to Mobilo. Mint one on the box with:" >&2
  echo "  python -m approduct_server mcp-key --app-id $APPRODUCT_APP --read-only" >&2
  exit 1
fi

say "1/5  Putting the app back to broken"
git fetch --quiet origin broken
git checkout --quiet -B "$BRANCH" origin/broken
git --no-pager log --oneline -1

say "2/5  Asking Claude to fix $FINDING"
# Substituted here rather than with envsubst, which macOS does not ship — not something a demo should
# discover it needs.
PROMPT=${PROMPT_TEMPLATE:-$(cat demo/prompt.md)}
PROMPT=${PROMPT//\$FINDING/$FINDING}
PROMPT=${PROMPT//\$APPRODUCT_APP/$APPRODUCT_APP}

claude -p "$PROMPT" \
  --mcp-config demo/approduct.mcp.json \
  --strict-mcp-config \
  --permission-mode acceptEdits \
  --allowedTools "mcp__approduct__get_finding,mcp__approduct__find_findings,mcp__approduct__search_reference_screens,mcp__approduct__search_reference_journeys,mcp__approduct__get_screen,Read,Edit,Write,Grep,Glob"

if git diff --quiet; then
  say "Nothing changed — stopping rather than opening an empty pull request."
  exit 1
fi

say "3/5  What changed"
git --no-pager diff --stat

say "4/5  Committing and pushing"
git add -A
printf 'Fix %s\n\nFound by Approduct walking the app on a real device, with the screenshots to prove it.\nhttps://dev.approduct.ai/apps/%s\n' \
  "$FINDING" "$APPRODUCT_APP" | git commit --quiet -F -
git push --quiet --force-with-lease -u origin "$BRANCH"

say "5/5  The pull request"
# No gh and no token needed: GitHub's compare page takes the title and body in the query string, so
# the tab opens with the pull request already written and one button left to press.
URL=$(APPRODUCT_APP="$APPRODUCT_APP" FINDING="$FINDING" REPO="$REPO" BRANCH="$BRANCH" python3 -c '
import os, urllib.parse
q = urllib.parse.urlencode({
    "expand": "1",
    "title": f"Fix {os.environ[\"FINDING\"]}",
    "body": (
        f"Found by Approduct walking the app on a real device.\n\n"
        f"https://dev.approduct.ai/apps/{os.environ[\"APPRODUCT_APP\"]}\n"
    ),
})
print(f"https://github.com/{os.environ[\"REPO\"]}/compare/main...{os.environ[\"BRANCH\"]}?{q}")
')
echo "$URL"
command -v open >/dev/null && open "$URL" || true
