#!/bin/bash

# Production Deployment Script
set -e

ENVIRONMENT="production"
echo "🚀 Starting Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Confirm deployment
read -p "🔍 Are you sure you want to deploy to production? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | xargs)
    echo "✅ Loaded production environment variables"
else
    echo "❌ Error: .env.production not found"
    exit 1
fi

# Validate required environment variables
required_vars=(
    "PRODUCTION_DATABASE_URL"
    "PRODUCTION_SUPABASE_URL"
    "PRODUCTION_NEXTAUTH_SECRET"
    "PRODUCTION_OPENAI_API_KEY"
    "PRODUCTION_RESEND_API_KEY"
)
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
done

# Create backup before deployment
echo "💾 Creating database backup..."
pnpm db:backup

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run full test suite
echo "🧪 Running full test suite..."
pnpm test

# Run security audit
echo "🔒 Running security audit..."
pnpm security:audit

# Run security scan
echo "🔍 Running security scan..."
pnpm security:scan

# Build the application
echo "🔨 Building application for production..."
NODE_ENV=production pnpm build

# Analyze bundle size
echo "📊 Analyzing bundle size..."
pnpm build:analyze

# Deploy to Vercel
echo "🌐 Deploying to Vercel Production..."
npx vercel --prod --token $VERCEL_TOKEN

# Run smoke tests
echo "🧪 Running smoke tests..."
pnpm test:smoke

# Health checks
echo "🏥 Running health checks..."
for url in "https://beauty-with-ai-precision.com/api/health" "https://beauty-with-ai-precision.com/api/ready"; do
    curl -f $url || {
        echo "❌ Health check failed for $url"
        exit 1
    }
done

# Performance tests
echo "⚡ Running performance tests..."
pnpm test:performance

# Create deployment tag
VERSION=v$(date +%Y.%m.%d-%H%M%S)
git tag $VERSION
git push origin $VERSION

echo "✅ Production deployment completed successfully!"
echo "🏷️ Created deployment tag: $VERSION"
