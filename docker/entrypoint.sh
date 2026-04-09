#!/bin/sh
set -e

SITE_DIR="${SITE_DIR:-/site}"
WATCH_BRANCH="${WATCH_BRANCH:-main}"

log() { echo "[vibeflow] $1"; }

if [ ! -f "$SITE_DIR/package.json" ]; then
  log "ERROR: No package.json found in $SITE_DIR"
  exit 1
fi

# Detect owner of the mounted site directory and re-exec as that user
SITE_UID=$(stat -c '%u' "$SITE_DIR")
SITE_GID=$(stat -c '%g' "$SITE_DIR")

log "Site directory: $SITE_DIR (UID=$SITE_UID GID=$SITE_GID)"
log "Running as: $(id -un) ($(id -u):$(id -g))"
log "Node: $(node -v) | pnpm: $(pnpm -v)"

if [ "$(id -u)" = "0" ] && [ "$SITE_UID" != "0" ]; then
  # Set nginx dirs writable for the target user
  chown -R "$SITE_UID:$SITE_GID" /var/lib/nginx /var/log/nginx /etc/nginx /tmp/nginx-*.log 2>/dev/null || true
  log "Switching to UID $SITE_UID:$SITE_GID..."
  exec su-exec "$SITE_UID:$SITE_GID" "$0" "$@"
fi

cd "$SITE_DIR"

# Keep pnpm store inside the container, not in the mounted volume
export PNPM_HOME="/tmp/pnpm"
pnpm config set store-dir /tmp/pnpm-store

# State files for port coordination between entrypoint and rebuild
echo "4321" > /tmp/active_port
echo "" > /tmp/astro_pid

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
  log('Name: ' + c.name);
  log('SMTP: ' + (c.smtp.host ? c.smtp.user + '@' + c.smtp.host + ':' + c.smtp.port : 'not configured'));
  log('eRecht24: ' + (c.erecht24.apiKey ? 'configured' : 'not configured (using fallback)'));
  log('Nav header: ' + c.navigation.header.length + ' links | footer: ' + c.navigation.footer.length + ' links');
}).catch(() => console.log('[vibeflow] WARNING: Could not read config'));
"

log "Starting Astro server on port 4321..."
HOST=0.0.0.0 PORT=4321 node dist/server/entry.mjs &
echo "$!" > /tmp/astro_pid
log "Astro server started (PID $!)"

# Pipe nginx logs to stdout/stderr for docker logs
touch /tmp/nginx-access.log /tmp/nginx-error.log
tail -f /tmp/nginx-access.log &
tail -f /tmp/nginx-error.log >&2 &

log "Starting nginx..."
nginx -g "daemon off;" &

# Watch for branch ref changes
# Git uses atomic rename (write .lock then rename), so we watch the
# directory for moved_to/create events on the branch file.
REF_DIR="$SITE_DIR/.git/refs/heads"
CURRENT_SHA=$(cat "$REF_DIR/$WATCH_BRANCH" 2>/dev/null || echo "")
log "Watching branch '$WATCH_BRANCH' for changes (${CURRENT_SHA:0:8})"

while inotifywait -qq -e moved_to,create "$REF_DIR"; do
  NEW_SHA=$(cat "$REF_DIR/$WATCH_BRANCH" 2>/dev/null || echo "")
  if [ -n "$NEW_SHA" ] && [ "$NEW_SHA" != "$CURRENT_SHA" ]; then
    log "Branch '$WATCH_BRANCH' updated (${CURRENT_SHA:0:8} -> ${NEW_SHA:0:8}), rebuilding..."
    CURRENT_SHA=$NEW_SHA
    /rebuild.sh
  fi
done &

log "Ready"

cleanup() {
  log "Shutting down..."
  ASTRO_PID=$(cat /tmp/astro_pid 2>/dev/null)
  kill "$ASTRO_PID" 2>/dev/null || true
  nginx -s quit 2>/dev/null || true
  exit 0
}
trap cleanup TERM INT

wait
