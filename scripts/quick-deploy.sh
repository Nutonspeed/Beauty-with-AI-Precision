#!/bin/bash

# Quick Deploy Script - For experienced developers
# Skips interactive prompts

set -e

echo "⚡ Quick Deploy Mode"

# Install and build
pnpm install --frozen-lockfile
pnpm build

# Deploy
git add .
git commit -m "feat: deploy Phase 14 - $(date +%Y-%m-%d)"
git push origin main

echo "✅ Deployed! Check Vercel dashboard for status"
