#!/bin/bash

# Post-deployment verification
set -e

ENVIRONMENT=${1:-production}
BASE_URL=${2:-https://beauty-ai.com}

echo "🔍 Running post-deployment verification for $ENVIRONMENT..."

# Wait for deployment to be ready
echo "⏳ Waiting for deployment to be ready..."
sleep 30

# Health check
echo "🏥 Checking application health..."
curl -f "$BASE_URL/api/health" || {
    echo "❌ Health check failed"
    exit 1
}

echo "✅ Health check passed"

# AI services check
echo "🤖 Checking AI services..."
curl -f "$BASE_URL/api/health/ai-status" || {
    echo "❌ AI services check failed"
    exit 1
}

echo "✅ AI services check passed"

# Performance check
echo "📊 Checking performance..."
SCORE=$(curl -s "$BASE_URL/api/monitoring/metrics" | jq -r '.summary.performance_score // 0')

if [ "$SCORE" -lt 80 ]; then
    echo "⚠️  Performance score $SCORE is below 80"
else
    echo "✅ Performance score $SCORE is acceptable"
fi

# Security check
echo "🔒 Checking security headers..."
curl -I "$BASE_URL" | grep -q "strict-transport-security" || {
    echo "⚠️  Missing HSTS header"
}

echo "✅ Post-deployment verification completed!"
