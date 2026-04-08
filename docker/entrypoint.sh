#!/bin/sh
set -e

SITE_DIR="${SITE_DIR:-/site}"
WATCH_BRANCH="${WATCH_BRANCH:-main}"

if [ ! -f "$SITE_DIR/package.json" ]; then
  echo "Error: No package.json found in $SITE_DIR"
  exit 1
fi

# Detect owner of the mounted site directory and re-exec as that user
SITE_UID=$(stat -c '%u' "$SITE_DIR")
SITE_GID=$(stat -c '%g' "$SITE_DIR")

if [ "$(id -u)" = "0" ] && [ "$SITE_UID" != "0" ]; then
  echo "Switching to UID $SITE_UID:$SITE_GID (owner of $SITE_DIR)..."
  exec su-exec "$SITE_UID:$SITE_GID" "$0" "$@"
fi

cd "$SITE_DIR"

# Keep pnpm store inside the container, not in the mounted volume
export PNPM_HOME="/tmp/pnpm"
pnpm config set store-dir /tmp/pnpm-store

# State files for port coordination between entrypoint and rebuild
echo "4321" > /tmp/active_port
echo "" > /tmp/astro_pid

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building Astro site..."
pnpm build

echo "Starting Astro server..."
HOST=0.0.0.0 PORT=4321 node dist/server/entry.mjs &
echo "$!" > /tmp/astro_pid
echo "Astro server started on port 4321 (PID $!)"

echo "Starting nginx..."
nginx -g "daemon off;" &

# Watch for branch ref changes
REF_FILE="$SITE_DIR/.git/refs/heads/$WATCH_BRANCH"
echo "Watching $REF_FILE for changes..."

while inotifywait -qq -e modify,create "$REF_FILE"; do
  echo "Branch $WATCH_BRANCH updated, rebuilding..."
  /rebuild.sh
done &

cleanup() {
  echo "Shutting down..."
  ASTRO_PID=$(cat /tmp/astro_pid 2>/dev/null)
  kill "$ASTRO_PID" 2>/dev/null || true
  nginx -s quit 2>/dev/null || true
  exit 0
}
trap cleanup TERM INT

wait
