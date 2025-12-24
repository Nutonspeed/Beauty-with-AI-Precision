#!/bin/bash
# Local build and deploy script for Vercel

echo "🚀 Building locally for Vercel deployment..."

# Clean previous build
rm -rf .next

# Build locally with optimizations
echo "📦 Running build:fast..."
pnpm build:fast

if [ $? -ne 0 ]; then
    echo "❌ Build failed locally"
    exit 1
fi

echo "✅ Build successful locally"

# Deploy to Vercel using prebuilt
echo "🚀 Deploying to Vercel..."
vercel deploy --prebuilt

echo "✅ Deployment complete!"
