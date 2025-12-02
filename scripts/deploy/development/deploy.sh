#!/bin/bash

# Development Deployment Script
set -e

echo "🚀 Starting Development Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Load environment variables
if [ -f ".env.development" ]; then
    export $(cat .env.development | xargs)
else
    echo "⚠️ Warning: .env.development not found, using default values"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Run database migrations
echo "🗄️ Running database migrations..."
pnpm db:migrate

# Build the application
echo "🔨 Building application..."
pnpm build

# Start development server
echo "🌟 Starting development server..."
pnpm dev
