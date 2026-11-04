#!/usr/bin/env bash
# ---------------------------------------------------------------------------
#  LABONNO — one-command GitHub push (macOS / Linux / WSL)
#  রাখুন প্রজেক্টের রুটে (package.json যেখানে আছে), তারপর:  bash push.sh
# ---------------------------------------------------------------------------
set -uo pipefail
cd "$(dirname "$0")" || exit 1

say()  { printf "%s\n" "$*"; }
fail() { printf "\n✖ %s\n" "$*"; exit 1; }

say "LABONNO → GitHub push"
say "===================="

[ -f package.json ] || fail "এই ফাইলটা প্রজেক্টের রুটে রাখুন (যেখানে package.json আছে)।"
command -v git >/dev/null 2>&1 || fail "Git ইনস্টল নেই — https://git-scm.com/downloads থেকে ইনস্টল করে আবার চালান।"

# ---- 1) repo তৈরি -----------------------------------------------------------
if [ ! -d .git ]; then
  say "• git repo তৈরি হচ্ছে…"
  git init -q
  git branch -M "${GIT_BRANCH:-main}" 2>/dev/null || true
fi

BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo "${GIT_BRANCH:-main}")"

# ---- 2) পরিচয় --------------------------------------------------------------
if [ -z "$(git config user.email || true)" ]; then
  git config user.email "${GIT_USER_EMAIL:-owner@labonno.com}"
  git config user.name  "${GIT_USER_NAME:-LABONNO Owner}"
fi

# ---- 3) রিমোট ---------------------------------------------------------------
REMOTE="${GIT_REMOTE_URL:-}"
if [ -z "$REMOTE" ]; then
  if git remote get-url origin >/dev/null 2>&1; then
    REMOTE="$(git remote get-url origin)"
    say "• পুরনো রিমোট: $REMOTE"
  else
    printf "GitHub repo-র লিংক পেস্ট করুন (যেমন https://github.com/maruf/labonno.git): "
    read -r REMOTE
  fi
fi
[ -n "$REMOTE" ] || fail "রিমোট লিংক দেননি।"
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE"
else
  git remote add origin "$REMOTE"
fi

# ---- 4) কমিট ---------------------------------------------------------------
git add -A
if git diff --cached --quiet; then
  say "• নতুন কোনো পরিবর্তন নেই — শুধু push হবে।"
else
  git commit -q -m "${GIT_COMMIT_MESSAGE:-Update from the LABONNO studio}"
  say "• পরিবর্তনগুলো কমিট হয়েছে।"
fi

# ---- 5) push ---------------------------------------------------------------
say "• push হচ্ছে → $BRANCH"
if git push -u origin HEAD; then
  say ""
  say "✔ হয়ে গেছে! আপনার কোড GitHub-এ আছে।"
  say "  খুলে দেখুন: $REMOTE"
else
  say ""
  say "✖ push হয়নি। সাধারণ কারণ ও সমাধান:"
  say "  1) পাসওয়ার্ড দিয়ে push হয় না — GitHub এখন টোকেন চায়।"
  say "     GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)"
  say "     → Generate new token → scope-এ 'repo' টিক → Generate → টোকেনটা কপি করে পাসওয়ার্ডের জায়গায় দিন।"
  say "  2) রিপোতে আগে থেকেই README/ফাইল থাকলে: git pull --rebase origin $BRANCH  চালিয়ে আবার push করুন।"
  say "  3) লিংক ভুল হলে: git remote set-url origin <ঠিক লিংক>  তারপর আবার চালান।"
  exit 1
fi
