#!/usr/bin/env bash
set -euo pipefail

APP_NAME="imfa-app"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Install dependencies"
# devDependencies (tsx) are required for `prisma db seed` on the server.
npm ci --include=dev

echo "==> Run database migrations"
npx prisma migrate deploy

echo "==> Seed database (idempotent — creates admin if missing, does not reset passwords)"
npm run db:seed

echo "==> Build Next.js app"
npm run build

echo "==> Copy standalone assets"
rm -rf .next/standalone/public
cp -r public .next/standalone/public

mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static

if [ -f .env ]; then
  echo "==> Copy .env for standalone runtime"
  cp .env .next/standalone/.env
else
  echo "WARNING: .env not found at repo root — ensure PM2 loads environment variables"
fi

echo "==> Restart app with PM2"
pm2 restart "$APP_NAME" || pm2 start ecosystem.config.js --only "$APP_NAME"

echo "==> Save PM2 process list"
pm2 save

echo "==> Done"
