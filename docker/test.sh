#!/bin/sh
set -e

# Test script for the astro-nginx Docker setup.
# Run this on a Linux machine where Docker bind mount inotify works.
#
# Usage: ./docker/test.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_DIR=$(mktemp -d)
BRANCH="master"
IMAGE="astro-nginx-test"
CONTAINER="astro-nginx-test"

cleanup() {
  echo ""
  echo "=== Cleanup ==="
  docker stop "$CONTAINER" 2>/dev/null || true
  docker rm "$CONTAINER" 2>/dev/null || true
  rm -rf "$TEST_DIR"
  echo "Done."
}
trap cleanup EXIT

echo "=== Building Docker image ==="
docker build -t "$IMAGE" -f "$SCRIPT_DIR/Dockerfile" "$SCRIPT_DIR/"

echo ""
echo "=== Setting up test repos in $TEST_DIR ==="

# "Server" repo — this gets mounted into the container
git clone "$REPO_DIR" "$TEST_DIR/server"
git -C "$TEST_DIR/server" config receive.denyCurrentBranch updateInstead

# "Client" repo — we push from here to trigger rebuilds
git clone "$TEST_DIR/server" "$TEST_DIR/clone"

echo ""
echo "=== Starting container ==="
docker run -d --name "$CONTAINER" -p 8080:80 \
  -v "$TEST_DIR/server:/site" \
  -e WATCH_BRANCH="$BRANCH" \
  "$IMAGE"

echo "Waiting for initial build..."
RETRIES=60
while [ $RETRIES -gt 0 ]; do
  if curl -s -o /dev/null -w "" http://localhost:8080/ 2>/dev/null; then
    break
  fi
  RETRIES=$((RETRIES - 1))
  sleep 2
done

if [ $RETRIES -eq 0 ]; then
  echo "FAIL: Server did not start within 120s"
  docker logs "$CONTAINER"
  exit 1
fi

echo ""
echo "=== Test 1: Initial page loads ==="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/)
if [ "$STATUS" = "200" ]; then
  echo "PASS: HTTP $STATUS"
else
  echo "FAIL: HTTP $STATUS"
  exit 1
fi

echo ""
echo "=== Test 2: Push a change and wait for rebuild ==="
cd "$TEST_DIR/clone"
echo "<!-- rebuild test $(date) -->" >> src/pages/index.astro
git add -A
git commit -m "test rebuild trigger"
git push

echo "Waiting for rebuild (max 60s)..."
sleep 10

RETRIES=25
REBUILT=false
while [ $RETRIES -gt 0 ]; do
  if docker logs "$CONTAINER" 2>&1 | grep -q "Deploy complete"; then
    REBUILT=true
    break
  fi
  RETRIES=$((RETRIES - 1))
  sleep 2
done

if [ "$REBUILT" = "true" ]; then
  echo "PASS: Rebuild triggered and completed"
else
  echo "FAIL: No rebuild detected"
  echo ""
  echo "=== Container logs ==="
  docker logs "$CONTAINER"
  exit 1
fi

echo ""
echo "=== Test 3: Site still serves after rebuild ==="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/)
if [ "$STATUS" = "200" ]; then
  echo "PASS: HTTP $STATUS"
else
  echo "FAIL: HTTP $STATUS"
  exit 1
fi

echo ""
echo "=== All tests passed ==="
