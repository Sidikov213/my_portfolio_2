#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/var/www/portfolio
REPO=https://github.com/Sidikov213/my_portfolio_2.git
DOMAIN_OR_IP="${DOMAIN_OR_IP:-159.194.235.82}"

export DEBIAN_FRONTEND=noninteractive

echo "==> packages"
apt-get update -y
apt-get install -y git nginx curl ca-certificates build-essential python3 python3-venv python3-pip

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

echo "==> swap (needed for Next build on 1GB RAM)"
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> app dir"
mkdir -p "$APP_DIR"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$REPO" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" reset --hard origin/main
fi

cd "$APP_DIR"

echo "==> backend venv"
python3 -m venv "$APP_DIR/backend/.venv"
"$APP_DIR/backend/.venv/bin/pip" install --upgrade pip
"$APP_DIR/backend/.venv/bin/pip" install -r "$APP_DIR/backend/requirements.txt"

if [ ! -f "$APP_DIR/backend/.env" ]; then
  SECRET=$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
)
  ADMIN_PASS=$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(12))
PY
)
  cat > "$APP_DIR/backend/.env" <<EOF
APP_NAME=Portfolio API
APP_ENV=production
SECRET_KEY=${SECRET}
DATABASE_URL=sqlite+aiosqlite:///./portfolio.db
CORS_ORIGINS=http://${DOMAIN_OR_IP},http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=${ADMIN_PASS}
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EOF
  echo "ADMIN_PASSWORD=${ADMIN_PASS}" > /root/portfolio-admin.txt
  chmod 600 /root/portfolio-admin.txt "$APP_DIR/backend/.env"
fi

echo "==> frontend env + build"
cat > "$APP_DIR/frontend/.env.production" <<EOF
NEXT_PUBLIC_API_URL=http://${DOMAIN_OR_IP}
EOF
cd "$APP_DIR/frontend"
npm ci
npm run build

echo "==> systemd units"
cat > /etc/systemd/system/portfolio-api.service <<EOF
[Unit]
Description=Portfolio FastAPI
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}/backend
Environment=PATH=${APP_DIR}/backend/.venv/bin
ExecStart=${APP_DIR}/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

cat > /etc/systemd/system/portfolio-web.service <<EOF
[Unit]
Description=Portfolio Next.js
After=network.target portfolio-api.service

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm run start -- --port 3000 --hostname 127.0.0.1
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

echo "==> nginx"
cat > /etc/nginx/sites-available/portfolio <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name ${DOMAIN_OR_IP} _;

    client_max_body_size 20m;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        proxy_set_header Host \$host;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8000/openapi.json;
        proxy_set_header Host \$host;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sfn /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
nginx -t
systemctl daemon-reload
systemctl enable portfolio-api portfolio-web nginx
systemctl restart portfolio-api
systemctl restart portfolio-web
systemctl restart nginx

echo "==> done"
echo "Site: http://${DOMAIN_OR_IP}"
echo "Admin: http://${DOMAIN_OR_IP}/admin"
if [ -f /root/portfolio-admin.txt ]; then
  echo "Initial admin credentials saved in /root/portfolio-admin.txt"
  cat /root/portfolio-admin.txt
fi
