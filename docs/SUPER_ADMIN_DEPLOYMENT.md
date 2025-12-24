# Super Admin Dashboard Deployment Guide

## Overview
This document provides step-by-step instructions for deploying the Super Admin Dashboard with all management features.

## Features Deployed
1. **Multi-Clinic Subscription Management** - Manage subscriptions across all clinics
2. **Audit Logs System** - Track all admin actions for compliance
3. **System-wide Analytics Dashboard** - Comprehensive system analytics
4. **Bulk User Management** - Import, create, and manage users in bulk
5. **Revenue Tracking & Reporting** - Financial analytics and reporting
6. **Feature Flags per Clinic** - Control feature availability per clinic
7. **System Health Monitoring** - Real-time system performance tracking
8. **Clinic Performance Metrics** - Compare clinic performance across KPIs
9. **Data Export Tools** - Export data in CSV/JSON formats

## Prerequisites
- Node.js 22.x or higher
- Supabase CLI installed
- Vercel CLI installed
- Access to Supabase project
- Access to Vercel project

## Database Migrations

### 1. Audit Logs Migration
```sql
-- File: supabase/migrations/20250127_create_audit_logs.sql
-- Run: supabase db push
```

### 2. Feature Flags Migration
```sql
-- File: supabase/migrations/20250127_create_feature_flags.sql
-- Run: supabase db push
```

### Run Migrations
```bash
# Navigate to project root
cd Beauty-with-AI-Precision

# Apply all pending migrations
supabase db push

# Verify migrations
supabase migration list
```

## Environment Variables

### Required Environment Variables
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_CREDENTIALS_JSON=your_google_credentials

# Feature Flags
NEXT_PUBLIC_ENABLE_AR_FEATURES=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_LOYALTY=true

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

### Vercel Environment Setup
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all required variables
5. Ensure they're available in the appropriate environments (Preview/Production)

## Deployment Steps

### 1. Prepare Branch
```bash
# Ensure you're on the correct branch
git checkout chore/subscription-sot

# Pull latest changes
git pull origin chore/subscription-sot

# Verify all changes are committed
git status
```

### 2. Deploy to Staging
```bash
# Deploy to Vercel Preview
vercel --env-file .env.local

# Note the preview URL for testing
```

### 3. Staging Testing Checklist

#### Authentication & Authorization
- [ ] Super admin can login
- [ ] Regular users cannot access admin pages
- [ ] Role-based access control works

#### Feature Testing
- [ ] Subscription Management: Create, update, view subscriptions
- [ ] Audit Logs: View logs, filter by date/user/action
- [ ] Analytics Dashboard: Load charts, apply filters
- [ ] Bulk User Management: Import CSV, create users, export
- [ ] Revenue Tracking: View reports, export data
- [ ] Feature Flags: Toggle features, bulk update
- [ ] System Health: View metrics, auto-refresh works
- [ ] Clinic Performance: View rankings, export reports

#### Performance Checks
- [ ] Pages load within 3 seconds
- [ ] API responses under 1 second
- [ ] No memory leaks in browser console
- [ ] Responsive design works on mobile

#### Security Checks
- [ ] RLS policies enforced
- [ ] API endpoints protected
- [ ] No sensitive data exposed
- [ ] CORS properly configured

### 4. Deploy to Production
```bash
# Merge to main branch
git checkout main
git merge chore/subscription-sot
git push origin main

# Or deploy directly from feature branch
vercel --prod
```

### 5. Post-Deployment Verification

#### Database Checks
```sql
-- Verify audit_logs table
SELECT COUNT(*) FROM audit_logs;

-- Verify feature_flags table
SELECT COUNT(*) FROM feature_flags;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('audit_logs', 'feature_flags');
```

#### Application Checks
- [ ] All admin pages accessible
- [ ] Database connections working
- [ ] External services (email, AI) functional
- [ ] Monitoring and logging active

## Monitoring & Maintenance

### Health Monitoring
- Monitor `/admin/system-health` endpoint
- Set up alerts for high error rates
- Track database performance metrics

### Log Management
- Audit logs stored in `audit_logs` table
- Application logs via Vercel
- Database performance logs via Supabase

### Backup Strategy
- Daily database backups (Supabase automatic)
- Export critical reports regularly
- Version control for all code changes

## Troubleshooting

### Common Issues

#### Migration Failures
```bash
# Check migration status
supabase migration list

# Reset if needed (DESTRUCTIVE)
supabase db reset
```

#### Permission Errors
```sql
-- Verify user roles
SELECT id, email, role FROM users WHERE role = 'super_admin';

-- Update role if needed
UPDATE users SET role = 'super_admin' WHERE email = 'admin@example.com';
```

#### Feature Flags Not Working
```sql
-- Check feature flags
SELECT * FROM feature_flags WHERE clinic_id = 'your_clinic_id';

-- Test function
SELECT is_feature_enabled('your_clinic_id', 'ai_skin_analysis');
```

#### Performance Issues
- Check Vercel Analytics
- Review Supabase Dashboard
- Monitor API response times
- Optimize database queries

## Rollback Plan

### Quick Rollback
```bash
# Revert to previous commit
git checkout previous_commit_hash
git push --force-with-lease

# Redeploy
vercel --prod
```

### Database Rollback
```bash
# Create new migration to revert changes
supabase migration new revert_admin_features

# Add DROP statements for new tables/columns
supabase db push
```

## Security Considerations

1. **Least Privilege**: Only super admins can access admin features
2. **Audit Trail**: All actions logged in audit_logs table
3. **Rate Limiting**: Implement API rate limiting if needed
4. **Input Validation**: All inputs validated on server-side
5. **HTTPS**: Enforce HTTPS in production
6. **Environment Variables**: Never commit secrets to git

## Performance Optimization

1. **Database Indexes**: Ensure proper indexes on frequently queried columns
2. **Caching**: Implement Redis caching for frequently accessed data
3. **CDN**: Use Vercel's CDN for static assets
4. **Lazy Loading**: Implement lazy loading for large datasets
5. **Pagination**: Always paginate large result sets

## Support & Contact

For issues related to:
- **Database**: Check Supabase Dashboard
- **Deployment**: Check Vercel Dashboard
- **Code**: Review GitHub repository
- **Features**: Refer to this documentation

## Version History

- **v1.0.0** - Initial release with all 9 admin features
- Migrations: `20250127_create_audit_logs.sql`, `20250127_create_feature_flags.sql`
- Branch: `chore/subscription-sot` → `main`

---

**Last Updated**: 2025-01-27
**Version**: 1.0.0
**Maintainer**: Development Team
