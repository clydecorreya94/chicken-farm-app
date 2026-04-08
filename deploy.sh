#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/home/clyde/chicken-farm-app"
DEPLOY_DIR="/var/www/farm"

cd "$APP_ROOT"

echo "Installing dependencies if needed..."
npm install

echo "Building production bundle..."
npm run build

echo "Replacing deployed files in $DEPLOY_DIR ..."
sudo rm -rf "${DEPLOY_DIR:?}/"*
sudo cp -r dist/. "$DEPLOY_DIR/"

echo "Validating nginx configuration..."
sudo nginx -t

echo "Reloading nginx..."
sudo systemctl reload nginx

echo "Deployment complete."
echo "Open: http://192.168.0.122:8080/"
