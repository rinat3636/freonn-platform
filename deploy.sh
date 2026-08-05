#!/usr/bin/env bash
# Freonn.pro auto-deploy: pull the latest main, rebuild, restart the service.
# Triggered every minute by freonn-pro-deploy.timer.
set -euo pipefail

REPO_DIR=/opt/freonn-pro
BRANCH=main
LOG=/var/log/freonn-pro-deploy.log
export HOME=/root
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export GIT_SSH_COMMAND="ssh -i /root/.ssh/freonn_pro_deploy -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

cd "$REPO_DIR"

git fetch --quiet origin "$BRANCH"

REMOTE=$(git rev-parse "origin/$BRANCH")
LOCAL=$(git rev-parse HEAD)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Nothing to do if already on main and up to date.
if [ "$CURRENT_BRANCH" = "$BRANCH" ] && [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

echo "[$(date -Is)] deploying $BRANCH $LOCAL ($CURRENT_BRANCH) -> $REMOTE" >> "$LOG"

git checkout -q "$BRANCH" 2>>"$LOG" || git checkout -qB "$BRANCH" "origin/$BRANCH" >>"$LOG" 2>&1
git reset --hard "origin/$BRANCH" >>"$LOG" 2>&1

# Reinstall deps only when the lockfile changed (keeps deploys fast).
if ! git diff --quiet "$LOCAL" "$REMOTE" -- pnpm-lock.yaml 2>/dev/null; then
  echo "[$(date -Is)] pnpm-lock.yaml changed -> pnpm install" >> "$LOG"
  pnpm install --frozen-lockfile >>"$LOG" 2>&1
fi

export SEO_CONTENT_REVISION="$(date +%Y-%m-%d)"
export NODE_ENV=production
pnpm run build:ci >>"$LOG" 2>&1
systemctl restart freonn-pro
echo "[$(date -Is)] deployed $REMOTE OK" >> "$LOG"
