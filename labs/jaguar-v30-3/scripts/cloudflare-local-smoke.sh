#!/usr/bin/env bash
# Local-only workerd/D1 smoke tests. NEVER deploy or touch remote D1.
set -Eeuo pipefail
export WRANGLER_SEND_METRICS=false
export CI=true
STATE="./.wrangler/v30-3-local-smoke"
CONFIG="./test/wrangler.local.toml"
WRANGLER="wrangler@4.52.0"
mkdir -p "$STATE"
npx --yes "$WRANGLER" --version
npx --yes "$WRANGLER" d1 execute ASSESSMENT_DB --local --file ./migrations/0003_v30_occurrences.sql --persist-to "$STATE" --config "$CONFIG"
npx --yes "$WRANGLER" dev --local --ip 127.0.0.1 --port 8791 --persist-to "$STATE" --config "$CONFIG" > "$STATE/wrangler-dev.log" 2>&1 &
PID=$!
cleanup() {
  kill "$PID" 2>/dev/null || true
  wait "$PID" 2>/dev/null || true
}
trap cleanup EXIT
if ! node ./scripts/assert-local-http.mjs; then
  echo "Local Wrangler Worker did not pass smoke checks. Recent logs:"
  tail -120 "$STATE/wrangler-dev.log"
  exit 1
fi
