#!/usr/bin/env bash
# ---------------------------------------------------------------------------
#  LABONNO — one-command GitHub push
#  রাখুন প্রজেক্টের রুটে (package.json যেখানে), তারপর:  bash push.sh
#  শুধু আপনার GitHub username জানলেই হবে — রিপোর নাম ধরা আছে: labonno
# ---------------------------------------------------------------------------
set -uo pipefail
cd "$(dirname "$0")" || exit 1

REPO_NAME="${GIT_REPO_NAME:-labonno}"
REMOTE_BASE="${GIT_REMOTE_BASE:-https://github.com}"
say()  { printf "%s\n" "$*"; }
fail() { printf "\n✖ %s\n" "$*"; exit 1; }

say "LABONNO → GitHub push"
say "===================="

[ -f package.json ] || fail "এই ফাইলটা প্রজেক্টের রুটে রাখুন (যেখানে package.json আছে)।"
command -v git >/dev/null 2>&1 || fail "Git ইনস্টল নেই — https://git-scm.com/downloads"

if [ ! -d .git ]; then
  say "• git repo তৈরি হচ্ছে…"
  git init -q
  git branch -M main 2>/dev/null || true
fi
BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo main)"

if [ -z "$(git config user.email || true)" ]; then
  git config user.email "${GIT_USER_EMAIL:-owner@labonno.com}"
  git config user.name  "${GIT_USER_NAME:-LABONNO Owner}"
fi

# ---- remote: username is enough -------------------------------------------------
REMOTE="${GIT_REMOTE_URL:-}"
if [ -z "$REMOTE" ] && git remote get-url origin >/dev/null 2>&1; then
  REMOTE="$(git remote get-url origin)"
  say "• পুরনো রিমোট: $REMOTE"
fi
if [ -z "$REMOTE" ]; then
  printf "আপনার GitHub username (অথবা পুরো রিপো লিংক): "
  read -r ANSWER
  [ -n "$ANSWER" ] || fail "কিছু দেননি।"
  case "$ANSWER" in
    http*|git@*) REMOTE="$ANSWER" ;;
    */*)         REMOTE="$REMOTE_BASE/$ANSWER.git" ;;
    *)           REMOTE="$REMOTE_BASE/$ANSWER/$REPO_NAME.git" ;;
  esac
  say "• রিমোট: $REMOTE"
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

git add -A
if git diff --cached --quiet; then
  say "• নতুন পরিবর্তন নেই — শুধু push হবে।"
else
  git commit -q -m "${GIT_COMMIT_MESSAGE:-LABONNO — update}"
  say "• কমিট হয়েছে।"
fi

say "• push হচ্ছে → $BRANCH"
if git push -u origin HEAD; then
  say ""
  say "✔ হয়ে গেছে! আপনার কোড GitHub-এ আছে:"
  say "  ${REMOTE%.git}"
else
  say ""
  say "✖ push হয়নি — সাধারণ কারণ:"
  say "  1) পাসওয়ার্ড নয়, টোকেন লাগে: GitHub → Settings → Developer settings →"
  say "     Personal access tokens → Tokens (classic) → scope 'repo' → Generate → কপি।"
  say "  2) রিমোতে আগে ফাইল থাকলে: git pull --rebase origin $BRANCH → আবার push."
  say "  3) লিংক ভুল হলে: git remote set-url origin <ঠিক লিংক>"
  exit 1
fi
