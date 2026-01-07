# 🚀 PRODUCTION ROADMAP: 6 Clinics Launch Plan

**Project:** Beauty-with-AI-Precision Multi-Tenant SaaS  
**Target:** 6 Clinics Production Ready  
**Timeline:** 5-7 Days (Aggressive)  
**Date Created:** November 11, 2025

---

## 🎯 **Executive Summary**

### **Current State:**
- ✅ Single clinic prototype working
- ✅ Basic multi-tenant structure exists
- ✅ Core AI features functional
- ❌ No tenant isolation enforcement
- ❌ Public registration still active
- ❌ No invitation system
- ❌ No super admin management

### **Target State:**
- ✅ 6 independent clinics isolated
- ✅ Super admin controls everything
- ✅ Invitation-only user creation
- ✅ Subscription management
- ✅ Usage tracking & limits
- ✅ Production-grade security

### **Success Metrics:**
- 🎯 100% data isolation between clinics
- 🎯 0 security vulnerabilities
- 🎯 < 2 second page load
- 🎯 Support 6 clinics × 30 users = 180+ concurrent users

---

## 📋 **PHASE 1: Multi-Tenant Foundation (Day 1-2) ⚡ CRITICAL**

### **Goal:** Perfect tenant isolation + Database ready for 6 clinics

### **Tasks:**

#### 1.1 Database Schema Review & Fix
**File:** Check existing migrations
```sql
✅ clinics table exists (20250107_multi_clinic_foundation.sql)
✅ users.clinic_id exists
✅ skin_analyses.clinic_id exists
⚠️ Need to verify ALL tables have clinic_id
⚠️ Need to add tenant_id indexes
```

**Action Items:**
- [ ] Audit ALL tables for clinic_id column
- [ ] Add missing clinic_id to:
  - [ ] bookings
  - [ ] treatments
  - [ ] products
  - [ ] campaigns
  - [ ] notifications
  - [ ] chat_messages
  - [ ] invoices
- [ ] Create composite indexes (clinic_id, created_at)
- [ ] Test query performance with 6 clinics data

**SQL Script:** `20251111_enforce_tenant_isolation.sql`

---

#### 1.2 Row Level Security (RLS) Policies
**Goal:** Automatic tenant isolation at database level

**Critical Tables Need RLS:**
```sql
Priority 1 (MUST):
- users (clinic staff can only see their clinic)
- skin_analyses (no cross-clinic data leak)
- customers (isolated per clinic)
- bookings (isolated per clinic)
- invoices (isolated per clinic)

Priority 2 (IMPORTANT):
- products (clinic-specific products)
- treatments (clinic-specific treatments)
- campaigns (clinic-specific marketing)
- chat_messages (clinic-isolated chats)
```

**Action Items:**
- [ ] Write RLS policy template
- [ ] Apply to ALL tenant-scoped tables
- [ ] Test with 2 demo clinics
- [ ] Verify no data leaks

**SQL Script:** `20251111_rls_policies_multi_tenant.sql`

---

#### 1.3 Tenant Context Middleware
**File:** `lib/auth/tenant-context.ts`

```typescript
// Get current user's clinic_id
// Inject into all queries automatically
// Throw error if no clinic_id (except super_admin)
```

**Action Items:**
- [ ] Create getTenantContext() helper
- [ ] Create withTenantIsolation() wrapper
- [ ] Update all API routes to use tenant context
- [ ] Add logging for cross-tenant attempts

**Files to Create:**
- `lib/auth/tenant-context.ts`
- `lib/auth/tenant-middleware.ts`
- `lib/db/with-tenant.ts`

---

#### 1.4 Super Admin Privileges
**Goal:** Super admin can see/manage ALL clinics

**Database Function:**
```sql
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'super_admin' 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**RLS Policy Pattern:**
```sql
CREATE POLICY "Clinic isolation"
  ON table_name FOR ALL
  USING (
    -- Super admin sees all
    is_super_admin() 
    OR 
    -- Others see only their clinic
    clinic_id = (SELECT clinic_id FROM users WHERE id = auth.uid())
  );
```

---

### **Phase 1 Deliverables:**
- ✅ All tables have clinic_id
- ✅ RLS policies on all tables
- ✅ Tenant middleware working
- ✅ Super admin bypass working
- ✅ Test with 2 demo clinics (data isolated)

**Estimated Time:** 12-16 hours

---

## 🔐 **PHASE 2: Authentication & Invitation System (Day 2-3)**

### **Goal:** Remove public registration, implement invitation-only

### **Tasks:**

#### 2.1 Close Public Registration
**Files to Modify:**
- `app/auth/register/page.tsx` → Redirect to /auth/login with message
- `app/api/auth/register/route.ts` → Return 403 Forbidden
- `components/header.tsx` → Remove "Sign Up" button
- `app/auth/login/page.tsx` → Remove "Create account" link

**Action Items:**
- [ ] Disable /auth/register route
- [ ] Update login page UI
- [ ] Add "Contact Admin" message
- [ ] Remove beta-signup page

---

#### 2.2 Invitation System Database
**Migration:** `20251111_invitation_system.sql`

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'clinic_owner', 'clinic_admin', 'sales_staff', 
    'clinic_staff', 'customer'
  )),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_clinic ON invitations(clinic_id);
```

**Action Items:**
- [ ] Create invitations table
- [ ] Add RLS policies
- [ ] Create indexes

---

#### 2.3 Invitation API
**Files to Create:**
- `app/api/invitations/route.ts` - Create invitation
- `app/api/invitations/[token]/route.ts` - Verify token
- `app/api/invitations/[token]/accept/route.ts` - Accept invitation
- `app/api/invitations/resend/route.ts` - Resend invitation

**API Endpoints:**
```typescript
POST /api/invitations
{
  email: string,
  role: UserRole,
  clinic_id: string, // Auto from context (except super_admin)
  expires_in_hours: number // default 72
}

GET /api/invitations/[token]
// Returns invitation details if valid

POST /api/invitations/[token]/accept
{
  full_name: string,
  password: string
}
// Creates user account + logs in
```

---

#### 2.4 Invitation Email Templates
**Files to Create:**
- `lib/emails/templates/clinic-owner-invitation.tsx`
- `lib/emails/templates/staff-invitation.tsx`
- `lib/emails/templates/customer-invitation.tsx`

**Email Service:**
- Use Resend (already configured)
- Template with React Email
- Include: Clinic name, Role, Expiry, Action button

---

#### 2.5 Accept Invitation Page
**Files to Create:**
- `app/auth/accept-invitation/[token]/page.tsx`

**Flow:**
1. Verify token (not expired, not used)
2. Show invitation details (Clinic, Role)
3. Form: Full Name + Password
4. Create account in Supabase Auth
5. Create user record with clinic_id + role
6. Auto login
7. Redirect to appropriate dashboard

---

### **Phase 2 Deliverables:**
- ✅ Public registration closed
- ✅ Invitation system working
- ✅ Email templates ready
- ✅ Accept invitation flow tested
- ✅ Super admin can invite clinic owners

**Estimated Time:** 10-12 hours

---

## 👑 **PHASE 3: Super Admin Dashboard (Day 3-4)**

### **Goal:** Manage 6 clinics from one dashboard

### **Tasks:**

#### 3.1 Clinic Management UI
**File:** `app/super-admin/page.tsx` (EXISTS - enhance)

**Features to Add:**
- [ ] ✅ List all clinics (EXISTS)
- [ ] ✅ Create new clinic (EXISTS)
- [ ] Create clinic wizard (better UX)
- [ ] Edit clinic settings
- [ ] Suspend/Activate clinic
- [ ] Delete clinic (with confirmation)
- [ ] View clinic details modal

---

#### 3.2 Subscription Management
**Files to Create:**
- `app/super-admin/subscriptions/page.tsx`
- `app/api/admin/subscriptions/route.ts`

**Features:**
```typescript
Subscription Plans:
- Starter: ฿2,900/mo (5 users, 100 customers/mo)
- Professional: ฿9,900/mo (20 users, unlimited)
- Enterprise: ฿29,900/mo (unlimited users)

Actions:
- Change plan
- Set trial period
- Activate/Deactivate
- View payment history
- Generate invoices
```

---

#### 3.3 Usage Monitoring Dashboard
**Files to Create:**
- `app/super-admin/usage/page.tsx`
- `app/api/admin/usage/[clinicId]/route.ts`

**Metrics to Track:**
```typescript
Per Clinic:
- Active users count
- Storage used (GB)
- API calls this month
- AI analyses this month
- Customer count
- Booking count

Limits & Alerts:
- Warn when 80% quota
- Block when 100% quota
- Email notifications
```

---

#### 3.4 Billing & Invoices
**Files to Create:**
- `app/super-admin/billing/page.tsx`
- `lib/billing/invoice-generator.ts`

**Features:**
- Generate monthly invoices
- Payment status tracking
- Export to PDF
- Payment reminders
- Overdue handling

---

#### 3.5 System Analytics
**Files to Create:**
- `app/super-admin/analytics/page.tsx`

**Charts:**
- Total revenue (all clinics)
- Active clinics trend
- User growth
- Churn rate
- Most popular features
- System health metrics

---

### **Phase 3 Deliverables:**
- ✅ Super admin can create 6 clinics
- ✅ Subscription management working
- ✅ Usage tracking accurate
- ✅ Billing system ready
- ✅ Analytics dashboard live

**Estimated Time:** 14-16 hours

---

## 🏥 **PHASE 4: Clinic Management (Day 4-5)**

### **Goal:** Clinic owners can manage their team

### **Tasks:**

#### 4.1 Clinic Owner Dashboard
**File:** `app/clinic/dashboard/page.tsx` (EXISTS - enhance)

**Stats to Show:**
- My staff count
- My customers count
- This month bookings
- Revenue this month
- Pending actions

---

#### 4.2 Staff Management
**File:** `app/clinic/staff/page.tsx` (EXISTS - enhance)

**Features:**
- [ ] List all staff (current clinic only)
- [ ] Invite staff (send invitation)
- [ ] Edit staff role
- [ ] Deactivate staff
- [ ] View staff activity log
- [ ] Assign permissions

---

#### 4.3 Customer Management
**File:** `app/clinic/customers/page.tsx` (EXISTS - enhance)

**Features:**
- [ ] List customers (current clinic only)
- [ ] Customer created by staff
- [ ] View customer details
- [ ] Customer history
- [ ] Export customer list

---

#### 4.4 Clinic Settings
**File:** `app/clinic/settings/page.tsx`

**Settings:**
- Clinic profile (name, logo, contact)
- Branding (colors, theme)
- Business hours
- Services & Pricing
- Email templates
- Notification preferences

---

### **Phase 4 Deliverables:**
- ✅ Clinic dashboard functional
- ✅ Staff invitation working
- ✅ Customer list isolated per clinic
- ✅ Clinic settings working

**Estimated Time:** 12-14 hours

---

## 💼 **PHASE 5: Sales & Staff Features (Day 5-6)**

### **Goal:** Sales can create customers, staff can serve

### **Tasks:**

#### 5.1 Sales Staff Dashboard
**File:** `app/sales/dashboard/page.tsx` (EXISTS)

**Features:**
- My leads (assigned to me)
- My customers (created by me)
- My proposals
- My performance metrics

---

#### 5.2 Customer Creation by Sales
**File:** `app/sales/leads/create/page.tsx`

**Flow:**
1. Sales creates lead
2. Send invitation OR
3. Create walk-in customer
4. Auto-assign to sales
5. Isolated to current clinic

---

#### 5.3 Clinic Staff Reception
**File:** `app/clinic/reception/page.tsx` (EXISTS)

**Features:**
- Quick customer registration
- Walk-in check-in
- Queue management
- Analysis creation

---

#### 5.4 Permission System
**File:** `lib/auth/clinic-permissions.ts`

**Rules:**
```typescript
Sales can:
- View own customers only
- Create customers
- Create proposals
- View own leads

Staff can:
- View all customers (in clinic)
- Create bookings
- Perform analysis
- Update customer records

Clinic Admin can:
- Everything in their clinic
- Manage staff
- View all reports
```

---

### **Phase 5 Deliverables:**
- ✅ Sales can create customers
- ✅ Staff can serve customers
- ✅ Permissions working correctly
- ✅ Data isolated per clinic

**Estimated Time:** 10-12 hours

---

## 🧪 **PHASE 6: Testing & Launch Prep (Day 6-7)**

### **Goal:** 100% confident for 6 clinics launch

### **Tasks:**

#### 6.1 Create 6 Demo Clinics
**Script:** `scripts/seed-6-clinics.mjs`

```typescript
Clinic 1: Bangkok Beauty Clinic
- Owner: clinic1@test.com
- 5 staff, 20 customers

Clinic 2: Phuket Aesthetic Center
- Owner: clinic2@test.com
- 3 staff, 15 customers

Clinic 3: Chiang Mai Skin Clinic
- Owner: clinic3@test.com
- 4 staff, 10 customers

Clinic 4: Pattaya Wellness
- Owner: clinic4@test.com
- 2 staff, 8 customers

Clinic 5: Hatyai Beauty Lab
- Owner: clinic5@test.com
- 3 staff, 12 customers

Clinic 6: Khon Kaen Derma Clinic
- Owner: clinic6@test.com
- 2 staff, 5 customers
```

---

#### 6.2 Data Isolation Test
**Test Cases:**
```typescript
Test 1: Clinic A staff CANNOT see Clinic B customers
Test 2: Clinic A analysis DOES NOT appear in Clinic B
Test 3: Clinic A invoices CANNOT be accessed by Clinic B
Test 4: Sales in Clinic A CANNOT see Clinic B leads
Test 5: Super admin CAN see all clinics

Expected: ALL PASS ✅
```

---

#### 6.3 Performance Testing
**Tool:** k6 load testing

```javascript
Scenarios:
- 180 concurrent users (30 per clinic)
- 1000 analyses per hour
- 500 bookings per hour
- Real-time chat 100 messages/min

Target:
- Response time < 2s (p95)
- Error rate < 0.1%
- CPU < 70%
- Memory < 80%
```

---

#### 6.4 Security Audit
**Checklist:**
- [ ] All RLS policies working
- [ ] No SQL injection vectors
- [ ] XSS protection enabled
- [ ] CSRF tokens validated
- [ ] API rate limiting active
- [ ] Sensitive data encrypted
- [ ] Password requirements strong
- [ ] Session management secure

---

#### 6.5 Documentation
**Files to Create:**
- `docs/DEPLOYMENT_GUIDE.md`
- `docs/SUPER_ADMIN_MANUAL.md`
- `docs/CLINIC_OWNER_GUIDE.md`
- `docs/API_DOCUMENTATION.md`

---

### **Phase 6 Deliverables:**
- ✅ 6 demo clinics with data
- ✅ Zero data leaks confirmed
- ✅ Performance acceptable
- ✅ Security audit passed
- ✅ Documentation complete

**Estimated Time:** 12-14 hours

---

## 📊 **Timeline Summary**

| Phase | Duration | Critical? | Dependencies |
|-------|----------|-----------|--------------|
| Phase 1: Multi-Tenant Foundation | 12-16h | ⚡ YES | None |
| Phase 2: Authentication & Invitation | 10-12h | ⚡ YES | Phase 1 |
| Phase 3: Super Admin Dashboard | 14-16h | ⚠️ HIGH | Phase 1, 2 |
| Phase 4: Clinic Management | 12-14h | ⚠️ HIGH | Phase 2, 3 |
| Phase 5: Sales & Staff Features | 10-12h | MEDIUM | Phase 4 |
| Phase 6: Testing & Launch | 12-14h | ⚡ YES | All phases |

**Total Estimated Time:** 70-84 hours (5-7 full working days)

---

## 🚀 **Launch Checklist**

### **Pre-Launch (Must Complete):**
- [ ] All Phase 1 tasks done (tenant isolation)
- [ ] All Phase 2 tasks done (invitation system)
- [ ] Super admin can create clinics
- [ ] 6 demo clinics created
- [ ] Data isolation verified
- [ ] Security audit passed
- [ ] Performance tests passed
- [ ] Backup system ready
- [ ] Monitoring setup (Sentry, Datadog)
- [ ] Support system ready

### **Launch Day:**
- [ ] Deploy to production
- [ ] Create 6 real clinics
- [ ] Send invitations to owners
- [ ] Monitor system health
- [ ] Be ready for support calls

### **Post-Launch (Week 1):**
- [ ] Daily health checks
- [ ] Collect feedback from 6 clinics
- [ ] Fix critical bugs immediately
- [ ] Performance optimization
- [ ] Plan next features

---

## 🎯 **Success Criteria**

### **Technical:**
- ✅ 100% data isolation (no cross-clinic leaks)
- ✅ < 2s page load time (p95)
- ✅ 99.9% uptime
- ✅ Zero security vulnerabilities
- ✅ Support 180+ concurrent users

### **Business:**
- ✅ 6 clinics onboarded successfully
- ✅ All clinic owners can login
- ✅ All staff can work independently
- ✅ No critical bugs reported
- ✅ Positive feedback from clinics

### **User Experience:**
- ✅ Invitation flow smooth
- ✅ Dashboards intuitive
- ✅ No confusing errors
- ✅ Mobile responsive
- ✅ Fast and reliable

---

## 📞 **Support Plan**

### **During Launch Week:**
- 🟢 **Available:** 8 AM - 10 PM (14 hours/day)
- 🟢 **Response Time:** < 1 hour (critical), < 4 hours (normal)
- 🟢 **Channels:** Email, LINE, Phone
- 🟢 **Monitoring:** Real-time alerts

### **Issue Priority:**
- 🔴 **P0 - Critical:** Data leak, system down (fix immediately)
- 🟠 **P1 - High:** Feature broken, login issues (fix within 4h)
- 🟡 **P2 - Medium:** UI bugs, performance issues (fix within 24h)
- 🟢 **P3 - Low:** Enhancement requests (plan for future)

---

## 💰 **Business Model Confirmation**

### **Pricing (Per Clinic):**
```
Starter:      ฿2,900/month
Professional: ฿9,900/month
Enterprise:   ฿29,900/month
```

### **Revenue Projection (6 Clinics):**
```
Conservative (all Starter):
6 × ฿2,900 = ฿17,400/month = ฿208,800/year

Realistic (mix):
2 × ฿2,900 = ฿5,800
3 × ฿9,900 = ฿29,700
1 × ฿29,900 = ฿29,900
Total: ฿65,400/month = ฿784,800/year

Optimistic (all Professional):
6 × ฿9,900 = ฿59,400/month = ฿712,800/year
```

---

## 🎯 **Next Steps (Immediate)**

### **Today (Day 1):**
1. ✅ Create this roadmap (DONE)
2. ⏳ Start Phase 1: Audit all tables
3. ⏳ Write RLS policies
4. ⏳ Test with 2 demo clinics

### **Tomorrow (Day 2):**
1. Finish Phase 1
2. Start Phase 2: Close registration
3. Create invitation system
4. Test invitation flow

### **Day 3-4:**
1. Finish Phase 2
2. Start Phase 3: Super admin dashboard
3. Create clinic management

### **Day 5-6:**
1. Finish Phase 3-4
2. Start Phase 5: Sales features
3. Permission system

### **Day 7:**
1. Phase 6: Testing everything
2. Create 6 demo clinics
3. Final security audit

---

## ✅ **Decision Required**

**คุณพร้อมเริ่ม Phase 1 เลยไหมครับ?**

ผมจะเริ่มจาก:
1. ตรวจสอบ database schema ทุกตาราง
2. เพิ่ม clinic_id ให้ตารางที่ยังไม่มี
3. สร้าง RLS policies
4. Test กับ 2 clinics ทดสอบ

หรือต้องการปรับแผนอะไรก่อนครับ? 🚀
