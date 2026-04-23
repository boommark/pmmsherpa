#!/bin/bash
# Maven Prospect Invite — one-shot send
# Sends maven-prospect-invite.html to all non-signed-up Maven course prospects

export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/v24.0.2/bin:$PATH"

SCRIPT_DIR="$(dirname "$0")"
EMAIL_DIR="$SCRIPT_DIR/../email-drafts"
HTML=$(cat "$EMAIL_DIR/maven-prospect-invite.html")
SUBJECT="Your AI positioning work deserves better than ChatGPT"
RECIPIENTS_FILE="$SCRIPT_DIR/.maven_prospect_recipients.json"
LOG="$SCRIPT_DIR/maven_prospect_send.log"
ALERT_EMAIL="abhishekratna@gmail.com"

echo "=== $(date) — Maven Prospect Send ===" >> "$LOG"

if [ ! -f "$RECIPIENTS_FILE" ]; then
  echo "ERROR: Recipients file not found: $RECIPIENTS_FILE" >> "$LOG"
  gws gmail +send --to "$ALERT_EMAIL" --subject "[PMM Sherpa] Maven prospect send FAILED" --body "Recipients file not found: $RECIPIENTS_FILE"
  exit 1
fi

SUCCESS=0
FAIL=0
FAILED_LIST=""

for email in $(python3 -c "import json; [print(e) for e in json.load(open('$RECIPIENTS_FILE'))]"); do
  result=$(gws gmail +send --to "$email" --subject "$SUBJECT" --body "$HTML" --html 2>&1)
  if echo "$result" | grep -q '"id"'; then
    SUCCESS=$((SUCCESS + 1))
  else
    FAIL=$((FAIL + 1))
    FAILED_LIST="$FAILED_LIST\n$email"
  fi
  sleep 1

  # Progress log every 50
  TOTAL=$((SUCCESS + FAIL))
  if [ $((TOTAL % 50)) -eq 0 ]; then
    echo "  Progress: $TOTAL sent so far ($SUCCESS ok, $FAIL failed)" >> "$LOG"
  fi
done

echo "Done: $SUCCESS sent, $FAIL failed" >> "$LOG"

if [ $FAIL -gt 0 ]; then
  gws gmail +send --to "$ALERT_EMAIL" --subject "[PMM Sherpa] Maven send: $FAIL failures" --body "Maven prospect invite: $SUCCESS sent, $FAIL failed.\n\nFailed:\n$FAILED_LIST"
else
  gws gmail +send --to "$ALERT_EMAIL" --subject "[PMM Sherpa] Maven send complete" --body "Maven prospect invite sent to $SUCCESS recipients. 0 failures."
fi
