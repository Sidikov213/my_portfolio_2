#!/usr/bin/env bash
# Run LOCALLY: push main to GitHub, then pull+rebuild on VPS via SSH.
set -euo pipefail

HOST="${DEPLOY_SSH_HOST:-159.194.235.82}"
USER="${DEPLOY_SSH_USER:-root}"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> git push"
git push origin main

echo "==> remote deploy"
ssh "${USER}@${HOST}" 'bash -s' < "$ROOT_DIR/scripts/deploy-on-server.sh"

echo "==> live: http://${HOST}"
