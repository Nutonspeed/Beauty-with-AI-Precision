# AI367Bar - Complete Database Migration Guide

## 📋 Overview

This guide provides instructions for deploying all database migrations for the AI367Bar platform. The migrations are organized by task and feature area.

**Last Updated**: 2025-01-08  
**Total Migrations**: 32 files  
**Database**: PostgreSQL (Supabase)

---

## 🗂️ Migration Files

### Foundation & Core (Tasks 1-2)
1. `20241027_create_users_and_rbac.sql` - Users table and RBAC system
2. `20241028_fix_users_schema.sql` - Users schema fixes (iteration 1)
3. `20241029_fix_users_schema_part2.sql` - Users schema fixes (iteration 2)
4. `20241030_fix_users_schema_simple.sql` - Simplified users schema
5. `20241031_create_user_preferences.sql` - User preferences table
6. `20250104_create_bookings.sql` - Booking system tables
7. `20250105_fix_bookings_rls.sql` - Bookings RLS policies fix
8. `20250105_fix_rls_infinite_recursion.sql` - Fix RLS recursion issues

### AI Analysis Features (Task 3)
9. `20250101_skin_analyses.sql` - Skin analysis tables
10. `20250102_add_quality_metrics.sql` - AI quality metrics
11. `20250103_create_treatments_table.sql` - Treatment recommendations

### Communication & Realtime (Task 4)
12. `20250105_create_chat_history_table.sql` - Chat history
13. `20250105_create_live_chat_system.sql` - Live chat system
14. `20250105_create_queue_system.sql` - Queue management

### Advanced Features (Task 5)
15. `20250105_create_loyalty_points_system.sql` - Loyalty program
16. `20250105_create_marketing_promo_system.sql` - Marketing campaigns
17. `20250105_create_inventory_system.sql` - Inventory management (v1)
18. `20250105_create_inventory_system_v2.sql` - Inventory system (v2)
19. `20250105_create_reports_analytics_system.sql` - Analytics & reports
20. `20250105_create_sales_tables.sql` - Sales tracking

### Multi-Clinic & Admin (Tasks 4-5)
21. `20250104_create_admin_tables.sql` - Admin panel tables
22. `20250105_create_appointment_system.sql` - Appointment scheduling
23. `20250105_create_branch_management_system.sql` - Branch management
24. `20250105_create_clinic_staff_table.sql` - Staff management
25. `20250107_multi_clinic_foundation.sql` - Multi-clinic foundation
26. `20250107_multi_clinic_enhancement.sql` - Multi-clinic enhancements

### Progress & Comparison (Tasks 6-8)
27. `20250104_create_progress_tracking_tables.sql` - Progress tracking
28. `20250106_create_treatment_history_system.sql` - Treatment history
29. `20250107_create_share_views_table.sql` - Share & views tracking
30. `20250201000000_add_view_tracking_function.sql` - View tracking function
31. `20250108_add_patient_linking.sql` - Patient linking (comparison)

### Error Handling & Monitoring (Task 9)
32. `20250108_error_logging_performance.sql` - Error logs & performance metrics

---

## 🚀 Deployment Methods

### Method 1: Supabase CLI (Recommended for Local Development)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run all migrations
supabase db push

# Verify migrations
supabase db diff
```

### Method 2: Supabase Dashboard (Recommended for Production)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New query**
5. Copy and paste the contents of each migration file **in order**
6. Click **Run** for each migration
7. Verify no errors in the output

**⚠️ IMPORTANT**: Run migrations in the exact order listed above!

### Method 3: Direct PostgreSQL Connection

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run each migration file
\i supabase/migrations/20241027_create_users_and_rbac.sql
\i supabase/migrations/20241028_fix_users_schema.sql
# ... continue with all files in order

# Or use a script to run all at once
for f in supabase/migrations/*.sql; do
  psql "postgresql://..." -f "$f"
done
```

---

## 📝 Pre-Deployment Checklist

Before running migrations, ensure:

- [ ] Database backup completed
- [ ] Environment variables configured
- [ ] Supabase project is active
- [ ] Database connection is stable
- [ ] No active user sessions (if possible)
- [ ] Have rollback plan ready

---

## 🔍 Post-Deployment Verification

After running all migrations, verify:

### 1. Check Tables Created

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected tables (32+):
-- appointments, bookings, branches, chat_history, chat_messages,
-- clinics, comparisons, error_logs, inventory_categories,
-- inventory_products, loyalty_points, marketing_campaigns,
-- performance_metrics, progress_photos, queue_entries,
-- skin_analyses, treatments, users, ...
```

### 2. Check Indexes Created

```sql
-- List all indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Should have 50+ indexes for performance
```

### 3. Check RLS Policies

```sql
-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Should have 100+ policies for security
```

### 4. Check Functions & Triggers

```sql
-- List all functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- List all triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### 5. Test Key Features

```sql
-- Test error logging
INSERT INTO error_logs (error_message, url, user_agent, timestamp)
VALUES ('Test error', 'http://test', 'TestAgent', NOW());

-- Test performance metrics
INSERT INTO performance_metrics (metric_type, metric_value, page_url, timestamp)
VALUES ('test', 100, 'http://test', NOW());

-- Clean up test data
DELETE FROM error_logs WHERE error_message = 'Test error';
DELETE FROM performance_metrics WHERE metric_type = 'test';
```

---

## 🔧 Troubleshooting

### Common Issues

**1. "relation already exists" error**
```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'your_table_name'
);

-- If exists, you can skip that migration or drop and recreate
DROP TABLE IF EXISTS your_table_name CASCADE;
```

**2. RLS policy errors**
```sql
-- Drop existing policies
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Then rerun the migration
```

**3. Function already exists**
```sql
-- Drop existing function
DROP FUNCTION IF EXISTS function_name CASCADE;

-- Then rerun the migration
```

**4. Foreign key constraint errors**
```sql
-- Check foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'your_table_name';
```

---

## 🔄 Rollback Procedures

If you need to rollback migrations:

### Option 1: Restore from Backup
```bash
# Restore from Supabase backup
# Go to Dashboard > Database > Backups > Restore

# Or use pg_restore
pg_restore -h db.your-project.supabase.co \
  -U postgres -d postgres \
  --clean --if-exists \
  backup_file.dump
```

### Option 2: Drop Tables Manually
```sql
-- Drop all tables (⚠️ DESTRUCTIVE!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Option 3: Selective Rollback
```sql
-- Drop specific tables created by a migration
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;
-- Add more tables as needed
```

---

## 📊 Migration Statistics

- **Total Migrations**: 32 files
- **Total Tables**: 35+ tables
- **Total Indexes**: 50+ indexes
- **Total RLS Policies**: 100+ policies
- **Total Functions**: 15+ functions
- **Total Triggers**: 10+ triggers
- **Estimated Migration Time**: 5-10 minutes (depending on connection)
- **Estimated Database Size**: ~50MB (empty tables)

---

## 🔒 Security Notes

1. **RLS Enabled**: All tables have Row Level Security enabled
2. **Role-Based Access**: Policies enforce role-based access (super_admin, clinic_admin, clinic_staff, customer)
3. **Anonymous Access**: Limited to public features only
4. **Service Role**: Should only be used for admin operations
5. **API Keys**: Keep Supabase service role key secure

---

## 📈 Performance Optimization

After migrations, run these optimizations:

```sql
-- Analyze tables for query planner
ANALYZE;

-- Vacuum to reclaim storage
VACUUM ANALYZE;

-- Update statistics
UPDATE pg_stat_statements_info 
SET dealloc = 0;

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## 🎯 Next Steps After Migration

1. ✅ Verify all tables created
2. ✅ Test RLS policies
3. ✅ Create initial super_admin user
4. ✅ Configure authentication
5. ✅ Test error logging
6. ✅ Test performance monitoring
7. ✅ Run application and verify features
8. ✅ Monitor for errors in production

---

## 📞 Support

If you encounter issues:

1. Check Supabase logs: Dashboard > Logs > Database
2. Review error messages carefully
3. Check RLS policies are not blocking access
4. Verify environment variables are set
5. Check Supabase project status

---

**Happy Deploying! 🚀**

For more information, see:
- Task documentation in `/docs` folder
- Individual migration file comments
- Supabase documentation: https://supabase.com/docs
