#!/bin/sh
set -e

SITE_DIR="${SITE_DIR:-/site}"

if [ ! -f "$SITE_DIR/package.json" ]; then
  echo "Error: No package.json found in $SITE_DIR"
  exit 1
fi

cd "$SITE_DIR"

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building Astro site..."
pnpm build

echo "Starting Astro server..."
HOST=0.0.0.0 PORT=4321 node dist/server/entry.mjs &

echo "Starting nginx..."
exec nginx -g "daemon off;"
