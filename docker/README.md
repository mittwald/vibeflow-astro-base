# Docker: Astro + nginx

Production Docker setup for Astro sites with hybrid rendering (static + SSR), nginx reverse proxy, and auto-rebuild on git push.

## Architecture

```
┌─────────────────────────────────────┐
│  Docker Container (port 8080)       │
│                                     │
│  ┌───────────┐    ┌──────────────┐  │
│  │   nginx    │───▶│  Astro Node  │  │
│  │  (proxy)   │    │  (4321/4322) │  │
│  └───────────┘    └──────────────┘  │
│         │                           │
│  ┌──────┴──────┐  ┌──────────────┐  │
│  │ static files│  │  inotifywait │  │
│  │ (/_astro/)  │  │  (git watch) │  │
│  └─────────────┘  └──────────────┘  │
│                                     │
│  /site (mounted git repo)           │
└─────────────────────────────────────┘
```

- **nginx** serves static assets directly (`/_astro/` with hashed filenames), proxies everything else to Astro
- **Astro Node server** handles pre-rendered pages and SSR routes
- **inotifywait** watches `.git/refs/heads/<branch>` for changes and triggers zero-downtime rebuilds

## Quick Start

```bash
# Build the image
docker build -t astro-nginx -f docker/Dockerfile docker/

# Run with a mounted git repo
docker run -p 80:8080 -v /path/to/astro-repo:/site -e WATCH_BRANCH=main astro-nginx
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SITE_DIR` | `/site` | Path to the Astro project inside the container |
| `WATCH_BRANCH` | `main` | Git branch to watch for changes |

## How It Works

### Startup

1. Container starts as root
2. Detects UID/GID of the mounted `/site` directory
3. Switches to that user via `su-exec`
4. Runs `pnpm install --frozen-lockfile` and `pnpm build`
5. Starts Astro Node server on port 4321
6. Starts nginx on port 8080 as reverse proxy
7. Starts inotifywait watching the branch ref

### Auto-Rebuild on Git Push

When someone pushes to the watched branch:

1. inotifywait detects the ref change (git uses atomic rename)
2. SHA is compared to prevent duplicate rebuilds
3. `flock` prevents concurrent rebuilds
4. `pnpm install` + `pnpm build` runs
5. New Astro server starts on standby port (4322)
6. Health check waits up to 30s for the new server
7. nginx config is updated and validated with `nginx -t`
8. nginx reloads to swap upstream
9. Old Astro server is stopped

If the new server fails to start or nginx config validation fails, the old server keeps running.

### Caching Strategy

| Path | Cache | Reason |
|------|-------|--------|
| `/_astro/*` | 1 year, immutable | Hashed filenames — content changes = new filename |
| Static assets (`.js`, `.css`, images, fonts) | 1 hour, must-revalidate | Files from `public/` without hash |
| Everything else | No cache | Proxied to Astro (SSR or pre-rendered) |

## Astro Configuration

The Astro project should use the Node adapter with static output (hybrid rendering):

```js
import node from '@astrojs/node';

export default defineConfig({
  output: 'static',
  adapter: node({ mode: 'standalone' }),
});
```

- Pages are **pre-rendered by default** (static HTML)
- Individual pages can opt into **SSR** with `export const prerender = false`

## Testing

Run the integration test on a Linux machine (inotify requires native bind mounts):

```bash
./docker/test.sh
```

Tests: initial build, HTTP 200, auto-rebuild on commit, port swap verification, post-rebuild serving.

## Limitations

- **macOS/Docker Desktop**: inotifywait does not receive filesystem events through the VM. Use a Linux host for auto-rebuild.
- **Concurrent rapid pushes**: Protected by flock — only one rebuild runs at a time. Pushes during a rebuild trigger a new rebuild after the current one finishes.
- **pnpm store**: Stored in `/tmp` inside the container. Lost on container restart, meaning first build after restart downloads all dependencies.
