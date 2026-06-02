#!/usr/bin/env bash
set -euo pipefail

APP_NAME="imfa-app"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Install dependencies"
npm ci

echo "==> Run database migrations"
npx prisma migrate deploy

echo "==> Build Next.js app"
npm run build

echo "==> Copy standalone assets"
rm -rf .next/standalone/public
cp -r public .next/standalone/public

mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static

echo "==> Restart app with PM2"
pm2 restart "$APP_NAME" || pm2 start ecosystem.config.js --only "$APP_NAME"

echo "==> Save PM2 process list"
pm2 save

echo "==> Done"
