# Comprehensive Supabase Migration Plan

## Executive Summary
This document outlines the complete migration from Prisma + SQLite to Supabase PostgreSQL, addressing all deployment issues and ensuring a production-ready system.

## Current Issues Analysis

### 1. Build Errors
- **Issue**: `PrismaClient` import fails during Vercel build
- **Root Cause**: Prisma build scripts blocked by pnpm security
- **Impact**: Deployment fails at build stage

### 2. Database Confusion
- **Issue**: Both Prisma and Supabase configured but neither working
- **Root Cause**: Prisma uses local SQLite, Supabase has 0 tables
- **Impact**: No persistent data storage in production

### 3. Middleware Export
- **Issue**: Next.js 16 requires `proxy` function export
- **Status**: ✅ FIXED (renamed from `middleware` to `proxy`)

## Migration Strategy

### Phase 1: Database Schema Creation (30 minutes)
**Objective**: Create all tables in Supabase PostgreSQL

**Actions**:
1. Create SQL migration script from Prisma schema
2. Execute migrations in Supabase
3. Verify table creation
4. Set up Row Level Security (RLS) policies

**Files Created**:
- `scripts/supabase-migration.sql` - Complete schema
- `scripts/supabase-rls-policies.sql` - Security policies
- `scripts/supabase-seed.sql` - Initial data

### Phase 2: Supabase Client Setup (20 minutes)
**Objective**: Create proper Supabase client utilities

**Actions**:
1. Import Supabase example code
2. Create browser client utility
3. Create server client utility
4. Create middleware helper
5. Update proxy.ts to use Supabase auth

**Files Created**:
- `lib/supabase/client.ts` - Browser client
- `lib/supabase/server.ts` - Server client
- `lib/supabase/middleware.ts` - Session refresh
- `lib/supabase/types.ts` - TypeScript types

### Phase 3: API Route Migration (45 minutes)
**Objective**: Replace all Prisma calls with Supabase queries

**Actions**:
1. Update authentication routes
2. Update analysis routes
3. Update user profile routes
4. Update tenant routes
5. Add error handling and validation

**Files Updated**:
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/analysis/[id]/route.ts`
- `app/api/analysis/history/[userId]/route.ts`
- `app/api/analysis/save/route.ts`
- `app/api/user/profile/route.ts`
- `app/api/tenant/**/*.ts`
- `lib/auth.ts`
- `lib/tenant/tenant-manager.ts`

### Phase 4: Dependency Cleanup (15 minutes)
**Objective**: Remove Prisma dependencies

**Actions**:
1. Remove Prisma from package.json
2. Delete Prisma files
3. Remove .npmrc (no longer needed)
4. Update build scripts

**Files Removed**:
- `prisma/schema.prisma`
- `lib/prisma.ts`
- `prisma.config.ts`
- `.npmrc`

**Files Updated**:
- `package.json` - Remove Prisma deps

### Phase 5: Testing & Validation (30 minutes)
**Objective**: Ensure all features work correctly

**Actions**:
1. Test authentication flow
2. Test analysis upload and retrieval
3. Test user profile management
4. Test admin dashboard
5. Verify deployment

## Implementation Details

### Database Schema Mapping

| Prisma Model | Supabase Table | Notes |
|--------------|----------------|-------|
| User | users | Add auth.users integration |
| Tenant | tenants | Multi-tenant support |
| UserProfile | user_profiles | 1:1 with users |
| SkinAnalysis | skin_analyses | Store analysis results |
| TreatmentPlan | treatment_plans | Recommendations |
| Booking | bookings | Appointments |

### API Query Conversion Examples

**Prisma**:
\`\`\`typescript
const user = await prisma.user.findUnique({
  where: { email }
})
\`\`\`

**Supabase**:
\`\`\`typescript
const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('email', email)
  .single()
\`\`\`

### Authentication Integration

**Current**: NextAuth.js with Prisma adapter
**New**: NextAuth.js with Supabase adapter + Supabase Auth

**Benefits**:
- Built-in session management
- Automatic token refresh
- Row Level Security integration
- Email verification
- OAuth providers support

## Deployment Configuration

### Environment Variables (Already Set)
\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=<set>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<set>
SUPABASE_SERVICE_ROLE_KEY=<set>
POSTGRES_URL=<set>
\`\`\`

### Build Configuration
\`\`\`json
{
  "build": {
    "env": {
      "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
    }
  }
}
\`\`\`

### Vercel Settings
- Framework: Next.js
- Build Command: `pnpm run build`
- Output Directory: `.next`
- Install Command: `pnpm install`
- Node Version: 22.x

## Risk Mitigation

### Data Loss Prevention
1. Export existing Prisma data before migration
2. Keep Prisma files in git history
3. Test migration on staging first
4. Have rollback plan ready

### Performance Optimization
1. Add database indexes on frequently queried columns
2. Use connection pooling (Supabase Pooler)
3. Implement caching with SWR
4. Monitor query performance

### Security Measures
1. Enable Row Level Security (RLS) on all tables
2. Use service role key only in server-side code
3. Validate all user inputs
4. Implement rate limiting
5. Add CORS configuration

## Success Criteria

### Build Success
- ✅ No TypeScript errors
- ✅ No import errors
- ✅ Successful Vercel deployment
- ✅ All routes accessible

### Functionality
- ✅ User authentication works
- ✅ Analysis upload and retrieval works
- ✅ Profile management works
- ✅ Admin dashboard works
- ✅ AR simulator works

### Performance
- ✅ Page load < 3s
- ✅ API response < 500ms
- ✅ Database queries < 100ms
- ✅ No memory leaks

## Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Schema Creation | 30 min | 🔄 In Progress |
| Phase 2: Client Setup | 20 min | ⏳ Pending |
| Phase 3: API Migration | 45 min | ⏳ Pending |
| Phase 4: Cleanup | 15 min | ⏳ Pending |
| Phase 5: Testing | 30 min | ⏳ Pending |
| **Total** | **2h 20min** | |

## Next Steps

1. Execute Phase 1: Create database schema in Supabase
2. Run migration scripts
3. Verify table creation
4. Proceed with Phase 2

---

**Document Version**: 1.0
**Last Updated**: 2025-01-30
**Author**: v0 AI Assistant
