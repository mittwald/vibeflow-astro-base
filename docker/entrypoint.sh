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

echo "Site directory: $SITE_DIR (owner UID=$SITE_UID GID=$SITE_GID)"
echo "Running as: $(id)"

if [ "$(id -u)" = "0" ] && [ "$SITE_UID" != "0" ]; then
  # Set nginx dirs writable for the target user
  chown -R "$SITE_UID:$SITE_GID" /var/lib/nginx /var/log/nginx /etc/nginx /tmp/nginx-*.log 2>/dev/null || true
  echo "Switching to UID $SITE_UID:$SITE_GID..."
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

# Pipe nginx logs to stdout/stderr for docker logs
touch /tmp/nginx-access.log /tmp/nginx-error.log
tail -f /tmp/nginx-access.log &
tail -f /tmp/nginx-error.log >&2 &

echo "Starting nginx..."
nginx -g "daemon off;" &

# Watch for branch ref changes
# Git uses atomic rename (write .lock then rename), so we watch the
# directory for moved_to/create events on the branch file.
REF_DIR="$SITE_DIR/.git/refs/heads"
CURRENT_SHA=$(cat "$REF_DIR/$WATCH_BRANCH" 2>/dev/null || echo "")
echo "Watching $REF_DIR/$WATCH_BRANCH for changes (current: $CURRENT_SHA)..."

while inotifywait -qq -e moved_to,create "$REF_DIR"; do
  NEW_SHA=$(cat "$REF_DIR/$WATCH_BRANCH" 2>/dev/null || echo "")
  if [ -n "$NEW_SHA" ] && [ "$NEW_SHA" != "$CURRENT_SHA" ]; then
    echo "Branch $WATCH_BRANCH updated ($CURRENT_SHA -> $NEW_SHA), rebuilding..."
    CURRENT_SHA=$NEW_SHA
    /rebuild.sh
  fi
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
