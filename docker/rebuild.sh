#!/bin/sh
set -e

SITE_DIR="${SITE_DIR:-/site}"
LOCK_FILE="/tmp/rebuild.lock"
PENDING_FILE="/tmp/rebuild.pending"

log() { echo "[vibeflow] $1"; }

# Signal that a rebuild is needed
touch "$PENDING_FILE"

# Try to acquire lock — if another rebuild is running, exit.
# The running rebuild will pick up the pending flag after it finishes.
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  log "Rebuild queued (another build is running)"
  exit 0
fi

# Build loop: keep rebuilding as long as new changes come in
while [ -f "$PENDING_FILE" ]; do
  rm -f "$PENDING_FILE"

  cd "$SITE_DIR"
  log "Pulling latest changes..."
  git pull --ff-only || true

  ACTIVE_PORT=$(cat /tmp/active_port)
  if [ "$ACTIVE_PORT" = "4321" ]; then
    NEW_PORT=4322
  else
    NEW_PORT=4321
  fi
  OLD_PID=$(cat /tmp/astro_pid)

  log "Installing dependencies..."
  pnpm install --frozen-lockfile

  log "Building site..."
  pnpm build

  # Log config summary
  node -e "
  import('./src/config.ts').then(m => {
    const c = m.config;
    const log = msg => console.log('[vibeflow] ' + msg);
    log('Site: ' + c.site);
    log('SMTP: ' + (c.smtp.host ? c.smtp.user + '@' + c.smtp.host + ':' + c.smtp.port : 'not configured'));
    log('eRecht24: ' + (c.erecht24.apiKey ? 'configured' : 'not configured (using fallback)'));
  }).catch(() => console.log('[vibeflow] WARNING: Could not read config'));
  "

  log "Starting Astro server on port $NEW_PORT..."
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
    log "ERROR: New server failed to start, keeping old server"
    kill "$NEW_PID" 2>/dev/null || true
    continue
  fi

  # Swap nginx upstream and reload
  sed -i "s/server 127.0.0.1:$ACTIVE_PORT/server 127.0.0.1:$NEW_PORT/" /etc/nginx/nginx.conf

  if nginx -t 2>/dev/null; then
    nginx -s reload
    log "nginx switched to port $NEW_PORT"
  else
    log "ERROR: nginx config invalid after port swap, reverting"
    sed -i "s/server 127.0.0.1:$NEW_PORT/server 127.0.0.1:$ACTIVE_PORT/" /etc/nginx/nginx.conf
    kill "$NEW_PID" 2>/dev/null || true
    continue
  fi

  # Stop old server
  if [ -n "$OLD_PID" ]; then
    kill "$OLD_PID" 2>/dev/null || true
    wait "$OLD_PID" 2>/dev/null || true
  fi

  # Update state
  echo "$NEW_PORT" > /tmp/active_port
  echo "$NEW_PID" > /tmp/astro_pid
  log "Deploy complete"
done
