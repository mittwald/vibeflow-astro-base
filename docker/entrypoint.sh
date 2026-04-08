#!/bin/sh
set -e

SITE_DIR="${SITE_DIR:-/site}"
WATCH_BRANCH="${WATCH_BRANCH:-main}"

if [ ! -f "$SITE_DIR/package.json" ]; then
  echo "Error: No package.json found in $SITE_DIR"
  exit 1
fi

cd "$SITE_DIR"

ASTRO_PID=""
NGINX_PID=""

build_and_start() {
  echo "Installing dependencies..."
  pnpm install --frozen-lockfile

  echo "Building Astro site..."
  pnpm build

  # Stop previous Astro server if running
  if [ -n "$ASTRO_PID" ] && kill -0 "$ASTRO_PID" 2>/dev/null; then
    echo "Restarting Astro server..."
    kill "$ASTRO_PID" 2>/dev/null
    wait "$ASTRO_PID" 2>/dev/null || true
  fi

  HOST=0.0.0.0 PORT=4321 node dist/server/entry.mjs &
  ASTRO_PID=$!
  echo "Astro server started (PID $ASTRO_PID)"
}

cleanup() {
  echo "Shutting down..."
  kill "$ASTRO_PID" 2>/dev/null || true
  wait "$ASTRO_PID" 2>/dev/null || true
  nginx -s quit 2>/dev/null || true
  exit 0
}
trap cleanup TERM INT

# Initial build
build_and_start

# Start nginx
echo "Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Watch for ref changes
REF_FILE="$SITE_DIR/.git/refs/heads/$WATCH_BRANCH"
echo "Watching $REF_FILE for changes..."

while true; do
  inotifywait -qq -e modify,create "$REF_FILE" 2>/dev/null || true
  echo "Branch $WATCH_BRANCH updated, rebuilding..."
  build_and_start
done
