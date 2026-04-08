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
ACTIVE_PORT=4321
STANDBY_PORT=4322

wait_for_ready() {
  local port=$1
  local retries=30
  while [ $retries -gt 0 ]; do
    if wget -q --spider "http://127.0.0.1:$port/" 2>/dev/null; then
      return 0
    fi
    retries=$((retries - 1))
    sleep 1
  done
  return 1
}

build_and_start() {
  echo "Installing dependencies..."
  pnpm install --frozen-lockfile

  echo "Building Astro site..."
  pnpm build

  if [ -z "$ASTRO_PID" ]; then
    # Initial start
    HOST=0.0.0.0 PORT=$ACTIVE_PORT node dist/server/entry.mjs &
    ASTRO_PID=$!
    echo "Astro server started on port $ACTIVE_PORT (PID $ASTRO_PID)"
    return
  fi

  # Zero-downtime swap: start new server on standby port
  local OLD_PID=$ASTRO_PID
  local OLD_PORT=$ACTIVE_PORT
  local NEW_PORT=$STANDBY_PORT

  HOST=0.0.0.0 PORT=$NEW_PORT node dist/server/entry.mjs &
  ASTRO_PID=$!
  echo "New Astro server starting on port $NEW_PORT (PID $ASTRO_PID)..."

  if wait_for_ready "$NEW_PORT"; then
    # Swap nginx upstream and reload
    sed -i "s/server 127.0.0.1:$OLD_PORT/server 127.0.0.1:$NEW_PORT/" /etc/nginx/nginx.conf
    nginx -s reload
    echo "nginx switched to port $NEW_PORT"

    # Stop old server
    kill "$OLD_PID" 2>/dev/null || true
    wait "$OLD_PID" 2>/dev/null || true

    # Swap ports for next deploy
    ACTIVE_PORT=$NEW_PORT
    STANDBY_PORT=$OLD_PORT
  else
    echo "New server failed to start, keeping old server"
    kill "$ASTRO_PID" 2>/dev/null || true
    ASTRO_PID=$OLD_PID
  fi
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
