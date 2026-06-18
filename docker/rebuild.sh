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
  # No pull needed: worker pushes directly into this non-bare repo, and
  # receive.denyCurrentBranch=updateInstead keeps the working tree in sync.

  ACTIVE_PORT=$(cat /tmp/active_port)
  if [ "$ACTIVE_PORT" = "4321" ]; then
    NEW_PORT=4322
  else
    NEW_PORT=4321
  fi
  OLD_PID=$(cat /tmp/astro_pid)

  # Build into the standby slot's release dir. The live release (ACTIVE_PORT)
  # is never touched, so a failed install/build leaves the running site intact.
  # The node_modules symlink lets prerender/runtime resolve bare imports.
  REL_BASE="/tmp/releases/$NEW_PORT"
  NEW_RELEASE="$REL_BASE/dist"

  log "Installing dependencies..."
  if ! pnpm install --frozen-lockfile; then
    log "ERROR: dependency install failed, keeping current release"
    continue
  fi

  log "Building site..."
  rm -rf "$NEW_RELEASE"
  mkdir -p "$REL_BASE"
  ln -sfn "$SITE_DIR/node_modules" "$REL_BASE/node_modules"
  if ! pnpm exec astro build --outDir "$NEW_RELEASE"; then
    log "ERROR: build failed, keeping current release"
    continue
  fi

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
  # Close fd 9 (lock fd) so the long-running server doesn't keep the rebuild lock held.
  HOST=0.0.0.0 PORT=$NEW_PORT node "$NEW_RELEASE/server/entry.mjs" 9<&- &
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

  # Atomically point nginx at the new release: upstream port (SSR) and static
  # root both swap in a single reload.
  sed -i \
    -e "s|server 127.0.0.1:$ACTIVE_PORT|server 127.0.0.1:$NEW_PORT|" \
    -e "s|root /tmp/releases/[0-9]*/dist/client|root $NEW_RELEASE/client|" \
    /etc/nginx/nginx.conf

  if nginx -t 2>/dev/null; then
    nginx -s reload
    log "nginx switched to port $NEW_PORT"
  else
    log "ERROR: nginx config invalid after swap, reverting"
    sed -i \
      -e "s|server 127.0.0.1:$NEW_PORT|server 127.0.0.1:$ACTIVE_PORT|" \
      -e "s|root $NEW_RELEASE/client|root /tmp/releases/$ACTIVE_PORT/dist/client|" \
      /etc/nginx/nginx.conf
    kill "$NEW_PID" 2>/dev/null || true
    continue
  fi

  # Stop old server — but first let nginx's old worker processes drain any
  # in-flight requests still routed to the old upstream, otherwise they 502.
  if [ -n "$OLD_PID" ]; then
    sleep 2
    kill "$OLD_PID" 2>/dev/null || true
    wait "$OLD_PID" 2>/dev/null || true
  fi

  # Update state
  echo "$NEW_PORT" > /tmp/active_port
  echo "$NEW_PID" > /tmp/astro_pid
  log "Deploy complete"
done
