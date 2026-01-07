#!/bin/bash

# Setup Test Environment for Beauty with AI Precision

echo "🚀 Setting up test environment..."

# Check if .env.test exists
if [ ! -f .env.test ]; then
    echo "📝 Creating .env.test file..."
    cat > .env.test << EOF
# Test Environment Variables
NODE_ENV=test
NEXT_PUBLIC_TEST_MODE=true

# Test Database
TEST_DB_URL=postgresql://postgres:postgres@localhost:5432/beauty_test
SUPABASE_TEST_URL=http://localhost:54321
SUPABASE_TEST_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.test

# Test API Keys
OPENAI_API_KEY=sk-test-1234567890abcdef
ANTHROPIC_API_KEY=sk-ant-test-1234567890abcdef

# Test URLs
NEXT_PUBLIC_APP_URL=http://localhost:3004
TEST_API_URL=http://localhost:3004

# Email Test
RESEND_API_KEY=re_test_1234567890abcdef

# Storage Test
SUPABASE_STORAGE_URL=http://localhost:54321/storage/v1
EOF
fi

# Create test database
echo "🗄️ Creating test database..."
psql -U postgres -c "DROP DATABASE IF EXISTS beauty_test;"
psql -U postgres -c "CREATE DATABASE beauty_test;"

# Run migrations on test database
echo "🔄 Running database migrations..."
cd supabase
supabase db reset --linked
cd ..

# Create test assets directory
echo "📁 Creating test assets..."
mkdir -p __tests__/e2e/assets

# Download test images (placeholder)
echo "📷 Preparing test images..."
# You should add real test images here
touch __tests__/e2e/assets/test-skin-front.jpg
touch __tests__/e2e/assets/test-skin-left.jpg
touch __tests__/e2e/assets/test-skin-right.jpg
touch __tests__/e2e/assets/invalid.txt

# Install test dependencies
echo "📦 Installing test dependencies..."
pnpm add -D @playwright/test

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
pnpm exec playwright install

# Run initial test to verify setup
echo "🧪 Running initial test verification..."
pnpm exec playwright test --grep "smoke" --reporter=list

echo "✅ Test environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add real test images to __tests__/e2e/assets/"
echo "2. Update .env.test with real test credentials"
echo "3. Run tests: pnpm test:e2e"
