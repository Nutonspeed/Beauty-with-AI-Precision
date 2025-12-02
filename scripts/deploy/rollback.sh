#!/bin/bash

# Rollback script
set -e

ENVIRONMENT=${1:-production}
PREVIOUS_DEPLOYMENT=${2}

echo "🔄 Rolling back $ENVIRONMENT deployment..."

if [ -z "$VERCEL_TOKEN" ] || [ -z "$PROJECT_ID" ]; then
    echo "❌ Vercel credentials not configured"
    exit 1
fi

# Rollback Vercel deployment
echo "🔄 Rolling back Vercel deployment..."
vercel rollback $PROJECT_ID --token=$VERCEL_TOKEN

# Verify rollback
echo "🔍 Verifying rollback..."
sleep 30

curl -f "$BASE_URL/api/health" || {
    echo "❌ Rollback verification failed"
    exit 1
}

echo "✅ Rollback completed successfully"

# Notify team
if [ ! -z "$SLACK_WEBHOOK" ]; then
    curl -X POST "$SLACK_WEBHOOK" \
        -H "Content-Type: application/json" \
        -d '{"text": "🔄 Deployment rolled back for '$ENVIRONMENT'"}'
fi
