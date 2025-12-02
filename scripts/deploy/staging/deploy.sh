#!/bin/bash

# Staging Deployment Script
set -e

ENVIRONMENT="staging"
echo "🚀 Starting Staging Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Load environment variables
if [ -f ".env.staging" ]; then
    export $(cat .env.staging | xargs)
    echo "✅ Loaded staging environment variables"
else
    echo "❌ Error: .env.staging not found"
    exit 1
fi

# Validate required environment variables
required_vars=("STAGING_DATABASE_URL" "STAGING_SUPABASE_URL" "STAGING_NEXTAUTH_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
done

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run tests
echo "🧪 Running tests..."
pnpm test

# Run security audit
echo "🔒 Running security audit..."
pnpm security:audit

# Build the application
echo "🔨 Building application for staging..."
NODE_ENV=staging pnpm build

# Deploy to Vercel
echo "🌐 Deploying to Vercel Staging..."
npx vercel --prod --token $VERCEL_TOKEN

# Run post-deployment tests
echo "🧪 Running post-deployment tests..."
pnpm test:e2e:staging

# Health check
echo "🏥 Running health check..."
curl -f https://staging.beauty-with-ai-precision.com/api/health || {
    echo "❌ Health check failed"
    exit 1
}

echo "✅ Staging deployment completed successfully!"
