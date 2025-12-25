# Staging Testing Guide - Super Admin Dashboard

## 🚀 Staging URL
https://beauty-with-ai-precision-656jjkw8p-nuttapongs-projects-6ab11a57.vercel.app

## 📋 Pre-Testing Setup

### 1. Run Database Migrations
1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu
2. Navigate to **SQL Editor**
3. Copy and paste the entire content of `scripts/run-staging-migrations.sql`
4. Click **Run** to execute all migrations
5. Verify success by checking the output at the bottom

### 2. Verify Tables Created
Run this query to verify:
```sql
SELECT 'audit_logs' as table_name, COUNT(*) as row_count FROM audit_logs
UNION ALL
SELECT 'feature_flags' as table_name, COUNT(*) as row_count FROM feature_flags;
```

## 🧪 Testing Steps

### Phase 1: Authentication
1. Navigate to `/auth/login`
2. Login with super admin credentials
3. Verify successful redirect to dashboard
4. Check that admin menu is visible

### Phase 2: Core Features Testing

#### 1. Subscription Management (`/admin/subscriptions`)
- [ ] View list of clinic subscriptions
- [ ] Filter by status (active, trial, expired)
- [ ] Edit a subscription (change plan, status)
- [ ] View subscription statistics
- [ ] Check revenue calculations

#### 2. Audit Logs (`/admin/audit-logs`)
- [ ] View audit logs list
- [ ] Filter by date range
- [ ] Filter by user
- [ ] Filter by action type
- [ ] Filter by resource type
- [ ] Export logs to CSV
- [ ] View log details

#### 3. Analytics Dashboard (`/admin/analytics`)
- [ ] View overall statistics cards
- [ ] Check revenue charts
- [ ] View user growth chart
- [ ] Check clinic distribution
- [ ] Filter by period (week/month/quarter/year)
- [ ] Export analytics data

#### 4. Bulk User Management (`/admin/users/bulk`)
- [ ] Download sample CSV template
- [ ] Upload CSV with test data
- [ ] Preview data before import
- [ ] Execute bulk import
- [ ] View import results
- [ ] Export existing users

#### 5. Revenue Tracking (`/admin/revenue`)
- [ ] View revenue KPIs
- [ ] Check revenue trends chart
- [ ] View revenue by plan
- [ ] Check revenue by clinic
- [ ] View payment methods distribution
- [ ] Check recent transactions
- [ ] Export revenue report

#### 6. Feature Flags (`/admin/feature-flags`)
- [ ] View feature flags table
- [ ] Toggle a feature for a clinic
- [ ] Use bulk update feature
- [ ] Search/filter clinics
- [ ] Verify feature flag changes

#### 7. System Health (`/admin/system-health`)
- [ ] View overall health score
- [ ] Check system metrics (CPU, Memory, Disk)
- [ ] View service status table
- [ ] Check metrics history chart
- [ ] View active alerts
- [ ] Test auto-refresh

#### 8. Clinic Performance (`/admin/clinic-performance`)
- [ ] View top performers list
- [ ] Check performance charts
- [ ] Filter by period
- [ ] View detailed table
- [ ] Export performance report

### Phase 3: Security Testing

#### Authorization Checks
1. Logout from super admin
2. Login with regular user account
3. Try to access admin URLs:
   - `/admin` - Should redirect/unauthorized
   - `/api/admin/*` - Should return 403
4. Verify non-super admins cannot access admin features

#### Data Protection
- [ ] Check RLS policies are working
- [ ] Verify no data leakage between clinics
- [ ] Confirm audit logs are immutable

### Phase 4: Performance Testing

#### Page Load Times
- [ ] Admin dashboard loads < 3 seconds
- [ ] Analytics charts load < 2 seconds
- [ ] Large data tables paginate properly

#### API Response Times
- [ ] All API endpoints respond < 1 second
- [ ] Export functions work for large datasets
- [ ] No memory leaks in browser console

## 🔍 Debugging Common Issues

### Migration Issues
If migrations fail:
1. Check if tables already exist:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name IN ('audit_logs', 'feature_flags');
   ```
2. Drop and recreate if needed:
   ```sql
   DROP TABLE IF EXISTS audit_logs CASCADE;
   DROP TABLE IF EXISTS feature_flags CASCADE;
   ```

### Permission Issues
If getting 403 errors:
1. Check user role:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
   ```
2. Update role if needed:
   ```sql
   UPDATE users SET role = 'super_admin' WHERE email = 'your-email@example.com';
   ```

### API Errors
Check browser console for:
- Network errors (CORS, 500 errors)
- JavaScript errors
- Authentication failures

## 📊 Test Results Template

Copy and paste this for your test results:

```
=== STAGING TEST RESULTS ===
Date: [Date]
Tester: [Name]

Environment:
- URL: https://beauty-with-ai-precision-656jjkw8p-nuttapongs-projects-6ab11a57.vercel.app
- Database: Supabase (bgejeqqngzvuokdffadu)

Migrations:
✅ audit_logs table created
✅ feature_flags table created
✅ RLS policies applied
✅ Sample data seeded

Feature Tests:
✅ Subscription Management - Working
✅ Audit Logs - Working
✅ Analytics Dashboard - Working
✅ Bulk User Management - Working
✅ Revenue Tracking - Working
✅ Feature Flags - Working
✅ System Health - Working
✅ Clinic Performance - Working

Security Tests:
✅ Authorization - Working
✅ RLS Policies - Working
✅ Data Isolation - Working

Performance:
✅ Page Load Times - < 3s
✅ API Response - < 1s
✅ No Memory Leaks

Issues Found:
- [List any issues found]

Recommendations:
- [Any recommendations for improvement]

Overall Status: ✅ READY FOR PRODUCTION
```

## 🚀 Next Steps After Testing

If all tests pass:
1. Merge `chore/subscription-sot` to `main`
2. Deploy to production: `vercel --prod`
3. Run migrations on production database
4. Update documentation
5. Train users

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase migrations completed
3. Confirm environment variables are set
4. Check Vercel deployment logs

---

**Last Updated**: 2025-01-27
**Version**: 1.0.0
