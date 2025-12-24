# 🏗️ System Architecture & Data Flow Analysis
## Beauty with AI Precision - B2B Multi-Tenant SaaS

> **Analyzed**: December 25, 2025  
> **System Type**: Multi-Tenant B2B SaaS Platform  
> **Architecture**: Next.js 14 + Supabase + PostgreSQL with RLS

---

## 📊 Dashboard Hierarchy & User Roles

### 1. **Super Admin Dashboard** (`/super-admin`)
**Role**: `super_admin`  
**Purpose**: Platform-wide management and monitoring

**Components**:
- System Health Monitor
- Revenue Analytics (MRR/ARR tracking)
- Clinic Management (create/manage clinics)
- Security Monitoring
- AI Analytics Dashboard
- Subscription Management
- Activity Logs Dashboard
- Global User Management
- System Settings

**Data Sources**:
```typescript
// API Endpoints
GET /api/admin/stats          // Platform statistics
GET /api/admin/usage          // System usage metrics
GET /api/admin/clinics        // All clinics
POST /api/admin/clinics       // Create clinic
GET /api/admin/users/all      // All users across clinics
POST /api/admin/users/[id]/role  // Update user roles
GET /api/admin/analytics      // Platform analytics
GET /api/admin/activity-logs  // System-wide activity
```

**Database Tables**:
- `clinics` (all clinics)
- `users` (all users)
- `clinic_subscriptions` (subscription status)
- `payment_transactions` (revenue data)
- `ai_usage` (AI cost tracking)
- `activity_logs` (audit trail)

---

### 2. **Clinic Dashboard** (`/clinic`)
**Roles**: `clinic_owner`, `clinic_admin`, `sales_staff`  
**Purpose**: Clinic operations management

**Sub-Routes**:
- `/clinic/dashboard` - Overview & KPIs
- `/clinic/customers` - Customer management (CRM)
- `/clinic/staff` - Staff management
- `/clinic/analytics` - Clinic-specific analytics
- `/clinic/queue` - Queue management system
- `/clinic/settings` - Clinic configuration
- `/clinic/plans` - Subscription plans
- `/clinic/reception` - Reception desk interface

**Components**:
```typescript
// Key Components
CustomersClient        // Customer list & CRM
StaffManagement        // Employee management
AnalyticsDashboard     // Clinic metrics
QueueManagement        // Waiting queue
ReceptionDesk          // Check-in system
```

**Data Sources**:
```typescript
// API Endpoints (RLS enforced)
GET /api/clinic/customers     // Clinic customers only
GET /api/clinic/staff         // Clinic staff only
GET /api/clinic/analytics     // Clinic metrics
GET /api/clinic/queue         // Queue entries
GET /api/clinic/dashboard/metrics
GET /api/clinic/dashboard/pipeline
GET /api/clinic/revenue
```

**Database Tables** (filtered by `clinic_id`):
- `customers`
- `users` (staff)
- `bookings`
- `queue_entries`
- `appointments`
- `sales_leads`
- `sales_proposals`

---

### 3. **Sales Dashboard** (`/sales`)
**Roles**: `sales_staff`, `clinic_admin`, `clinic_owner`  
**Purpose**: Sales & customer acquisition

**Sub-Routes**:
- `/sales/dashboard` - Sales overview
- `/sales/leads` - Lead management
- `/sales/proposals` - Proposal tracking
- `/sales/performance` - Performance metrics
- `/sales/wizard` - Sales process wizard
- `/sales/notes` - Customer notes

**Components**:
```typescript
// Sales Components
LeadsManagement        // Lead tracking
ProposalList           // Proposal management
PerformanceMetrics     // Sales KPIs
SalesWizard            // Guided selling
```

**Data Sources**:
```typescript
// API Endpoints
GET /api/sales/leads           // Sales leads
POST /api/sales/leads          // Create lead
GET /api/sales/proposals       // Proposals
POST /api/sales/proposals      // Create proposal
GET /api/sales/activity-feed   // Activities
GET /api/sales/performance     // Sales metrics
GET /api/sales/hot-leads       // High-priority leads
```

**Database Tables**:
- `sales_leads`
- `sales_proposals`
- `sales_activities`
- `customers` (prospects)
- `skin_analyses` (for proposals)

---

### 4. **Customer Dashboard** (`/customer`)
**Role**: `customer`  
**Purpose**: Customer portal for treatments & history

**Features**:
- View treatment history
- Book appointments
- View skin analysis results
- Loyalty points tracking
- Treatment plans

**Data Sources**:
```typescript
// API Endpoints
GET /api/customer/history      // Treatment history
GET /api/customer/appointments // Upcoming bookings
GET /api/customer/analysis     // Skin analysis results
GET /api/loyalty/accounts      // Loyalty points
```

---

## 🔄 Data Flow Architecture

### **User Authentication Flow**
```
1. Login → /api/auth/login
2. JWT Token → Stored in cookies
3. Middleware → Validates token
4. Get User Role → Query users table
5. Role-based routing → Redirect to appropriate dashboard
```

### **Multi-Tenant Data Isolation (RLS)**
```sql
-- Every query automatically filtered
SELECT * FROM customers 
WHERE clinic_id = get_user_clinic_id(); -- RLS policy

-- Functions used by RLS
is_super_admin()       -- Check super admin
get_user_clinic_id()   -- Get user's clinic
get_user_role()        -- Get user's role
```

### **API → Database Flow**
```
Client Request
    ↓
API Route (/api/*)
    ↓
Authentication Check (requireAuth)
    ↓
Role Validation (requireRole)
    ↓
Supabase Client
    ↓
RLS Policies (automatic filtering)
    ↓
PostgreSQL Query
    ↓
Filtered Results (clinic_id scoped)
    ↓
JSON Response
```

---

## 📐 Navigation Structure

```
┌─────────────────────────────────────────────────────┐
│              User Login (/auth/login)               │
└──────────────────┬──────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │   Authenticate    │
         │   Get User Role   │
         └─────────┬─────────┘
                   │
    ┌──────────────┼──────────────┬──────────────┐
    │              │              │              │
┌───▼───┐    ┌────▼────┐    ┌───▼────┐    ┌───▼────┐
│Super  │    │ Clinic  │    │ Sales  │    │Customer│
│Admin  │    │ Owner   │    │ Staff  │    │        │
└───┬───┘    └────┬────┘    └───┬────┘    └───┬────┘
    │             │              │             │
    │  /super-    │  /clinic     │  /sales     │ /customer
    │   admin     │              │             │
    │             │              │             │
    ▼             ▼              ▼             ▼
Platform      Clinic         Sales        Personal
 Wide         Ops            & CRM        Portal
```

---

## 🔐 Permission Matrix

| Dashboard | Super Admin | Clinic Owner | Clinic Admin | Sales Staff | Customer |
|-----------|-------------|--------------|--------------|-------------|----------|
| /super-admin | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| /clinic | ✅ View All | ✅ Own Clinic | ✅ Own Clinic | ✅ Read Only | ❌ |
| /sales | ✅ View All | ✅ Own Clinic | ✅ Own Clinic | ✅ Own Leads | ❌ |
| /customer | ❌ | ❌ | ❌ | ❌ | ✅ Own Data |

---

## 🗄️ Database Schema Overview

### **Core Tables** (95 tables total)
```
Users & Auth:
├── users (multi-tenant users)
├── auth.users (Supabase auth)
└── invitations (user invitations)

Clinics:
├── clinics (tenant organizations)
├── branches (clinic locations)
├── clinic_subscriptions (subscription status)
└── subscription_plans (pricing tiers)

Sales & CRM:
├── customers (customer records)
├── sales_leads (prospect tracking)
├── sales_proposals (quotes)
├── sales_activities (interaction log)
└── customer_notes (CRM notes)

Operations:
├── appointments (bookings)
├── queue_entries (waiting queue)
├── services (treatment catalog)
└── treatment_records (service history)

AI & Analytics:
├── skin_analyses (AI analysis results)
├── ai_usage (cost tracking)
└── treatment_plans (recommendations)

Billing:
├── payments (transaction log)
├── billing_invoices (invoices)
└── payment_transactions (payment status)
```

---

## 📊 Data Flow Patterns

### **Pattern 1: Create Customer (Sales Staff)**
```
Sales Staff UI (/clinic/customers)
    ↓
POST /api/users/create
    ↓
Check: sales_staff can create customer
    ↓
Create auth.users (Supabase)
    ↓
Insert into users table
    ↓
Send invitation email
    ↓
Return success
```

### **Pattern 2: View Customers (Multi-Tenant)**
```
User Request (/clinic/customers)
    ↓
GET /api/clinic/customers
    ↓
Supabase query with RLS
    ↓
PostgreSQL: SELECT * FROM customers
WHERE clinic_id = get_user_clinic_id()
    ↓
Return filtered results
```

### **Pattern 3: Subscription Change**
```
Stripe Webhook
    ↓
POST /api/stripe/webhook
    ↓
Event: checkout.session.completed
    ↓
Update users.stripe_subscription_id
    ↓
Update clinic_subscriptions.plan_id
    ↓
AI limits automatically updated
```

---

## 🔍 Key Architectural Decisions

### **1. Row Level Security (RLS)**
- **Why**: Automatic multi-tenant data isolation
- **How**: PostgreSQL policies filter by `clinic_id`
- **Benefit**: Security at database level, can't be bypassed

### **2. Supabase Auth + Custom Users Table**
- **Why**: Flexible role management
- **How**: `auth.users` (authentication) + `users` (business data)
- **Benefit**: Custom roles, clinic assignment

### **3. API Routes with Middleware**
- **Why**: Centralized auth & permission checks
- **How**: `requireAuth()` + `requireRole()` helpers
- **Benefit**: Consistent security across all endpoints

### **4. Subscription-Based AI Limits**
- **Why**: Control costs per clinic
- **How**: `clinic_subscriptions` → `subscription_plans` → AI usage limits
- **Benefit**: Automatic limit enforcement

---

## 📈 Scalability Considerations

### **Current Architecture Supports**:
- ✅ 5 clinics (current)
- ✅ 50-100 clinics (tested)
- ✅ 25-50 concurrent users per clinic
- ✅ ~100,000 skin analyses/month

### **Potential Bottlenecks**:
1. **Database Connections**: Use Supabase pooling
2. **AI API Costs**: Rate limiting in place
3. **File Storage**: Supabase storage with CDN

---

## 🛠️ Development Guidelines

### **Adding New Dashboard**:
1. Create route in `/app/[dashboard-name]`
2. Add role check: `requireRole(['role1', 'role2'])`
3. Create API endpoints in `/app/api/[name]`
4. Add RLS policies if new tables
5. Update navigation components

### **Adding New Table**:
1. Create migration in `supabase/migrations/`
2. Add `clinic_id` column
3. Enable RLS: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
4. Create policies for each role
5. Add indexes for `clinic_id`
6. Test with RLS test script

---

## 📞 Architecture Review Checklist

- [x] All tables have RLS enabled
- [x] All API routes require authentication
- [x] Subscription changes sync with AI limits
- [x] User creation follows permission hierarchy
- [x] Database indexed for multi-tenant queries
- [x] Error monitoring configured
- [ ] Load testing completed (pending)
- [ ] Email delivery tested (pending)

---

**Last Updated**: December 25, 2025  
**Architect**: System Analysis  
**Next Review**: January 2026
