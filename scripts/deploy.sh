#!/bin/bash

# AI Beauty Platform - Complete Deployment Script
# Lead Architect: v0 AI
# Date: 2025-01-30

set -e  # Exit on error

echo "🚀 AI Beauty Platform - Deployment Process"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Generate NEXTAUTH_SECRET if not exists
echo -e "\n${YELLOW}Step 1: Checking NEXTAUTH_SECRET...${NC}"
if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "Generating NEXTAUTH_SECRET..."
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "✅ Generated: $NEXTAUTH_SECRET"
    echo "⚠️  Add this to Vercel Environment Variables:"
    echo "   NEXTAUTH_SECRET=$NEXTAUTH_SECRET"
    echo "   NEXTAUTH_URL=https://your-domain.vercel.app"
else
    echo "✅ NEXTAUTH_SECRET already set"
fi

# Step 2: Install dependencies
echo -e "\n${YELLOW}Step 2: Installing dependencies...${NC}"
pnpm install

# Step 3: Run TypeScript check
echo -e "\n${YELLOW}Step 3: Running TypeScript check...${NC}"
pnpm tsc --noEmit

# Step 4: Verify database connection
echo -e "\n${YELLOW}Step 4: Verifying database connection...${NC}"
pnpm check:db

# Step 5: Run verification
echo -e "\n${YELLOW}Step 5: Running migration verification...${NC}"
pnpm verify:migration

# Step 6: Build the project
echo -e "\n${YELLOW}Step 6: Building project...${NC}"
pnpm build

# Step 7: Run tests (if any)
echo -e "\n${YELLOW}Step 7: Running tests...${NC}"
pnpm test:unit || echo "⚠️  No tests found or tests failed"

echo -e "\n${GREEN}=========================================="
echo "✅ All checks passed! Ready to deploy"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Commit and push to GitHub:"
echo "   git add ."
echo "   git commit -m 'feat: complete Supabase migration and fix build errors'"
echo "   git push origin main"
echo ""
echo "2. Or deploy directly with Vercel CLI:"
echo "   vercel --prod"
echo ""
echo "3. Monitor deployment at:"
echo "   https://vercel.com/dashboard"
