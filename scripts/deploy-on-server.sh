#!/usr/bin/env bash
# Run ON THE SERVER: pulls latest main and rebuilds services.
set -euo pipefail

APP_DIR=/var/www/portfolio
cd "$APP_DIR"

git fetch origin
git reset --hard origin/main

"$APP_DIR/backend/.venv/bin/pip" install -r "$APP_DIR/backend/requirements.txt"

cd "$APP_DIR/frontend"
npm ci
npm run build

systemctl restart portfolio-api
systemctl restart portfolio-web

echo "Deployed $(git rev-parse --short HEAD)"
