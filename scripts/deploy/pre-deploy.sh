#!/bin/bash

# Pre-deployment checks
set -e

echo "🔍 Running pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="20.19.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is below required $REQUIRED_VERSION"
    exit 1
fi

echo "✅ Node.js version check passed"

# Check environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL not set"
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ NEXTAUTH_SECRET not set"
    exit 1
fi

echo "✅ Environment variables check passed"

# Run TypeScript check
echo "🔍 Running TypeScript check..."
pnpm run type-check

# Run linting
echo "🔍 Running linting..."
pnpm run lint

# Run unit tests
echo "🧪 Running unit tests..."
pnpm run test:unit

# Check build
echo "🏗️ Checking build..."
pnpm run build

echo "✅ All pre-deployment checks passed!"
