#!/bin/bash
# Cron wrapper for PMM Sherpa YouTube podcast pipeline
# Loads env vars from .env, runs pipeline, logs output
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$SCRIPT_DIR/../logs/pipeline"
mkdir -p "$LOG_DIR"

# Source .env for API keys
set -a
source "$SCRIPT_DIR/.env"
set +a

# Map env vars to what youtube_podcast_pipeline.py expects
export SUPABASE_URL="${SUPABASE_URL:-$NEXT_PUBLIC_SUPABASE_URL}"
export SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY:-$SUPABASE_SERVICE_ROLE_KEY}"

# Run the YouTube podcast pipeline
cd "$SCRIPT_DIR"
/usr/bin/python3 youtube_podcast_pipeline.py >> "$LOG_DIR/cron_youtube_$(date +%Y-%m-%d).log" 2>&1
