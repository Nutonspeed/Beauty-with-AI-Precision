#!/bin/bash

# Script to find and report console.log usage
# Run: chmod +x scripts/clean-console-logs.sh && ./scripts/clean-console-logs.sh

echo "🔍 Scanning for console.log statements..."
echo ""

# Find all console.log (excluding [v0] prefix)
echo "📊 Console.log statements (excluding [v0] debug logs):"
grep -r "console\.log(" --include="*.ts" --include="*.tsx" app/ components/ lib/ | \
  grep -v "\[v0\]" | \
  wc -l

echo ""
echo "📊 Console.error statements:"
grep -r "console\.error(" --include="*.ts" --include="*.tsx" app/ components/ lib/ | wc -l

echo ""
echo "📊 Console.warn statements:"
grep -r "console\.warn(" --include="*.ts" --include="*.tsx" app/ components/ lib/ | wc -l

echo ""
echo "🎯 Files with most console statements:"
grep -r "console\." --include="*.ts" --include="*.tsx" app/ components/ lib/ | \
  cut -d: -f1 | \
  sort | \
  uniq -c | \
  sort -rn | \
  head -10

echo ""
echo "✅ Scan complete!"
echo ""
echo "💡 Next steps:"
echo "1. Review files with high console usage"
echo "2. Replace with logger utility: import { logger } from '@/lib/logger'"
echo "3. Keep [v0] prefixed logs for debugging"
