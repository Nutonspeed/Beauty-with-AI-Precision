# Demo Environment Setup Guide

This guide explains how to set up the Beauty with AI Precision demo environment for B2B sales presentations.

## 🚀 Quick Start (3 Commands)

```bash
# 1. Run all migrations
pnpm db:migrate

# 2. Seed demo data
psql $DATABASE_URL -f scripts/seed-demo-data.sql

# 3. Create demo auth user
psql $DATABASE_URL -f scripts/create-demo-user.sql
```

**Demo Credentials:**
- Email: `demo@cliniciq.com`
- Password: `demo123`

---

## 📋 Prerequisites

1. **Database Access**: PostgreSQL connection with superuser privileges
2. **Environment Variables**: All required env vars set in `.env.local`
3. **Supabase CLI**: For local development and auth user creation

---

## 🔧 Step-by-Step Setup

### 1. Database Setup

First, ensure all migrations are applied:

```bash
# Apply all pending migrations
pnpm db:migrate

# Or manually:
psql $DATABASE_URL -f supabase/migrations/20251111_add_critical_tables.sql
psql $DATABASE_URL -f supabase/migrations/20251112_phase5_clinic_admin_tables.sql
psql $DATABASE_URL -f supabase/migrations/202512240002_create_ai_usage_tracking.sql
```

### 2. Seed Demo Data

The seed script creates:
- Demo clinic: "Bangkok Beauty Clinic"
- Demo users (admin, staff, sales)
- Sample customers with Thai names
- Realistic appointments and treatments
- Sales leads and proposals
- Skin analysis results
- Payment records
- AI usage tracking

```bash
# Run the seed script
psql $DATABASE_URL -f scripts/seed-demo-data.sql
```

### 3. Create Auth User

The demo user needs to exist in Supabase Auth. Two options:

#### Option A: SQL with Service Role (Recommended)

```bash
# This creates the auth user and links it to the public.users record
psql $DATABASE_URL -f scripts/create-demo-user.sql
```

#### Option B: Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Email: `demo@cliniciq.com`
4. Password: `demo123`
5. Mark "Auto-confirm"
6. Save

### 4. Verify Setup

1. Login to the app with demo credentials
2. You should see a purple "DEMO MODE" banner
3. Verify data exists:
   - Sales Dashboard shows metrics
   - Staff Schedule has appointments
   - Customer list has Thai names

---

## 🌍 Environment Variables

Add these to your `.env.local` for demo mode:

```env
# Demo mode flag (optional)
DEMO_MODE=true

# Required for AI features (can use test keys)
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

---

## 🔄 Reset/Reseed Demo Data

To reset the demo environment:

```bash
# 1. Clear existing demo data
psql $DATABASE_URL -c "
DELETE FROM ai_usage WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@cliniciq.com');
DELETE FROM booking_payments WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@cliniciq.com');
DELETE FROM skin_analyses WHERE user_id IN (SELECT id FROM users WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@cliniciq.com'));
DELETE FROM sales_proposals WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@cliniciq.com');
DELETE FROM sales_leads WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@cliniciq.com');
DELETE FROM appointments WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@cliniciq.com');
DELETE FROM customers WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@cliniciq.com');
DELETE FROM users WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@cliniciq.com');
DELETE FROM subscriptions WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@cliniciq.com');
DELETE FROM clinics WHERE email = 'demo@cliniciq.com';
"

# 2. Reseed data
psql $DATABASE_URL -f scripts/seed-demo-data.sql
psql $DATABASE_URL -f scripts/create-demo-user.sql
```

---

## 🐛 Common Issues & Solutions

### Issue: "relation 'pricing_plans' does not exist"
**Solution**: Run all migrations first:
```bash
pnpm db:migrate
```

### Issue: Demo user can't login
**Solution**: Check auth user creation:
```sql
-- Verify auth user exists
SELECT * FROM auth.users WHERE email = 'demo@cliniciq.com';

-- Verify public user exists
SELECT * FROM public.users WHERE email = 'demo@cliniciq.com';
```

### Issue: No data showing in dashboard
**Solution**: Check clinic_id linkage:
```sql
-- Verify users are linked to clinic
SELECT u.email, u.clinic_id, c.name 
FROM public.users u 
JOIN public.clinics c ON u.clinic_id = c.id 
WHERE u.email = 'demo@cliniciq.com';
```

### Issue: AI rate limit errors
**Solution**: Check AI usage table:
```sql
-- Check if AI usage tracking is working
SELECT * FROM ai_usage WHERE clinic_id = (SELECT id FROM clinics WHERE email = 'demo@cliniciq.com');
```

---

## 📊 Demo Data Summary

| Entity | Count | Description |
|--------|-------|-------------|
| Clinics | 1 | Bangkok Beauty Clinic |
| Users | 3 | Admin, Staff, Sales |
| Customers | 3 | Thai names with realistic data |
| Appointments | 5 | Mix of completed and scheduled |
| Sales Leads | 4 | Various sources and statuses |
| Proposals | 3 | Different packages and values |
| Skin Analyses | 3 | Realistic VISIA scores |
| Payments | 3 | Multiple payment methods |

---

## 🎯 Demo Script for Sales

1. **Login**: demo@cliniciq.com / demo123
2. **Sales Dashboard**: Show real-time metrics and conversion rates
3. **Quick Scan**: Demonstrate AI skin analysis
4. **Leads Management**: Show lead-to-proposal workflow
5. **Staff Schedule**: Display real appointment data (no mock data)
6. **AI Rate Limits**: Show cost controls in action

---

## 📞 Support

For setup issues:
1. Check the logs: `pnpm dev`
2. Verify database connection
3. Ensure all migrations applied
4. Check Supabase auth configuration

---

**Last Updated**: December 24, 2025
**Version**: 1.0
