# Database Migration Guide: SQLite → Supabase PostgreSQL

## Overview
This guide explains how to migrate the AI Beauty Platform from local SQLite to Supabase PostgreSQL for production deployment.

## Prerequisites
- Supabase account and project
- Access to Supabase SQL Editor
- Backup of current SQLite database

## Migration Steps

### Step 1: Update Prisma Schema
\`\`\`bash
# Update prisma/schema.prisma datasource
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_URL")
}
\`\`\`

### Step 2: Run Migration Script in Supabase
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `scripts/migrate-to-supabase.sql`
3. Execute the script
4. Verify all tables are created

### Step 3: Update Environment Variables
\`\`\`env
# .env.local
POSTGRES_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
POSTGRES_PRISMA_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
\`\`\`

### Step 4: Generate Prisma Client
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### Step 5: Test Database Connection
\`\`\`bash
# Test health endpoint
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "ok",
  "database": "connected"
}
\`\`\`

### Step 6: Migrate Existing Data (if any)
\`\`\`bash
# Export from SQLite
sqlite3 prisma/dev.db .dump > backup.sql

# Transform and import to PostgreSQL
# (Manual process - adjust SQL syntax)
\`\`\`

## Verification Checklist
- [ ] All tables created in Supabase
- [ ] Indexes created successfully
- [ ] Triggers working (updated_at)
- [ ] Foreign keys enforced
- [ ] API routes connecting successfully
- [ ] Authentication working
- [ ] Data persistence verified

## Rollback Plan
If migration fails:
1. Revert `prisma/schema.prisma` to SQLite
2. Run `npx prisma generate`
3. Restart dev server

## Performance Optimization
- Enable connection pooling (PgBouncer)
- Configure statement timeout
- Monitor query performance
- Setup read replicas (if needed)

## Security Considerations
- Use environment variables for credentials
- Enable Row Level Security (RLS) in Supabase
- Restrict database access by IP
- Regular backups enabled

## Support
For issues, check:
- Supabase logs
- Prisma migration logs
- Application error logs
