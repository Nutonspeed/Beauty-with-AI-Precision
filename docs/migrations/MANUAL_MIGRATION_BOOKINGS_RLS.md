# Manual Migration Instructions for Bookings RLS

## Problem
The clinic dashboard metrics API needs to read from the `bookings` table, but current RLS policies only allow:
- Patients to see their own bookings
- Admins to see all bookings

Clinic staff (`clinic_owner`, `clinic_staff`) cannot access bookings data.

## Solution
Run the SQL in `supabase/migrations/20250105_fix_bookings_rls.sql` manually in Supabase Dashboard.

## Steps

### Option 1: Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20250105_fix_bookings_rls.sql`
4. Paste and run the SQL

### Option 2: Supabase CLI (Local)
\`\`\`bash
# Start local Supabase
supabase start

# Reset database with all migrations
supabase db reset

# Or push migrations to remote
supabase db push
\`\`\`

### Option 3: psql Direct Connection
\`\`\`bash
# Get connection string from Supabase Dashboard > Settings > Database
# Then run:
psql "postgresql://postgres:[PASSWORD]@db.bgejeqqngzvuokdffadu.supabase.co:5432/postgres" -f supabase/migrations/20250105_fix_bookings_rls.sql
\`\`\`

## Expected Result
After running the migration:
- Clinic staff will be able to view all bookings
- Clinic staff can create bookings for any patient
- Clinic staff can update/delete bookings
- Patients can still view their own bookings

## Test
After migration, test by:
1. Login as clinic_owner or clinic_staff
2. Visit `/clinic/dashboard`
3. Check if metrics show real data (not zeros)
4. Check browser console for "[clinic/metrics] Real data:" log

## Current Status
✅ API updated to use real database queries
❌ RLS policies need to be updated (manual step required)
