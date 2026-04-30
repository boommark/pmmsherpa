#!/bin/bash
# One-shot backfill: ingest all missing Lenny + PMA videos into Supabase.
# Run via: caffeinate -is nohup ./backfill_youtube.sh > backfill.log 2>&1 &
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

set -a
source "$SCRIPT_DIR/.env"
set +a
export SUPABASE_URL="${SUPABASE_URL:-$NEXT_PUBLIC_SUPABASE_URL}"
export SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:-$SUPABASE_SERVICE_ROLE_KEY}"

echo "=========================================="
echo "$(date) — START Lenny backfill"
echo "=========================================="
/usr/bin/python3 youtube_podcast_pipeline.py --channel lenny --no-email
LENNY_RC=$?
echo "$(date) — Lenny exit code: $LENNY_RC"

echo ""
echo "=========================================="
echo "$(date) — START PMA backfill"
echo "=========================================="
/usr/bin/python3 youtube_podcast_pipeline.py --channel pma --no-email
PMA_RC=$?
echo "$(date) — PMA exit code: $PMA_RC"

echo ""
echo "$(date) — ALL DONE (lenny=$LENNY_RC, pma=$PMA_RC)"
