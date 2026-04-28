#!/usr/bin/env bash
# Run fetch-photos every ~62 min until all 100 blooms have photos.
# Each run pulls 9 blooms (45 reqs, safely under demo's 50/hour cap).
# Sleeps 62 min between rounds so the rolling 1-hour quota refills.

set -a
. ./.env.local
set +a

cd "$(dirname "$0")/.." || exit 1

ROUND=1
while true; do
  echo ""
  echo "===== ROUND $ROUND  $(date) ====="
  npm run fetch-photos -- --skip-existing --limit=9
  REMAINING=$(node -e "
    const m = require('./lib/generated/photos-manifest.json');
    const b = require('./petal_passport_blooms.json');
    console.log(b.length - Object.keys(m).length);
  ")
  echo "Remaining: $REMAINING blooms"
  if [ "$REMAINING" = "0" ]; then
    echo "✓ All blooms have photos. Exiting loop."
    exit 0
  fi
  echo "Sleeping 62 minutes…"
  sleep 3720
  ROUND=$((ROUND + 1))
done
