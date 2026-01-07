# 🏗️ ClinicIQ - Data Flow Architecture & Dashboard Integration

**Date**: December 26, 2025  
**Version**: 1.0.0

---

## 📊 System Overview

ClinicIQ เป็นระบบ Multi-tenant Clinic Management Platform ที่รองรับ 4 ระดับผู้ใช้หลัก:
- **Super Admin** - จัดการระบบทั้งหมด
- **Clinic Owner/Admin** - จัดการคลินิก
- **Sales Staff** - ขายและดูแลลูกค้า
- **Customer** - ลูกค้า/ผู้ใช้บริการ

---

## 🗄️ Core Database Schema & Relationships

### 1. **Central Tables**

#### `clinics` - คลินิก (Hub แห่งข้อมูล)
```
id (PK)
name
owner_id -> users.id
clinic_code
subscription_tier
max_sales_staff
max_analyses_per_month
```

#### `users` - ผู้ใช้งาน (Core Entity)
```
id (PK)
email
role (enum: super_admin, clinic_owner, clinic_admin, sales_staff, customer)
clinic_id -> clinics.id  ⭐ Multi-tenant key
assigned_sales_user_id -> users.id  ⭐ Customer assignment
```

#### `invitations` - ระบบเชิญ
```
id (PK)
email
invited_role
clinic_id -> clinics.id
invited_by -> users.id
token (unique)
status (pending/accepted/expired)
expires_at
```

---

### 2. **Business Flow Tables**

#### Sales & CRM
```
sales_leads
├── customer_user_id -> users.id
├── sales_user_id -> users.id  ⭐ Sales assignment
├── clinic_id -> clinics.id
└── status (new/qualified/proposal/won/lost)

sales_proposals
├── lead_id -> sales_leads.id
├── created_by -> users.id
└── clinic_id -> clinics.id

chat_history
├── user_id -> users.id
└── clinic_id -> clinics.id
```

#### Skin Analysis & AI
```
skin_analyses (40 rows)
├── user_id (text/uuid) ⚠️ Mixed types
├── clinic_id -> clinics.id
├── sales_staff_id -> users.id
├── branch_id -> branches.id
└── analysis_data (jsonb)
```

#### Appointments & Bookings
```
appointments
├── customer_id -> customers.id
├── staff_id -> auth.users.id
├── clinic_id -> clinics.id
└── invoice_id -> invoices.id

bookings
├── customer_id -> customers.id
├── clinic_id -> clinics.id
└── service_id -> services.id

customers (separate from users)
├── clinic_id -> clinics.id
└── created_by -> auth.users.id
```

#### Treatment & Records
```
treatment_records
├── customer_id -> customers.id
├── staff_id -> auth.users.id
└── clinic_id -> clinics.id

treatments
└── clinic_id -> clinics.id
```

---

## 🔄 Complete Data Flow

### Flow 1: **Invitation → User → Clinic Assignment**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Sales Staff Creates Invitation                              │
│    POST /api/invitations                                        │
│    ├── email: "customer@example.com"                           │
│    ├── invited_role: "customer"                                │
│    ├── clinic_id: [sales staff's clinic]                       │
│    └── invited_by: [sales staff user_id]                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Customer Receives Email with Token                          │
│    GET /invitations/[token]                                     │
│    └── Validates invitation                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Customer Accepts Invitation                                 │
│    POST /api/invitations/[token]/accept                        │
│    ├── Creates auth.users (email, password)                    │
│    └── Calls accept_invitation()                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Database Function: accept_invitation()                      │
│    INSERT/UPDATE public.users SET                              │
│    ├── role = "customer" ✅                                     │
│    ├── clinic_id = [invitation.clinic_id] ✅                   │
│    ├── assigned_sales_user_id = [invitation.invited_by] ✅     │
│    └── invitation.status = "accepted" ✅                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Customer Now Belongs To                                     │
│    ├── Clinic (multi-tenant isolation) 🏥                      │
│    ├── Sales Staff (for tracking & commission) 👤              │
│    └── Ready to use system ✅                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### Flow 2: **Customer Journey → Sales Funnel**

```
Customer Login
    ↓
┌─────────────────────────┐
│ Customer Dashboard      │
│ /dashboard              │
│ - View own analyses     │
│ - Book appointments     │
│ - Chat with sales       │
└─────────────────────────┘
    ↓ (can request)
┌─────────────────────────┐
│ Skin Analysis           │
│ /analysis               │
│ POST /api/skin-analysis │
│ - AI analysis (Gemini)  │
│ - 8-mode detection      │
│ - Creates skin_analyses │
└─────────────────────────┘
    ↓ (auto creates)
┌─────────────────────────┐
│ Sales Lead              │
│ - lead_source: "ai_scan"│
│ - customer_user_id ✅   │
│ - sales_user_id ✅      │
│   (from assigned_sales) │
│ - clinic_id ✅          │
└─────────────────────────┘
    ↓ (sales staff)
┌─────────────────────────┐
│ Sales Proposal          │
│ - Created by sales      │
│ - Linked to lead        │
│ - Can send via email    │
└─────────────────────────┘
    ↓ (customer accepts)
┌─────────────────────────┐
│ Appointment/Booking     │
│ - customer_id ✅        │
│ - staff_id ✅           │
│ - clinic_id ✅          │
│ - Creates invoice       │
└─────────────────────────┘
    ↓ (after treatment)
┌─────────────────────────┐
│ Treatment Record        │
│ - Progress notes        │
│ - Before/after photos   │
│ - clinic_id ✅          │
└─────────────────────────┘
```

---

## 📱 Dashboard Architecture

### 1. **Sales Dashboard** (`/sales/dashboard`)

**Primary Role**: `sales_staff`  
**Also Access**: `clinic_admin`, `clinic_owner`, `super_admin`

**Data Sources**:
```typescript
API Endpoints:
├── /api/sales/metrics           // Today's KPIs
├── /api/sales/overview          // Week/month stats
├── /api/sales/funnel            // Conversion rates
└── /api/sales/recent-activities // Latest actions

Database Queries (via RLS):
├── sales_leads (WHERE sales_user_id = current_user)
├── sales_proposals (WHERE created_by = current_user)
├── skin_analyses (WHERE sales_staff_id = current_user)
└── users (WHERE assigned_sales_user_id = current_user)
```

**Key Features**:
- Real-time metrics (calls, leads, proposals)
- Conversion funnel visualization
- AI-driven lead scoring
- Customer assignment tracking
- Revenue per sales staff

**RLS Policy**:
```sql
-- Sales staff can only see their own data
users_select_sales_assigned_customers:
  is_sales_staff(auth.uid()) 
  AND assigned_sales_user_id = auth.uid()
  AND clinic_id = get_user_clinic(auth.uid())
```

---

### 2. **Clinic Dashboard** (`/clinic/dashboard` → redirects to `/clinic/revenue`)

**Primary Role**: `clinic_owner`, `clinic_admin`  
**Also Access**: `super_admin`

**Data Sources**:
```typescript
API Endpoints:
├── /api/clinic/dashboard/stats      // Overall clinic metrics
├── /api/clinic/analytics/revenue    // Revenue breakdown
├── /api/clinic/analytics/treatments // Treatment statistics
├── /api/clinic/analytics/staff-performance // Staff KPIs
└── /api/clinic/analytics/customer-retention // Retention rates

Database Queries:
├── ALL users (WHERE clinic_id = current_user.clinic_id)
├── ALL sales_leads (WHERE clinic_id = ...)
├── ALL appointments (WHERE clinic_id = ...)
├── ALL bookings (WHERE clinic_id = ...)
├── ALL skin_analyses (WHERE clinic_id = ...)
└── ALL treatment_records (WHERE clinic_id = ...)
```

**Key Features**:
- Revenue dashboard (primary)
- Staff performance tracking
- Customer retention analysis
- Treatment analytics
- Appointment management
- Payment tracking

**RLS Policy**:
```sql
-- Clinic admin sees all clinic data
users_select_clinic_scope:
  is_clinic_admin(auth.uid())
  AND clinic_id = get_user_clinic(auth.uid())
```

---

### 3. **Beautician Dashboard** (`/beautician/dashboard`)

**Primary Role**: `clinic_staff`, `beautician`

**Data Sources**:
```typescript
API Endpoints:
├── /api/beautician/appointments  // Today's schedule
├── /api/beautician/customers     // Assigned customers
└── /api/beautician/treatments    // Treatment history

Database Queries:
├── appointments (WHERE staff_id = current_user)
├── treatment_records (WHERE staff_id = current_user)
└── customers (via appointments)
```

**Key Features**:
- Daily appointment schedule
- Customer treatment history
- Treatment notes
- Before/after photos

---

### 4. **Admin Dashboard** (`/admin`)

**Primary Role**: `super_admin`

**Data Sources**:
```typescript
API Endpoints:
├── /api/admin/analytics          // System-wide analytics
├── /api/admin/revenue-analytics  // All clinics revenue
├── /api/admin/ai-analytics       // AI usage stats
└── /api/admin/clinics/performance // Clinic comparisons

Database Queries:
├── ALL clinics (no RLS filter)
├── ALL users (no RLS filter)
├── ALL tables (super admin bypass)
```

**Key Features**:
- System-wide analytics
- Multi-clinic comparison
- User management
- Error monitoring
- System health

**RLS Policy**:
```sql
-- Super admin bypasses all RLS
Super admins full access:
  is_super_admin(auth.uid())
```

---

## 🔐 Multi-Tenant Data Isolation (RLS)

### Row-Level Security Flow

```
User Login
    ↓
┌────────────────────────────────┐
│ JWT Token with Claims          │
│ ├── sub: user_id               │
│ ├── email: user@example.com    │
│ └── role: authenticated        │
└────────────────────────────────┘
    ↓
┌────────────────────────────────┐
│ Query Database                 │
│ SELECT * FROM users            │
└────────────────────────────────┘
    ↓
┌────────────────────────────────┐
│ RLS Policy Evaluation          │
│                                │
│ IF role = 'sales_staff'        │
│   THEN show only:              │
│   - own data                   │
│   - assigned customers         │
│   - same clinic data           │
│                                │
│ IF role = 'clinic_admin'       │
│   THEN show:                   │
│   - all clinic data            │
│   - all staff in clinic        │
│   - all customers in clinic    │
│                                │
│ IF role = 'super_admin'        │
│   THEN show:                   │
│   - EVERYTHING (bypass RLS)    │
└────────────────────────────────┘
    ↓
┌────────────────────────────────┐
│ Filtered Results Returned      │
│ ✅ Multi-tenant isolation      │
│ ✅ Role-based access           │
│ ✅ Data security               │
└────────────────────────────────┘
```

---

## 📊 Data Flow by Feature

### Feature 1: **Quick Scan** (Sales Tool)

```
1. Sales Staff: /sales/quick-scan
   ├── Select/create customer
   ├── Capture face images (front, left, right)
   └── POST /api/skin-analysis/gemini-analyze

2. AI Analysis (Gemini)
   ├── 8-mode detection
   ├── Skin age calculation
   ├── Concerns identification
   └── Treatment recommendations

3. Create Records
   ├── INSERT skin_analyses
   │   ├── user_id = customer.id
   │   ├── sales_staff_id = current_user.id
   │   ├── clinic_id = current_user.clinic_id
   │   └── analysis_data (jsonb)
   │
   └── INSERT/UPDATE sales_leads
       ├── customer_user_id = customer.id
       ├── sales_user_id = current_user.id
       ├── clinic_id = current_user.clinic_id
       ├── lead_source = "quick_scan"
       └── status = "new"

4. Dashboard Updates
   ├── Sales Dashboard: +1 scan, +1 lead
   ├── Clinic Dashboard: +1 analysis
   └── Customer Profile: New analysis available
```

---

### Feature 2: **Appointment Booking**

```
1. Customer/Sales: Book appointment
   └── POST /api/appointments

2. Create Records
   ├── INSERT appointments
   │   ├── customer_id
   │   ├── staff_id (beautician)
   │   ├── clinic_id ✅
   │   ├── service_id
   │   └── booking_date/time
   │
   └── CREATE invoice (if prepaid)
       └── invoice_id linked to appointment

3. Notifications
   ├── Email to customer (confirmation)
   ├── Email to staff (schedule update)
   └── Dashboard notification

4. Dashboard Updates
   ├── Clinic Dashboard: +1 booking
   ├── Beautician Dashboard: +1 appointment
   └── Customer Dashboard: Show upcoming
```

---

### Feature 3: **Sales Proposal Flow**

```
1. Sales Staff creates proposal
   ├── Based on skin analysis
   ├── Includes treatments
   ├── Pricing and packages
   └── POST /api/sales/proposals

2. Send to Customer
   ├── Email with proposal link
   ├── /proposals/[token]
   └── Customer can view/accept

3. Customer Accepts
   ├── PUT /api/sales/proposals/[id]/accept
   ├── UPDATE sales_leads (status = "won")
   └── Can proceed to booking

4. Dashboard Updates
   ├── Sales Dashboard: +1 proposal, +1 won
   ├── Clinic Dashboard: +1 revenue
   └── Sales commission calculated
```

---

## 🎯 Data Consistency Rules

### 1. **Clinic ID Propagation**
```
✅ MUST have clinic_id:
- users (for clinic staff & customers)
- sales_leads
- skin_analyses
- appointments
- bookings
- treatment_records
- invoices
- payments

⚠️ Optional clinic_id:
- invitations (before accept)
- customers (legacy table)
```

### 2. **User Assignment Chain**
```
invitation.invited_by
    ↓
user.assigned_sales_user_id
    ↓
sales_leads.sales_user_id
    ↓
sales_proposals.created_by
    ↓
appointments.staff_id
```

### 3. **Multi-Tenant Isolation**
```
WHERE clinic_id = get_user_clinic_id()

Applied to:
✅ All SELECT queries
✅ All INSERT operations
✅ All UPDATE operations
✅ All DELETE operations
```

---

## 📈 Analytics Data Aggregation

### Clinic-Level Analytics
```sql
-- Revenue by period
SELECT 
  DATE_TRUNC('day', created_at) as date,
  SUM(total_amount) as revenue,
  COUNT(*) as transaction_count
FROM invoices
WHERE clinic_id = :clinic_id
  AND status = 'paid'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Sales staff performance
SELECT 
  u.id,
  u.email,
  COUNT(DISTINCT sl.id) as total_leads,
  COUNT(DISTINCT CASE WHEN sl.status = 'won' THEN sl.id END) as won_leads,
  SUM(CASE WHEN sl.status = 'won' THEN sl.value ELSE 0 END) as revenue
FROM users u
LEFT JOIN sales_leads sl ON sl.sales_user_id = u.id
WHERE u.clinic_id = :clinic_id
  AND u.role = 'sales_staff'
GROUP BY u.id, u.email;
```

---

## 🚀 Performance Considerations

### 1. **Indexes**
```sql
-- Multi-tenant queries
CREATE INDEX idx_users_clinic_id ON users(clinic_id);
CREATE INDEX idx_sales_leads_clinic_id ON sales_leads(clinic_id);
CREATE INDEX idx_appointments_clinic_id ON appointments(clinic_id);

-- User lookups
CREATE INDEX idx_users_assigned_sales ON users(assigned_sales_user_id);
CREATE INDEX idx_sales_leads_customer ON sales_leads(customer_user_id);
CREATE INDEX idx_sales_leads_sales_user ON sales_leads(sales_user_id);

-- Status filters
CREATE INDEX idx_invitations_status_expires ON invitations(status, expires_at);
CREATE INDEX idx_sales_leads_status ON sales_leads(status);
```

### 2. **Query Optimization**
- Use RPC functions for complex queries
- Pre-aggregate data for dashboards
- Cache frequently accessed data
- Use materialized views for reports

---

## ⚠️ Known Issues & Recommendations

### 1. **Data Type Inconsistency**
```
skin_analyses.user_id = text (should be uuid)
- ❌ Contains demo values like "demo-user-123"
- ✅ Should be standardized to UUID
- 🔧 Migration needed
```

### 2. **Duplicate Tables**
```
customers vs users
- customers: legacy table (27 columns)
- users: current table (98 columns)
- 🔧 Recommend: Migrate to users only
```

### 3. **Foreign Key Gaps**
```
skin_analyses.user_id (text) -/-> users.id (uuid)
- No foreign key constraint
- Data integrity risk
- 🔧 Fix data types first
```

---

## 📝 Next Steps

### Short Term
- [ ] Fix skin_analyses.user_id type
- [ ] Migrate customers → users
- [ ] Add missing foreign keys
- [ ] Create performance indexes

### Medium Term
- [ ] Implement data archiving
- [ ] Add audit trail tables
- [ ] Create analytics snapshots
- [ ] Optimize dashboard queries

### Long Term
- [ ] Real-time analytics
- [ ] Machine learning pipelines
- [ ] Advanced forecasting
- [ ] Multi-region support

---

## 🤝 Support & Documentation

**Related Docs**:
- `INVITATION_FLOW_SUMMARY.md` - Invitation system details
- Database ERD (to be created)
- API Documentation (Swagger/OpenAPI)

**Key Functions**:
- `get_user_clinic_id()` - Get current user's clinic
- `is_sales_staff()`, `is_clinic_admin()` - Role checks
- `accept_invitation()` - Complete invitation flow

---

**Last Updated**: December 26, 2025  
**Maintained By**: Development Team  
**Status**: ✅ Production Architecture
