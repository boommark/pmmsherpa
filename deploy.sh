#!/bin/bash

# PMMSherpa Deployment Script
# Usage: ./deploy.sh "Commit message here"
# Or: ./deploy.sh (will prompt for commit message)

set -e  # Exit on any error

cd "/Users/abhishekratna/Documents/AOL AI/pmmsherpa"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PMMSherpa Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check for uncommitted changes
if [[ -z $(git status --porcelain) ]]; then
    echo -e "${YELLOW}No changes to commit. Exiting.${NC}"
    exit 0
fi

# Show what's changed
echo -e "${YELLOW}Changes to be committed:${NC}"
git status --short
echo ""

# Get commit message
if [ -n "$1" ]; then
    COMMIT_MSG="$1"
else
    echo -e "${YELLOW}Enter commit message:${NC}"
    read -r COMMIT_MSG
    if [ -z "$COMMIT_MSG" ]; then
        echo -e "${RED}Error: Commit message required${NC}"
        exit 1
    fi
fi

# Update timestamp in CLAUDE.md
TODAY=$(date +"%B %d, %Y")
echo -e "${BLUE}Updating CLAUDE.md timestamp...${NC}"

# Only update if the file exists and has the "Last updated" line
if grep -q "Last updated:" CLAUDE.md 2>/dev/null; then
    # Extract the description after the date (everything after the " - ")
    CURRENT_DESC=$(grep "Last updated:" CLAUDE.md | sed 's/.*[0-9] - //')
    if [ -n "$CURRENT_DESC" ]; then
        sed -i '' "s/\*Last updated:.*\*/*Last updated: $TODAY - $CURRENT_DESC*/" CLAUDE.md
    fi
fi

# Stage all changes
echo -e "${BLUE}Staging changes...${NC}"
git add -A

# Commit with co-author
echo -e "${BLUE}Committing...${NC}"
git commit -m "$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# Push to GitHub
echo -e "${BLUE}Pushing to GitHub...${NC}"
git push origin main

# Deploy to Vercel
echo -e "${BLUE}Deploying to Vercel production...${NC}"
npx vercel --prod --yes

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Live at: https://pmmsherpa.com${NC}"
echo ""
