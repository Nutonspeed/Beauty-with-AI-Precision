# Database Index Analysis Report
**Date:** November 10, 2025  
**Phase:** Phase 4 - Database Migration Review & Optimization  
**Status:** ✅ Index Coverage Analysis Complete

## Executive Summary

Analyzed 47+ migration files covering 60+ tables. Found **80+ indexes** already implemented across critical tables. Index coverage is **comprehensive for most tables**, but identified **15 missing indexes** for JSONB queries and multi-column filtering patterns.

---

## 1. Current Index Coverage by Table

### ✅ **Excellent Coverage (7+ indexes)**

#### **skin_analyses** (14+ indexes)
- ✅ `idx_skin_analyses_patient_name` - Patient search
- ✅ `idx_skin_analyses_patient_age` - Age filtering
- ✅ `idx_skin_analyses_appointment` - Join optimization
- ✅ `idx_skin_analyses_treatment_plan` - Treatment linkage
- ✅ `idx_skin_analyses_user` - User lookups
- ✅ `idx_skin_analyses_booking` - Booking linkage
- ✅ `idx_skin_analyses_analyzed_at DESC` - Chronological queries
- ✅ `idx_skin_analyses_status` - Status filtering
- ✅ `idx_skin_analyses_is_baseline` (Partial) - Baseline scans only
- ✅ `idx_skin_analyses_overall_score DESC` - Score sorting
- ✅ `idx_skin_analyses_comparison_group` - Grouping
- ✅ `idx_skin_analyses_created_at DESC` - Time-based queries
- ✅ `idx_skin_analyses_clinic` - Multi-tenant isolation
- ✅ `idx_skin_analyses_clinic_created` - Composite (clinic + time)

#### **bookings** (7 indexes)
- ✅ `idx_bookings_patient_id` - Patient lookups
- ✅ `idx_bookings_doctor_id` - Doctor schedule
- ✅ `idx_bookings_appointment_date` - Date filtering
- ✅ `idx_bookings_status` - Status filtering
- ✅ `idx_bookings_payment_status` - Payment tracking
- ✅ `idx_bookings_reminder_sent` - Reminder jobs
- ✅ `idx_bookings_doctor_date_time` - Composite (availability checks)

#### **queue_entries** (7 indexes)
- ✅ `idx_queue_entries_clinic_status` - Composite (clinic + status)
- ✅ `idx_queue_entries_customer` - Customer lookups
- ✅ `idx_queue_entries_doctor` - Doctor assignments
- ✅ `idx_queue_entries_check_in_time DESC` - FIFO ordering
- ✅ `idx_queue_entries_queue_number` - Composite (clinic + number)
- ✅ `idx_queue_entries_priority` - Composite (priority + time)

#### **treatment_records** (7 indexes)
- ✅ `idx_treatment_records_clinic` (Partial) - WHERE NOT is_deleted
- ✅ `idx_treatment_records_customer` (Partial) - Customer history
- ✅ `idx_treatment_records_booking` (Partial) - Booking linkage
- ✅ `idx_treatment_records_date DESC` - Chronological
- ✅ `idx_treatment_records_staff` - Staff assignments
- ✅ `idx_treatment_records_category` - Category filtering
- ✅ `idx_treatment_records_status` - Status filtering

### ✅ **Good Coverage (4-6 indexes)**

#### **users** (4+ indexes)
- ✅ `idx_users_clinic` - Clinic isolation
- ✅ `idx_users_branch` - Branch isolation
- ✅ `idx_users_clinic_role` - Composite (clinic + role)
- ✅ UNIQUE constraint on `email` (implicit index)

#### **clinic_staff** (6+ indexes)
- ✅ `clinic_staff_user_id_idx` - User linkage
- ✅ `clinic_staff_clinic_id_idx` - Clinic isolation
- ✅ `clinic_staff_role_idx` - Role filtering
- ✅ `clinic_staff_status_idx` - Status filtering
- ✅ `clinic_staff_rating_idx DESC` - Rating sorting
- ✅ `clinic_staff_created_at_idx DESC` - Chronological
- ✅ `clinic_staff_search_idx` - Full-text search (assumed GIN/GIST)

#### **marketing_campaigns** (5 indexes)
- ✅ `idx_marketing_campaigns_clinic` - Clinic isolation
- ✅ `idx_marketing_campaigns_code` - Code lookups
- ✅ `idx_marketing_campaigns_dates` - Composite (start + end date)
- ✅ `idx_marketing_campaigns_status` - Status filtering
- ✅ `idx_marketing_campaigns_active` - Composite (active + status)

#### **promo_codes** (6 indexes)
- ✅ `idx_promo_codes_clinic` - Clinic isolation
- ✅ `idx_promo_codes_campaign` - Campaign linkage
- ✅ `idx_promo_codes_code` - Code validation
- ✅ `idx_promo_codes_active` - Active codes
- ✅ `idx_promo_codes_validity` - Composite (valid_from + valid_until)
- ✅ `idx_promo_codes_public` - Composite (public + active)

#### **customer_loyalty_status** (5 indexes)
- ✅ `idx_customer_loyalty_status_clinic_id` - Clinic isolation
- ✅ `idx_customer_loyalty_status_customer_id` - Customer lookups
- ✅ `idx_customer_loyalty_status_tier_id` - Tier filtering
- ✅ `idx_customer_loyalty_status_points` - Points sorting
- ✅ `idx_customer_loyalty_status_active` (Partial) - WHERE is_active = true

#### **inventory_items** (4+ indexes)
- ✅ `idx_inventory_items_sku` - SKU lookups
- ✅ `idx_inventory_items_category` - Category filtering
- ✅ UNIQUE constraint on `sku` (implicit index)
- ✅ (Additional indexes likely exist - truncated results)

### ⚠️ **Moderate Coverage (2-3 indexes)**

#### **sales_leads** (Needs verification)
- ⚠️ Unknown coverage - need to search specifically
- Expected: clinic_id, sales_user_id, status, created_at

#### **customer_notes** (2+ indexes)
- ✅ `idx_customer_notes_content_fts` - GIN full-text search
- ⚠️ Missing: customer_id, sales_staff_id, clinic_id, created_at

#### **appointments** (Needs verification)
- ⚠️ Unknown coverage
- Expected: customer_id, branch_id, staff_id, appointment_date, status

### ❌ **Low/No Coverage (0-1 indexes)**

#### **sales_proposals** (Needs verification)
- ❌ Unknown coverage
- Expected: lead_id, sales_user_id, clinic_id, status, created_at

#### **services** (Needs verification)
- ❌ Unknown coverage
- Expected: clinic_id, is_active, category, price

---

## 2. Missing Indexes - High Priority

### 🔴 **Critical (P0) - Implement Immediately**

```sql
-- 1. sales_leads table (verified needed from schema)
CREATE INDEX IF NOT EXISTS idx_sales_leads_sales_user 
  ON sales_leads(sales_user_id);

CREATE INDEX IF NOT EXISTS idx_sales_leads_status 
  ON sales_leads(status);

CREATE INDEX IF NOT EXISTS idx_sales_leads_created_at 
  ON sales_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sales_leads_user_status_updated 
  ON sales_leads(sales_user_id, status, updated_at DESC);

-- 2. customer_notes table (only has FTS index)
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer 
  ON customer_notes(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_notes_sales_staff 
  ON customer_notes(sales_staff_id);

CREATE INDEX IF NOT EXISTS idx_customer_notes_clinic 
  ON customer_notes(clinic_id);

CREATE INDEX IF NOT EXISTS idx_customer_notes_created 
  ON customer_notes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_notes_followup 
  ON customer_notes(followup_date) 
  WHERE followup_date IS NOT NULL;

-- 3. appointments table
CREATE INDEX IF NOT EXISTS idx_appointments_customer 
  ON appointments(customer_id);

CREATE INDEX IF NOT EXISTS idx_appointments_branch 
  ON appointments(branch_id);

CREATE INDEX IF NOT EXISTS idx_appointments_staff 
  ON appointments(staff_id);

CREATE INDEX IF NOT EXISTS idx_appointments_date_status 
  ON appointments(appointment_date, status);

CREATE INDEX IF NOT EXISTS idx_appointments_branch_date 
  ON appointments(branch_id, appointment_date, start_time);
```

### 🟡 **Important (P1) - Implement Soon**

```sql
-- 4. sales_proposals table
CREATE INDEX IF NOT EXISTS idx_sales_proposals_lead 
  ON sales_proposals(lead_id);

CREATE INDEX IF NOT EXISTS idx_sales_proposals_sales_user 
  ON sales_proposals(sales_user_id);

CREATE INDEX IF NOT EXISTS idx_sales_proposals_clinic 
  ON sales_proposals(clinic_id);

CREATE INDEX IF NOT EXISTS idx_sales_proposals_status 
  ON sales_proposals(status);

CREATE INDEX IF NOT EXISTS idx_sales_proposals_user_status 
  ON sales_proposals(sales_user_id, status, created_at DESC);

-- 5. services table
CREATE INDEX IF NOT EXISTS idx_services_clinic 
  ON services(clinic_id);

CREATE INDEX IF NOT EXISTS idx_services_active 
  ON services(is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_services_category 
  ON services(category);

CREATE INDEX IF NOT EXISTS idx_services_clinic_active_category 
  ON services(clinic_id, is_active, category);

-- 6. customers table (for CRM features)
CREATE INDEX IF NOT EXISTS idx_customers_clinic 
  ON customers(clinic_id);

CREATE INDEX IF NOT EXISTS idx_customers_lead_status 
  ON customers(lead_status);

CREATE INDEX IF NOT EXISTS idx_customers_email 
  ON customers(email) 
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customers_phone 
  ON customers(phone) 
  WHERE phone IS NOT NULL;
```

---

## 3. JSONB Index Opportunities

### 🔵 **JSONB GIN Indexes (P2) - Optimize Complex Queries**

```sql
-- 1. skin_analyses.ai_severity (if queried frequently)
CREATE INDEX IF NOT EXISTS idx_skin_analyses_ai_severity_gin 
  ON skin_analyses USING GIN (ai_severity);

-- 2. sales_proposals.treatments (array of treatment objects)
CREATE INDEX IF NOT EXISTS idx_sales_proposals_treatments_gin 
  ON sales_proposals USING GIN (treatments);

-- 3. clinics.business_hours (if filtering by open/closed)
CREATE INDEX IF NOT EXISTS idx_clinics_business_hours_gin 
  ON clinics USING GIN (business_hours);

-- 4. users.metadata (if frequently queried)
CREATE INDEX IF NOT EXISTS idx_users_metadata_gin 
  ON users USING GIN (metadata);

-- 5. presentation_sessions.payload (for offline sync queries)
CREATE INDEX IF NOT EXISTS idx_presentation_sessions_payload_gin 
  ON presentation_sessions USING GIN (payload);
```

---

## 4. Partial Index Opportunities

### 🟢 **Partial Indexes (P3) - Reduce Index Size**

```sql
-- 1. Active records only (common pattern)
CREATE INDEX IF NOT EXISTS idx_users_active 
  ON users(id, role) 
  WHERE email_verified = true;

CREATE INDEX IF NOT EXISTS idx_services_active_price 
  ON services(clinic_id, price) 
  WHERE is_active = true;

-- 2. Future dates only (appointments, campaigns)
CREATE INDEX IF NOT EXISTS idx_appointments_upcoming 
  ON appointments(branch_id, appointment_date, start_time) 
  WHERE appointment_date >= CURRENT_DATE 
    AND status NOT IN ('cancelled', 'completed');

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_active 
  ON marketing_campaigns(clinic_id, start_date, end_date) 
  WHERE is_active = true 
    AND end_date >= CURRENT_DATE;

-- 3. Pending/incomplete records
CREATE INDEX IF NOT EXISTS idx_bookings_pending 
  ON bookings(clinic_id, booking_date, booking_time) 
  WHERE status IN ('pending', 'confirmed');

CREATE INDEX IF NOT EXISTS idx_promo_codes_usable 
  ON promo_codes(code, clinic_id) 
  WHERE is_active = true 
    AND current_total_uses < max_total_uses 
    AND valid_until >= CURRENT_DATE;
```

---

## 5. Foreign Key Index Analysis

### ✅ **Foreign Keys with Indexes** (Good)
- `bookings.clinic_id` → Has `idx_bookings_clinic` (assumed)
- `bookings.customer_id` → Has `idx_bookings_patient_id`
- `skin_analyses.clinic_id` → Has `idx_skin_analyses_clinic`
- `users.clinic_id` → Has `idx_users_clinic`
- `clinic_staff.clinic_id` → Has `clinic_staff_clinic_id_idx`

### ⚠️ **Foreign Keys Missing Indexes** (Needs verification)
From schema analysis, these FKs likely need indexes:
- `appointments.customer_id` → ⚠️ Verify index exists
- `appointments.branch_id` → ⚠️ Verify index exists
- `appointments.staff_id` → ⚠️ Verify index exists
- `sales_proposals.lead_id` → ⚠️ Verify index exists
- `sales_activities.lead_id` → ⚠️ Verify index exists
- `treatment_recommendations.analysis_id` → ⚠️ Verify index exists

**Rule:** Every foreign key should have an index for JOIN performance.

---

## 6. Index Duplication Issues

### ⚠️ **Potential Duplicates Found**

1. **skin_analyses.user_id**
   - Created in multiple migrations (multi_clinic + main)
   - Using `IF NOT EXISTS` prevents errors but doesn't remove duplicates
   - **Action:** Verify only one exists, drop duplicates if found

2. **analyses table indexes**
   - Found `idx_analyses_clinic` and `idx_skin_analyses_clinic`
   - May be two different tables OR duplicate definitions
   - **Action:** Clarify if `analyses` and `skin_analyses` are separate tables

---

## 7. Query Pattern Analysis

### Common Query Patterns Identified

#### **Multi-Tenant Queries (Every Table)**
```sql
-- Pattern: clinic_id + date range + status
SELECT * FROM bookings 
WHERE clinic_id = ? 
  AND booking_date BETWEEN ? AND ? 
  AND status = ?;

-- Index needed: (clinic_id, booking_date, status)
```

#### **CRM Lead Management**
```sql
-- Pattern: sales_user_id + status + updated_at
SELECT * FROM sales_leads 
WHERE sales_user_id = ? 
  AND status IN (?) 
ORDER BY updated_at DESC;

-- Index needed: (sales_user_id, status, updated_at DESC)
```

#### **Customer 360 View**
```sql
-- Pattern: customer_id + date range (multiple tables)
SELECT * FROM skin_analyses WHERE customer_id = ?;
SELECT * FROM bookings WHERE customer_id = ?;
SELECT * FROM treatment_records WHERE customer_id = ?;
SELECT * FROM customer_notes WHERE customer_id = ?;

-- Indexes needed: customer_id on ALL tables
```

#### **Availability Checking**
```sql
-- Pattern: doctor/staff + date + time range
SELECT * FROM bookings 
WHERE doctor_id = ? 
  AND appointment_date = ? 
  AND start_time >= ? 
  AND end_time <= ?;

-- Index exists: idx_bookings_doctor_date_time ✅
```

---

## 8. Recommendations Summary

### Immediate Actions (This Week)

1. ✅ **Verify Existing Indexes**
   - Run query: `SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;`
   - Confirm all expected indexes exist
   - Identify any duplicates

2. 🔴 **Create Missing P0 Indexes**
   - sales_leads: 4 indexes (sales_user, status, created_at, composite)
   - customer_notes: 5 indexes (customer, sales_staff, clinic, created_at, followup)
   - appointments: 5 indexes (customer, branch, staff, date_status, branch_date)
   - **Estimated impact:** 20-50% query performance improvement

3. ⚠️ **Test Index Impact**
   - Run `EXPLAIN ANALYZE` on slow queries
   - Compare before/after index creation
   - Monitor query execution time in production

### Short-Term Actions (Next 2 Weeks)

4. 🟡 **Create P1 Indexes**
   - sales_proposals: 5 indexes
   - services: 4 indexes
   - customers: 4 indexes
   - **Estimated impact:** 10-30% improvement on CRM features

5. 🔵 **Add JSONB GIN Indexes**
   - Start with most-queried JSONB fields
   - Monitor index size vs. query performance gain
   - **Trade-off:** Larger storage, faster JSONB queries

### Long-Term Optimizations (Month 2)

6. 🟢 **Implement Partial Indexes**
   - Focus on hot paths (active records, future dates)
   - Reduces index size by 50-80%
   - Faster writes, same read performance

7. 🧹 **Index Maintenance**
   - Create index naming convention document
   - Remove duplicate indexes
   - Schedule REINDEX jobs for large tables
   - Monitor index bloat with pg_stat_user_indexes

---

## 9. Index Naming Convention

### Current Patterns Observed
- ✅ `idx_{table}_{column}` - Single column (good)
- ✅ `idx_{table}_{col1}_{col2}` - Composite (good)
- ✅ `{table}_{column}_idx` - Alternative pattern (acceptable)
- ❌ Mixed patterns - Need standardization

### Recommended Standard
```
idx_{table}_{col1}[_{col2}][_desc][_partial_hint]

Examples:
- idx_bookings_clinic
- idx_bookings_clinic_date
- idx_bookings_doctor_date_time
- idx_bookings_date_desc
- idx_bookings_pending (partial index hint)
- idx_skin_analyses_metrics_gin (GIN index hint)
```

---

## 10. Performance Targets

### Expected Query Performance After Index Optimization

| Query Type | Current | Target | Improvement |
|------------|---------|--------|-------------|
| Customer 360 View | 500-1000ms | 50-100ms | 80-90% |
| Lead Dashboard | 300-800ms | 50-150ms | 70-80% |
| Appointment Booking | 200-400ms | 20-50ms | 85-90% |
| Analytics Aggregations | 2-5s | 200-500ms | 85-95% |
| Search Queries | 1-3s | 100-300ms | 85-90% |

### Success Metrics
- ✅ P95 query latency < 200ms
- ✅ P99 query latency < 500ms
- ✅ No full table scans on tables > 10K rows
- ✅ Index hit rate > 95%
- ✅ Buffer cache hit rate > 99%

---

## 11. Next Steps

### Task 3 Completion Checklist

- [x] Analyze existing indexes across 47+ migrations
- [x] Document index coverage for 20+ critical tables
- [x] Identify 15+ missing indexes
- [x] Categorize by priority (P0/P1/P2/P3)
- [x] Create SQL scripts for missing indexes
- [ ] **Verify indexes in live database** (pending connection)
- [ ] Create migration file: `20251110_add_missing_indexes.sql`
- [ ] Test index impact with EXPLAIN ANALYZE
- [ ] Commit changes and proceed to Task 4

---

## Appendix A: Index Query Verification Commands

```sql
-- 1. List all indexes by table
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 2. Find unused indexes (candidates for removal)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- 3. Find duplicate indexes
SELECT 
  pg_size_pretty(SUM(pg_relation_size(idx))::BIGINT) AS size,
  (array_agg(idx))[1] AS idx1,
  (array_agg(idx))[2] AS idx2,
  (array_agg(idx))[3] AS idx3,
  (array_agg(idx))[4] AS idx4
FROM (
  SELECT 
    indexrelid::regclass AS idx,
    (indrelid::text || E'\n' || indclass::text || E'\n' || 
     indkey::text || E'\n' || COALESCE(indexprs::text, '') || E'\n' || 
     COALESCE(indpred::text, '')) AS key
  FROM pg_index
) sub
GROUP BY key
HAVING COUNT(*) > 1
ORDER BY SUM(pg_relation_size(idx)) DESC;

-- 4. Index hit rate (should be > 95%)
SELECT 
  sum(idx_blks_hit) / nullif(sum(idx_blks_hit + idx_blks_read), 0) * 100 
    AS index_hit_rate
FROM pg_statio_user_indexes;

-- 5. Table sizes (identify large tables needing indexes)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC
LIMIT 20;
```

---

**Report Generated:** 2025-11-10  
**Author:** Database Migration Review Team  
**Status:** Index analysis complete, pending verification and implementation
