# Database Schema Fixes Summary

**Date:** 2025-01-15  
**Status:** ✅ Core schema/function mismatches resolved; RLS policies need review

## Issues Identified

### 1. ❌ bookings.patient_id Does Not Exist (Error 42703)
**Problem:** The metrics API route was selecting `patient_id` from the bookings table, but the live schema uses `customer_id` instead.

**Root Cause:** Old migration file (20250104_create_bookings.sql) defined `patient_id`, but a later migration updated the schema to use `customer_id` as a UUID foreign key.

**Fix Applied:**
- Updated `app/api/clinic/dashboard/metrics/route.ts` to select `customer_id` instead of `patient_id`
- Changed all references in unique customer calculations from `patient_id` to `customer_id`

**Files Modified:**
- `app/api/clinic/dashboard/metrics/route.ts`

**Status:** ✅ FIXED - Error 42703 no longer appears in logs

---

### 2. ❌ Relation "public.user_roles" Does Not Exist (Error 42P01)
**Problem:** RLS helper functions (is_super_admin, get_user_clinic_id, get_user_role, can_access_clinic) were querying a non-existent `public.user_roles` table.

**Root Cause:** Migration 20251111_00_helper_functions.sql defined functions that assumed a `user_roles` table, but the live schema uses the `users` table with `role` and `clinic_id` columns directly.

**Live Schema Verification:**
```sql
-- users table has these columns:
id              uuid                      NOT NULL
email           text                      NOT NULL
role            USER-DEFINED              NOT NULL
clinic_id       uuid                      NULL
...
```

**Fix Applied:**
- Created new migration: `20250115_fix_helper_functions_use_users_table.sql`
- Replaced all `public.user_roles` references with `public.users`
- Updated function logic to query `users.role` and `users.clinic_id` directly
- Removed `is_active` checks (not present in users table)

**Functions Updated:**
1. `public.is_super_admin()` - Now checks `users.role = 'super_admin'`
2. `public.get_user_clinic_id()` - Now selects `users.clinic_id`
3. `public.get_user_role()` - Now selects `users.role::TEXT`
4. `public.can_access_clinic(UUID)` - Now checks `users.clinic_id = target_clinic_id`

**Files Created:**
- `supabase/migrations/20250115_fix_helper_functions_use_users_table.sql`

**Migration Applied:** ✅ Applied to live database successfully

**Status:** ✅ FIXED - Error 42P01 no longer appears in logs

---

## Testing & Verification

### Scripts Created for Schema Verification
1. **scripts/check-bookings.mjs**
   - Validates bookings table structure
   - Confirms `customer_id` exists, `patient_id` does not
   
2. **scripts/check-users.mjs**
   - Validates users table structure  
   - Confirms `role` and `clinic_id` columns exist

3. **scripts/apply-migration.mjs**
   - Utility to apply migrations to live database
   - Handles SSL and connection string cleanup

### E2E Test Results
**Before Fixes:**
```
[clinic/metrics] Error fetching today bookings: 42703 column bookings.patient_id does not exist
[v0] Error fetching revenue: 42P01 relation "public.user_roles" does not exist
```

**After Fixes:**
```
✅ No 42703 errors
✅ No 42P01 errors
⚠️  New 42501 errors (insufficient_privilege) - RLS policy issue, separate from schema
```

---

## Current State

### ✅ Resolved
- bookings table schema alignment (customer_id vs patient_id)
- RLS helper functions table dependency (users vs user_roles)
- All 42703 and 42P01 database errors eliminated

### ⚠️ Remaining Issues
- **42501 (insufficient_privilege)** errors on dashboard endpoints
  - Affects: revenue, treatments, pipeline endpoints
  - Root cause: RLS policies denying access to test users
  - **Next Step:** Review and update RLS policies to grant appropriate access

### 📋 Follow-up Tasks
1. Audit RLS policies on:
   - bookings table
   - treatments/services tables
   - customers table
   - revenue/reporting views
   
2. Ensure test users have appropriate roles (clinic_owner/clinic_staff)

3. Consider using service-role client for aggregated/reporting queries where appropriate (already implemented for metrics route)

---

## Impact Assessment

**Positive:**
- Eliminated all schema/function mismatch errors
- Dashboard metrics endpoint now correctly computes unique customers
- RLS helper functions now work with actual table structure
- E2E tests no longer trigger 42703/42P01 cascading failures

**Testing Required:**
- Validate all dashboard endpoints with properly permissioned users
- Confirm RLS policies allow clinic owners/staff to access their clinic data
- Verify metrics calculations are accurate with customer_id

---

## Lessons Learned

1. **Schema Drift:** Migration files can become outdated. Always verify live schema before debugging.
2. **RLS Dependencies:** Helper functions must reference actual tables, not assumed structures.
3. **Service-Role Client:** Use service-role Supabase client for aggregate queries to bypass RLS where appropriate.
4. **Testing Tools:** Direct database scripts (using `pg` npm package) are invaluable for schema verification.

---

**End of Report**
