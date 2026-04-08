#!/bin/sh
set -e

SITE_DIR="${SITE_DIR:-/site}"
cd "$SITE_DIR"

ACTIVE_PORT=$(cat /tmp/active_port)
if [ "$ACTIVE_PORT" = "4321" ]; then
  NEW_PORT=4322
else
  NEW_PORT=4321
fi
OLD_PID=$(cat /tmp/astro_pid)

echo "Rebuilding site..."
pnpm install --frozen-lockfile
pnpm build

echo "Starting new Astro server on port $NEW_PORT..."
HOST=0.0.0.0 PORT=$NEW_PORT node dist/server/entry.mjs &
NEW_PID=$!

# Wait for new server to be ready
RETRIES=30
while [ $RETRIES -gt 0 ]; do
  if wget -q --spider "http://127.0.0.1:$NEW_PORT/" 2>/dev/null; then
    break
  fi
  RETRIES=$((RETRIES - 1))
  sleep 1
done

if [ $RETRIES -eq 0 ]; then
  echo "New server failed to start, keeping old server"
  kill "$NEW_PID" 2>/dev/null || true
  exit 1
fi

# Swap nginx upstream and reload
sed -i "s/server 127.0.0.1:$ACTIVE_PORT/server 127.0.0.1:$NEW_PORT/" /etc/nginx/nginx.conf
nginx -s reload
echo "nginx switched to port $NEW_PORT"

# Stop old server
kill "$OLD_PID" 2>/dev/null || true

# Update state
echo "$NEW_PORT" > /tmp/active_port
echo "$NEW_PID" > /tmp/astro_pid
echo "Deploy complete"
