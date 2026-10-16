#!/bin/sh
# Container entrypoint: the Next.js standalone server on 127.0.0.1:3000, then nginx on :8080 in front of it.
# Either process exiting stops the container (Cloud Run restarts it); SIGTERM/SIGINT stop both.
set -eu

NEXT_PORT="${NEXT_PORT:-3000}"
START_TIMEOUT="${START_TIMEOUT:-30}"

# HOSTNAME must be overridden: Docker sets it to the container id, which Next would try to bind.
(cd /app && HOSTNAME=127.0.0.1 PORT="$NEXT_PORT" NODE_ENV=production \
  NODE_OPTIONS="${NEXT_NODE_OPTIONS:---max-old-space-size=320}" exec node server.js) &
NEXT_PID=$!
NGINX_PID=""

# Graceful stop: QUIT lets nginx finish in-flight requests (TERM would drop them); once it is gone, Next stops.
# Cloud Run kills the container 10 s after SIGTERM, so a connection that never drains cannot hold it open.
stop_all() {
  if [ -n "$NGINX_PID" ]; then
    kill -QUIT "$NGINX_PID" 2>/dev/null || true
    wait "$NGINX_PID" 2>/dev/null || true
  fi
  kill -TERM "$NEXT_PID" 2>/dev/null || true
  wait "$NEXT_PID" 2>/dev/null || true
}
trap 'stop_all; exit 0' TERM INT

# Wait (bounded) until Next answers a static route, so nginx never starts with a dead upstream.
tries=0
max_tries=$((START_TIMEOUT * 4))
until wget -q -T 2 -O /dev/null "http://127.0.0.1:${NEXT_PORT}/robots.txt" 2>/dev/null; do
  tries=$((tries + 1))
  if ! kill -0 "$NEXT_PID" 2>/dev/null; then
    echo "entrypoint: next server exited during startup" >&2
    exit 1
  fi
  if [ "$tries" -ge "$max_tries" ]; then
    echo "entrypoint: next server not ready after ${START_TIMEOUT}s" >&2
    kill -TERM "$NEXT_PID" 2>/dev/null || true
    exit 1
  fi
  sleep 0.25
done

nginx -g 'daemon off;' &
NGINX_PID=$!

# Park until one of the two exits, then take the other down with it.
while kill -0 "$NEXT_PID" 2>/dev/null && kill -0 "$NGINX_PID" 2>/dev/null; do
  sleep 1 &
  wait $! || true
done

if kill -0 "$NEXT_PID" 2>/dev/null; then
  echo "entrypoint: nginx exited, stopping" >&2
else
  echo "entrypoint: next server exited, stopping" >&2
fi
stop_all
exit 1
