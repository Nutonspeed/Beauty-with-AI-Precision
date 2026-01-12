# 🏗️ CenterIQ AI - Data Flow Architecture & Dashboard Integration

**Date**: December 26, 2025  
**Version**: 1.1.0

---

## 📊 System Overview

CenterIQ AI เป็นระบบ Multi-tenant Center Management Platform ที่รองรับ 4 ระดับผู้ใช้หลัก:
- **Super Admin** - จัดการระบบทั้งหมด
- **Center Owner/Admin** - จัดการศูนย์ความงาม
- **Sales Staff** - ขายและดูแลลูกค้า
- **Client** - ลูกค้า/ผู้ใช้บริการ

---

## 🗄️ Core Database Schema & Relationships

### 1. **Central Tables**

#### `centers` - ศูนย์ความงาม (Hub แห่งข้อมูล)
```
id (PK)
name
owner_id -> users.id
center_code
subscription_tier
max_sales_staff
max_analyses_per_month
```

#### `users` - ผู้ใช้งาน (Core Entity)
```
id (PK)
email
role (enum: super_admin, center_owner, center_admin, sales_staff, client)
center_id -> centers.id  ⭐ Multi-tenant key
assigned_sales_user_id -> users.id  ⭐ Client assignment
```

#### `invitations` - ระบบเชิญ
```
id (PK)
email
invited_role
center_id -> centers.id
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
├── client_user_id -> users.id
├── sales_user_id -> users.id  ⭐ Sales assignment
├── center_id -> centers.id
└── status (new/qualified/proposal/won/lost)

sales_proposals
├── lead_id -> sales_leads.id
├── created_by -> users.id
└── center_id -> centers.id

chat_history
├── user_id -> users.id
└── center_id -> centers.id
```

#### Skin Analysis & AI
```
skin_analyses (40 rows)
├── user_id (text/uuid) ⚠️ Mixed types
├── center_id -> centers.id
├── sales_staff_id -> users.id
├── branch_id -> branches.id
└── analysis_data (jsonb)
```

#### Appointments & Bookings
```
appointments
├── client_id -> clients.id
├── staff_id -> auth.users.id
├── center_id -> centers.id
└── invoice_id -> invoices.id

bookings
├── client_id -> clients.id
├── center_id -> centers.id
└── service_id -> services.id

clients (separate from users)
├── center_id -> centers.id
└── created_by -> auth.users.id
```

#### Program & Records
```
program_records
├── client_id -> clients.id
├── staff_id -> auth.users.id
└── center_id -> centers.id

programs
└── center_id -> centers.id
```

---

## 🔄 Complete Data Flow

### Flow 1: **Invitation → User → Center Assignment**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Sales Staff Creates Invitation                              │
│    POST /api/invitations                                        │
│    ├── email: "client@example.com"                             │
│    ├── invited_role: "client"                                  │
│    ├── center_id: [sales staff's center]                       │
│    └── invited_by: [sales staff user_id]                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Client Receives Email with Token                            │
│    GET /invitations/[token]                                     │
│    └── Validates invitation                                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Client Accepts Invitation                                   │
│    POST /api/invitations/[token]/accept                        │
│    ├── Creates auth.users (email, password)                    │
│    └── Calls accept_invitation()                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Database Function: accept_invitation()                      │
│    INSERT/UPDATE public.users SET                              │
│    ├── role = "client" ✅                                       │
│    ├── center_id = [invitation.center_id] ✅                   │
│    ├── assigned_sales_user_id = [invitation.invited_by] ✅     │
│    └── invitation.status = "accepted" ✅                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Client Now Belongs To                                       │
│    ├── Center (multi-tenant isolation) 🏥                      │
│    ├── Sales Staff (for tracking & commission) 👤              │
│    └── Ready to use system ✅                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

### Flow 2: **Client Journey → Sales Funnel**

```
Client Login
    ↓
┌─────────────────────────┐
│ Client Dashboard        │
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
│ - client_user_id ✅     │
│ - sales_user_id ✅      │
│   (from assigned_sales) │
│ - center_id ✅          │
└─────────────────────────┘
    ↓ (sales staff)
┌─────────────────────────┐
│ Sales Proposal          │
│ - Created by sales      │
│ - Linked to lead        │
│ - Can send via email    │
└─────────────────────────┘
    ↓ (client accepts)
┌─────────────────────────┐
│ Appointment/Booking     │
│ - client_id ✅          │
│ - staff_id ✅           │
│ - center_id ✅          │
│ - Creates invoice       │
└─────────────────────────┘
    ↓ (after program)
┌─────────────────────────┐
│ Program Record          │
│ - Progress notes        │
│ - Before/after photos   │
│ - center_id ✅          │
└─────────────────────────┘
```

---

## 📱 Dashboard Architecture

### 1. **Sales Dashboard** (`/sales/dashboard`)

**Primary Role**: `sales_staff`  
**Also Access**: `center_admin`, `center_owner`, `super_admin`

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
- Client assignment tracking
- Revenue per sales staff

**RLS Policy**:
```sql
-- Sales staff can only see their own data
users_select_sales_assigned_customers:
  is_sales_staff(auth.uid()) 
  AND assigned_sales_user_id = auth.uid()
  AND center_id = get_user_center(auth.uid())
```

---

### 2. **Center Dashboard** (`/centers/dashboard` → redirects to `/centers/revenue`)

**Primary Role**: `center_owner`, `center_admin`  
**Also Access**: `super_admin`

**Data Sources**:
```typescript
API Endpoints:
├── /api/center/dashboard/stats      // Overall center metrics
├── /api/center/analytics/revenue    // Revenue breakdown
├── /api/center/analytics/programs   // Program statistics
├── /api/center/analytics/staff-performance // Staff KPIs
└── /api/center/analytics/client-retention // Retention rates

Database Queries:
├── ALL users (WHERE center_id = current_user.center_id)
├── ALL sales_leads (WHERE center_id = ...)
├── ALL appointments (WHERE center_id = ...)
├── ALL bookings (WHERE center_id = ...)
├── ALL skin_analyses (WHERE center_id = ...)
└── ALL program_records (WHERE center_id = ...)
```

**Key Features**:
- Revenue dashboard (primary)
- Staff performance tracking
- Client retention analysis
- Program analytics
- Appointment management
- Payment tracking

**RLS Policy**:
```sql
-- Center admin sees all center data
users_select_center_scope:
  is_center_admin(auth.uid())
  AND center_id = get_user_center(auth.uid())
```

---

### 3. **Beautician Dashboard** (`/beautician/dashboard`)

**Primary Role**: `center_staff`, `beautician`

**Data Sources**:
```typescript
API Endpoints:
├── /api/beautician/appointments  // Today's schedule
├── /api/beautician/clients       // Assigned clients
└── /api/beautician/programs      // Program history

Database Queries:
├── appointments (WHERE staff_id = current_user)
├── program_records (WHERE staff_id = current_user)
└── clients (via appointments)
```

**Key Features**:
- Daily appointment schedule
- Client program history
- Program notes
- Before/after photos

---

### 4. **Admin Dashboard** (`/admin`)

**Primary Role**: `super_admin`

**Data Sources**:
```typescript
API Endpoints:
├── /api/admin/analytics          // System-wide analytics
├── /api/admin/revenue-analytics  // All centers revenue
├── /api/admin/ai-analytics       // AI usage stats
└── /api/admin/centers/performance // Center comparisons

Database Queries:
├── ALL centers (no RLS filter)
├── ALL users (no RLS filter)
├── ALL tables (super admin bypass)
```

**Key Features**:
- System-wide analytics
- Multi-center comparison
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
│   - assigned clients           │
│   - same center data           │
│                                │
│ IF role = 'center_admin'       │
│   THEN show:                   │
│   - all center data            │
│   - all staff in center        │
│   - all clients in center      │
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
   ├── Select/create client
   ├── Capture face images (front, left, right)
   └── POST /api/skin-analysis/gemini-analyze

2. AI Analysis (Gemini)
   ├── 8-mode detection
   ├── Skin age calculation
   ├── Concerns identification
   └── Program recommendations

3. Create Records
   ├── INSERT skin_analyses
   │   ├── user_id = client.id
   │   ├── sales_staff_id = current_user.id
   │   ├── center_id = current_user.center_id
   │   └── analysis_data (jsonb)
   │
   └── INSERT/UPDATE sales_leads
       ├── client_user_id = client.id
       ├── sales_user_id = current_user.id
       ├── center_id = current_user.center_id
       ├── lead_source = "quick_scan"
       └── status = "new"

4. Dashboard Updates
   ├── Sales Dashboard: +1 scan, +1 lead
   ├── Center Dashboard: +1 analysis
   └── Client Profile: New analysis available
```

---

### Feature 2: **Appointment Booking**

```
1. Client/Sales: Book appointment
   └── POST /api/appointments

2. Create Records
   ├── INSERT appointments
   │   ├── client_id
   │   ├── staff_id (beautician)
   │   ├── center_id ✅
   │   ├── service_id
   │   └── booking_date/time
   │
   └── CREATE invoice (if prepaid)
       └── invoice_id linked to appointment

3. Notifications
   ├── Email to client (confirmation)
   ├── Email to staff (schedule update)
   └── Dashboard notification

4. Dashboard Updates
   ├── Center Dashboard: +1 booking
   ├── Beautician Dashboard: +1 appointment
   ├── Client Dashboard: Show upcoming
```

---

### Feature 3: **Sales Proposal Flow**

```
1. Sales Staff creates proposal
   ├── Based on skin analysis
   ├── Includes programs
   ├── Pricing and packages
   └── POST /api/sales/proposals

2. Send to Client
   ├── Email with proposal link
   ├── /proposals/[token]
   └── Client can view/accept

3. Client Accepts
   ├── PUT /api/sales/proposals/[id]/accept
   ├── UPDATE sales_leads (status = "won")
   └── Can proceed to booking

4. Dashboard Updates
   ├── Sales Dashboard: +1 proposal, +1 won
   ├── Center Dashboard: +1 revenue
   └── Sales commission calculated
```

---

## 🎯 Data Consistency Rules

### 1. **Center ID Propagation**
```
✅ MUST have center_id:
- users (for center staff & clients)
- sales_leads
- skin_analyses
- appointments
- bookings
- program_records
- invoices
- payments

⚠️ Optional center_id:
- invitations (before accept)
- clients (legacy table)
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
WHERE center_id = get_user_center_id()

Applied to:
✅ All SELECT queries
✅ All INSERT operations
✅ All UPDATE operations
✅ All DELETE operations
```

---

## 📈 Analytics Data Aggregation

### Center-Level Analytics
```sql
-- Revenue by period
SELECT 
  DATE_TRUNC('day', created_at) as date,
  SUM(total_amount) as revenue,
  COUNT(*) as transaction_count
FROM invoices
WHERE center_id = :center_id
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
WHERE u.center_id = :center_id
  AND u.role = 'sales_staff'
GROUP BY u.id, u.email;
```

---

## 🚀 Performance Considerations

### 1. **Indexes**
```sql
-- Multi-tenant queries
CREATE INDEX idx_users_center_id ON users(center_id);
CREATE INDEX idx_sales_leads_center_id ON sales_leads(center_id);
CREATE INDEX idx_appointments_center_id ON appointments(center_id);

-- User lookups
CREATE INDEX idx_users_assigned_sales ON users(assigned_sales_user_id);
CREATE INDEX idx_sales_leads_client ON sales_leads(client_user_id);
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
clients vs users
- clients: legacy table (27 columns)
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
- [ ] Migrate clients → users
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
- `get_user_center_id()` - Get current user's center
- `is_sales_staff()`, `is_center_admin()` - Role checks
- `accept_invitation()` - Complete invitation flow

---

**Last Updated**: January 13, 2026  
**Maintained By**: Development Team  
**Status**: ✅ Production Architecture
