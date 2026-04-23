#!/bin/bash
# PMM Sherpa Onboarding Series — daily check + send
# Runs at 4pm PT (7pm ET) daily. Script checks if today is a send day.

export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/v24.0.2/bin:$PATH"

cd "$(dirname "$0")"
python3 send_onboarding_series.py
