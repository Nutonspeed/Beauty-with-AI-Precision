# 📚 Database Schema - Quick Reference

**ClinicIQ Database Schema Cheat Sheet**

---

## 🔑 Most Important Tables (Top 10)

### 1. `users` - All System Users
```sql
-- Replaces old 'customers' table
id: uuid (PK, FK to auth.users)
email: text (unique)
role: user_role (customer, sales_staff, clinic_owner, etc.)
clinic_id: uuid (FK to clinics)
assigned_sales_user_id: uuid (FK to users - for customers)
```

**Usage:**
```sql
-- Get all customers
SELECT * FROM users WHERE role LIKE 'customer%';

-- Get sales staff
SELECT * FROM users WHERE role = 'sales_staff';
```

---

### 2. `clinics` - Multi-Tenant Clinics
```sql
id: uuid (PK)
clinic_name: text
owner_user_id: uuid (FK to users)
is_active: boolean
```

---

### 3. `skin_analyses` - AI Analysis Results
```sql
id: uuid (PK)
user_id: uuid (FK to users) -- ✅ Changed from customers
clinic_id: uuid (FK to clinics)
sales_staff_id: uuid (FK to users)
overall_score: int (0-100)
image_url: text
analysis_data: jsonb
```

**Fast Queries** (uses indexes):
```sql
-- By user
SELECT * FROM skin_analyses WHERE user_id = 'uuid';

-- By clinic
SELECT * FROM skin_analyses WHERE clinic_id = 'uuid';

-- Composite
SELECT * FROM skin_analyses WHERE user_id = 'uuid' AND clinic_id = 'uuid';
```

---

### 4. `sales_leads` - CRM Leads
```sql
id: uuid (PK)
sales_user_id: uuid (FK to users)
customer_user_id: uuid (FK to users) -- ✅ References users now
clinic_id: uuid (FK to clinics)
status: text (new, contacted, qualified, won, lost)
lead_score: int
lead_source: text
```

---

### 5. `invitations` - User Onboarding
```sql
id: uuid (PK)
email: text
invited_role: text
clinic_id: uuid (FK to clinics)
invited_by: uuid (FK to users)
token: text (unique)
status: text (pending, accepted, expired)
expires_at: timestamp
```

**Duplicate Prevention**: Trigger blocks duplicate pending invitations

---

### 6. `appointments` - Scheduling
```sql
id: uuid (PK)
customer_id: uuid (FK to users) -- ✅ Changed from customers
clinic_id: uuid (FK to clinics)
staff_id: uuid (FK to auth.users)
branch_id: uuid (FK to branches)
appointment_date: date
start_time: time
status: text
```

---

### 7. `sales_proposals` - Sales Proposals
```sql
id: uuid (PK)
lead_id: uuid (FK to sales_leads)
sales_user_id: uuid (FK to users)
status: text
total_amount: numeric
proposal_data: jsonb
```

---

### 8. `bookings` - Booking System
```sql
id: uuid (PK)
customer_id: uuid (FK to users) -- ✅ Changed from customers
clinic_id: uuid (FK to clinics)
booking_date: date
status: text
total_amount: numeric
```

---

### 9. `treatments` - Service Catalog
```sql
id: uuid (PK)
clinic_id: uuid (FK to clinics)
treatment_name: text
category: text
price: numeric
duration: int (minutes)
is_active: boolean
```

---

### 10. `invoices` - Billing
```sql
id: uuid (PK)
invoice_number: text (unique)
clinic_id: uuid (FK to clinics)
customer_id: uuid (FK to users)
appointment_id: uuid (FK to appointments)
total_amount: numeric
status: text (draft, sent, paid, overdue, cancelled)
```

---

## 🎯 Common Queries

### Get Customer Info (New Way)
```sql
-- ✅ After migration
SELECT * FROM users 
WHERE id = 'customer-uuid' 
  AND role LIKE 'customer%';

-- Or use legacy view
SELECT * FROM customers_legacy 
WHERE id = 'customer-uuid';
```

### Get Customer's Complete Profile
```sql
SELECT 
  u.*,
  up.date_of_birth,
  up.skin_type,
  up.skin_concerns,
  c.clinic_name
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN clinics c ON u.clinic_id = c.id
WHERE u.id = 'customer-uuid';
```

### Get Customer's Analysis History
```sql
SELECT 
  sa.*,
  u.full_name as customer_name,
  u.email
FROM skin_analyses sa
JOIN users u ON sa.user_id = u.id
WHERE sa.user_id = 'customer-uuid'
ORDER BY sa.created_at DESC;
```

### Get Sales Staff's Customers
```sql
SELECT 
  u.*,
  COUNT(sl.id) as total_leads,
  COUNT(sa.id) as total_analyses
FROM users u
LEFT JOIN sales_leads sl ON sl.customer_user_id = u.id
LEFT JOIN skin_analyses sa ON sa.user_id = u.id
WHERE u.assigned_sales_user_id = 'sales-staff-uuid'
  AND u.role LIKE 'customer%'
GROUP BY u.id;
```

### Get Clinic's Dashboard Data
```sql
-- Total customers
SELECT COUNT(*) FROM users 
WHERE clinic_id = 'clinic-uuid' 
  AND role LIKE 'customer%';

-- Total analyses
SELECT COUNT(*) FROM skin_analyses 
WHERE clinic_id = 'clinic-uuid';

-- Total revenue (this month)
SELECT SUM(total_amount) FROM invoices
WHERE clinic_id = 'clinic-uuid'
  AND status = 'paid'
  AND issue_date >= DATE_TRUNC('month', CURRENT_DATE);
```

### Get Pending Invitations
```sql
SELECT 
  i.*,
  u.full_name as invited_by_name,
  c.clinic_name
FROM invitations i
JOIN users u ON i.invited_by = u.id
JOIN clinics c ON i.clinic_id = c.id
WHERE i.status = 'pending'
  AND i.expires_at > NOW()
ORDER BY i.created_at DESC;
```

---

## 🔄 Migration Changes

### What Changed (customers → users)
| Old | New |
|-----|-----|
| `customers` table | `users` table with `role='customer'` |
| `appointments.customer_id → customers.id` | `appointments.customer_id → users.id` |
| `bookings.customer_id → customers.id` | `bookings.customer_id → users.id` |
| `treatment_records.customer_id → customers.id` | `treatment_records.customer_id → users.id` |

### Backward Compatibility
```sql
-- Legacy view available
CREATE VIEW customers_legacy AS
SELECT * FROM users 
WHERE role IN ('customer', 'customer_free', 'customer_premium');
```

---

## ⚡ Performance Indexes

### Most Used Indexes
```sql
-- Users
idx_users_clinic_id (clinic_id)
idx_users_email (email)
idx_users_role (role)

-- Skin Analyses
idx_skin_analyses_user_clinic (user_id, clinic_id) -- Composite
idx_skin_analyses_clinic_id (clinic_id)
idx_skin_analyses_sales_staff_id (sales_staff_id)

-- Sales Leads
idx_sales_leads_customer_user_id (customer_user_id)
idx_sales_leads_sales_user_id (sales_user_id)
idx_sales_leads_clinic_id (clinic_id)

-- Appointments
idx_appointments_customer_id (customer_id)
idx_appointments_clinic_id (clinic_id)
```

---

## 🛡️ RLS Policy Patterns

### Check User's Clinic
```sql
CREATE POLICY "name" ON table_name
FOR SELECT USING (
  clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
);
```

### Check User's Role
```sql
CREATE POLICY "name" ON table_name
FOR SELECT USING (
  is_sales_staff(auth.uid()) OR
  is_clinic_owner(auth.uid())
);
```

### Own Data Only
```sql
CREATE POLICY "name" ON table_name
FOR SELECT USING (
  user_id = auth.uid()
);
```

---

## 🔧 Helper Functions

### Check Database Health
```sql
SELECT check_database_health();
-- Returns: health_status, foreign_keys, indexes, orphaned_records, etc.
```

### Role Checks
```sql
SELECT is_sales_staff('user-uuid');
SELECT is_clinic_owner('user-uuid');
SELECT is_super_admin('user-uuid');
```

### Get User's Clinic
```sql
SELECT get_user_clinic_id('user-uuid');
```

---

## 📊 Enum Types

### user_role
```sql
'public', 'free_user', 'premium_customer', 'clinic_staff', 
'clinic_admin', 'sales_staff', 'super_admin', 
'customer_free', 'customer_premium', 'clinic_owner', 
'clinic_manager', 'customer'
```

### analysis_tier
```sql
'free', 'premium', 'clinical'
```

### lead_status
```sql
'new', 'contacted', 'qualified', 'proposal_sent', 
'negotiation', 'won', 'lost'
```

### appointment_status
```sql
'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
```

---

## 🚨 Important Notes

### ⚠️ Deprecated
- `customers` table - Use `users` instead
- Direct FK to `customers` - All updated to `users`

### ✅ Best Practices
1. Always filter by `clinic_id` for multi-tenancy
2. Use indexes (check with EXPLAIN ANALYZE)
3. Use RLS policies for security
4. Check health regularly: `check_database_health()`

### 🔒 Security
- All `public` schema tables have RLS enabled
- Auth tokens managed by Supabase
- Sensitive data encrypted at rest

---

## 📱 Quick Commands

### Check FK Pointing to Users
```sql
SELECT 
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name NOT LIKE '%backup%'
  AND kcu.column_name LIKE '%customer%';
```

### Find Orphaned Records
```sql
-- Run health check
SELECT check_database_health();

-- Manual check
SELECT COUNT(*) FROM skin_analyses sa
LEFT JOIN users u ON sa.user_id = u.id
WHERE u.id IS NULL;
```

### Check Index Usage
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;
```

---

**Version**: 1.0  
**Last Updated**: December 26, 2025  
**Related Docs**: 
- DATABASE_ERD.md
- CUSTOMERS_MIGRATION_REPORT.md
- API_TEST_RESULTS.md
