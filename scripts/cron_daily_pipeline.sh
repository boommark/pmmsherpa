#!/bin/bash
# Cron wrapper for PMM Sherpa daily blog/AMA/substack pipeline
# Loads env vars from .env, runs pipeline, logs output
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$SCRIPT_DIR/../logs/pipeline"
mkdir -p "$LOG_DIR"

# Source .env for API keys
set -a
source "$SCRIPT_DIR/.env"
set +a

# Run the daily pipeline (blogs, AMAs, substacks)
cd "$SCRIPT_DIR"
/usr/bin/python3 daily_pipeline.py >> "$LOG_DIR/cron_daily_$(date +%Y-%m-%d).log" 2>&1
