# 👥 User Management Flow - Planning Document

**Status:** 📋 Planning (Not Implemented Yet)  
**Priority:** Medium (After core features stable)  
**Waiting for:** 2 Clinics to start using the system

---

## 🎯 Objective

Implement hierarchical user management system:
- **Super Admin** → Manages ALL users across platform
- **Clinic Owner** → Creates Sales Staff accounts
- **Sales Staff** → Creates Customer accounts
- **No Public Registration** → All accounts created by authorized users

---

## 📊 User Hierarchy

```
Super Admin (Platform Level)
    │
    ├─── จัดการ ALL Users (clinic_owner, sales_staff, customer)
    ├─── สร้าง Clinic Owner Accounts
    ├─── Platform Analytics
    └─── System Settings
         │
         └─── Clinic Owner (Clinic Level)
                  │
                  ├─── จัดการ Clinic Settings
                  ├─── สร้าง Sales Staff Accounts ⭐
                  ├─── อนุมัติ/ระงับ Sales Staff
                  ├─── View ALL Customers in Clinic
                  └─── Sales Performance Dashboard
                       │
                       └─── Sales Staff (Sales Level)
                                │
                                ├─── สร้าง Customer Accounts ⭐
                                ├─── จัดการ Own Customers
                                ├─── Lead Management
                                ├─── Sales Wizard
                                └─── Commission Tracking
                                     │
                                     └─── Customer (End User)
                                          │
                                          ├─── Skin Analysis
                                          ├─── Booking Appointments
                                          ├─── AR Try-on
                                          ├─── Progress Tracking
                                          └─── Treatment History
```

---

## 🔐 Permission Matrix

| Action | Super Admin | Clinic Owner | Sales Staff | Customer |
|--------|-------------|--------------|-------------|----------|
| Create Super Admin | ✅ | ❌ | ❌ | ❌ |
| Create Clinic Owner | ✅ | ❌ | ❌ | ❌ |
| Create Sales Staff | ✅ | ✅ | ❌ | ❌ |
| Create Customer | ✅ | ❌ | ✅ | ❌ |
| View All Users | ✅ | ❌ | ❌ | ❌ |
| View Clinic Users | ✅ | ✅ | ❌ | ❌ |
| View Own Customers | ✅ | ✅ | ✅ | ❌ |
| Edit Any User | ✅ | ❌ | ❌ | ❌ |
| Edit Clinic Users | ✅ | ✅ | ❌ | ❌ |
| Delete User | ✅ | ⚠️ (Clinic users only) | ❌ | ❌ |
| Reset Password | ✅ | ✅ (Clinic users) | ⚠️ (Own customers) | ❌ |

---

## 🛠️ Implementation Phases

### Phase 1: Basic Structure (Current - MVP)
**Status:** ✅ Partially Complete

- [x] User roles defined in database
- [x] Middleware protection for routes
- [x] Basic authentication flow
- [x] Super Admin dashboard exists
- [ ] User creation forms (Basic)
- [ ] Permission checks in API routes

**Current Limitations:**
- Public registration still exists (`/auth/register`)
- No invitation system
- Manual user creation only
- No audit trail

### Phase 2: Hierarchical User Creation 🎯 **NEXT**
**Priority:** High (When 2 clinics start using)

#### 2.1 Clinic Owner → Create Sales Staff
**Files to Create/Modify:**

```typescript
// app/clinic/staff/page.tsx (NEW)
// List all sales staff in clinic
// Add "Create Sales Staff" button

// app/clinic/staff/create/page.tsx (NEW)
<Form>
  - Email
  - First Name
  - Last Name
  - Phone
  - Commission Rate (%)
  - Start Date
  - Branch Assignment (if multi-branch)
</Form>

// API: POST /api/clinic/staff
{
  email: "sales@example.com",
  role: "sales_staff",
  clinic_id: currentUser.clinic_id,
  created_by: currentUser.id,
  metadata: {
    commission_rate: 10,
    branch_id: "branch_001"
  }
}
```

#### 2.2 Sales Staff → Create Customer
**Files to Create/Modify:**

```typescript
// app/sales/customers/page.tsx (ENHANCE)
// Add "Add Customer" button

// app/sales/customers/create/page.tsx (NEW)
<Form>
  - Email
  - First Name
  - Last Name
  - Phone ⭐ (Required for verification)
  - Line ID (Optional)
  - Customer Type (New/Returning)
  - Source (Walk-in/Online/Referral)
  - Notes
</Form>

// API: POST /api/sales/customers
{
  email: "customer@example.com",
  role: "customer",
  clinic_id: currentSales.clinic_id,
  created_by_sales_id: currentSales.id,
  assigned_sales_id: currentSales.id,
  metadata: {
    source: "walk-in",
    customer_type: "new"
  }
}
```

### Phase 3: Invitation System
**Priority:** Medium (Better UX)

```typescript
// lib/invitations/send-invitation.ts (NEW)
export async function sendInvitation({
  email,
  role,
  invitedBy,
  clinicId,
  metadata
}) {
  // 1. Create invitation record
  const invitation = await supabase
    .from('invitations')
    .insert({
      email,
      role,
      invited_by: invitedBy,
      clinic_id: clinicId,
      token: generateSecureToken(),
      expires_at: addDays(new Date(), 7),
      status: 'pending'
    })
  
  // 2. Send email with setup link
  await sendEmail({
    to: email,
    subject: 'Welcome to Beauty with AI',
    template: 'invitation',
    data: {
      inviterName: currentUser.name,
      role: role,
      setupLink: `${process.env.NEXT_PUBLIC_URL}/setup/${token}`,
      expiresIn: '7 days'
    }
  })
}

// app/setup/[token]/page.tsx (NEW)
// Customer/Sales receives email → clicks link → sets own password
<SetupAccountForm>
  - Display: Email (readonly)
  - Display: Role (readonly)
  - Input: First Name
  - Input: Last Name
  - Input: New Password
  - Input: Confirm Password
  - Button: Complete Setup
</SetupAccountForm>
```

### Phase 4: Approval Workflow (Optional - Enterprise)
**Priority:** Low (Only if clinics request)

```typescript
// For clinics that want strict control
Flow: Sales creates customer → Status: "pending_approval"
                              ↓
      Clinic Owner reviews   → Approve/Reject
                              ↓
      If approved            → Status: "active" → Send invitation
```

### Phase 5: Advanced Features
**Priority:** Low (Future enhancement)

- [ ] Bulk user import (CSV)
- [ ] Customer transfer between sales
- [ ] User deactivation (soft delete)
- [ ] Audit trail / Activity log
- [ ] Two-factor authentication
- [ ] Role-based permissions (fine-grained)

---

## 📁 Database Schema Changes Needed

### 1. Add `invitations` table
```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  invited_by UUID REFERENCES users(id),
  clinic_id UUID REFERENCES clinics(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, expired, cancelled
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_email ON invitations(email);
```

### 2. Enhance `users` table
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS assigned_sales_id UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- For tracking customer ownership
CREATE INDEX idx_users_assigned_sales ON users(assigned_sales_id);
CREATE INDEX idx_users_created_by ON users(created_by);
```

### 3. Add `user_activity_log` table (Audit Trail)
```sql
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL, -- created, updated, deleted, password_reset
  performed_by UUID REFERENCES users(id),
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user ON user_activity_log(user_id);
CREATE INDEX idx_activity_log_date ON user_activity_log(created_at DESC);
```

---

## 🔌 API Endpoints to Create

### Clinic Owner APIs
```typescript
// Create Sales Staff
POST   /api/clinic/staff
GET    /api/clinic/staff              // List all sales in clinic
GET    /api/clinic/staff/[id]         // Get sales details
PATCH  /api/clinic/staff/[id]         // Update sales info
DELETE /api/clinic/staff/[id]         // Deactivate sales
POST   /api/clinic/staff/[id]/reset-password

// View all customers in clinic
GET    /api/clinic/customers          // All customers in clinic
GET    /api/clinic/customers/stats    // Customer analytics
```

### Sales Staff APIs
```typescript
// Create Customer
POST   /api/sales/customers
GET    /api/sales/customers           // Own customers only
GET    /api/sales/customers/[id]      // Customer details
PATCH  /api/sales/customers/[id]      // Update customer
POST   /api/sales/customers/[id]/send-invitation

// Quick create during sales wizard
POST   /api/sales/wizard/create-customer
```

### Super Admin APIs (Already partially exists)
```typescript
GET    /api/users                     // All users
POST   /api/users                     // Create any role
PATCH  /api/users/[id]                // Update any user
DELETE /api/users/[id]                // Delete any user

GET    /api/users/audit-log           // Activity history
```

---

## 🎨 UI Components Needed

### 1. User Creation Form Component
```typescript
// components/forms/create-user-form.tsx (NEW)
<UserForm
  mode="create"
  allowedRoles={['sales_staff']} // Based on current user permission
  onSubmit={handleCreate}
  defaultValues={{
    clinic_id: currentUser.clinic_id
  }}
/>
```

### 2. User List Component
```typescript
// components/users/user-list.tsx (NEW)
<UserList
  users={users}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onResetPassword={handleReset}
  canEdit={canEditUser}
  canDelete={canDeleteUser}
/>
```

### 3. Invitation Status Component
```typescript
// components/invitations/invitation-status.tsx (NEW)
<InvitationStatus
  status="pending" | "accepted" | "expired"
  sentAt={date}
  expiresAt={date}
  onResend={handleResend}
/>
```

---

## 🚦 Implementation Checklist

### Immediate (Before 2 clinics start)
- [ ] Disable public registration route (`/auth/register`)
- [ ] Create basic user creation form for Super Admin
- [ ] Add permission checks in existing API routes
- [ ] Document temp password procedure for sales/customers

### Short-term (First month after launch)
- [ ] Implement Clinic Owner → Create Sales Staff
- [ ] Implement Sales Staff → Create Customer  
- [ ] Basic email notification when account created
- [ ] Add "Created by" field to user profile

### Mid-term (After 2-3 months feedback)
- [ ] Invitation system with email links
- [ ] Customer ownership tracking
- [ ] Sales performance dashboard
- [ ] Transfer customers between sales

### Long-term (Based on clinic requests)
- [ ] Approval workflow (if needed)
- [ ] Bulk import (if needed)
- [ ] Audit trail viewer
- [ ] Advanced permissions

---

## 💡 Quick Implementation Notes

### Current Workaround (While Not Implemented)
```typescript
// Super Admin manually creates users via Supabase Dashboard
// OR via SQL:

-- Create Sales Staff manually
INSERT INTO users (id, email, role, clinic_id)
VALUES (
  uuid_generate_v4(),
  'sales@clinic.com',
  'sales_staff',
  'clinic_001'
);

-- Create Customer manually  
INSERT INTO users (id, email, role, clinic_id, assigned_sales_id)
VALUES (
  uuid_generate_v4(),
  'customer@example.com',
  'customer',
  'clinic_001',
  'sales_staff_uuid'
);
```

### Disable Public Registration (Quick Fix)
```typescript
// app/auth/register/page.tsx
export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Registration Closed</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This platform uses invitation-only registration.</p>
          <p>Please contact your clinic or sales representative for access.</p>
          <Button onClick={() => router.push('/contact')} className="mt-4">
            Contact Us
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 📞 Contact Points for User Creation

### For Clinic Owners
- Contact: Super Admin
- Method: Email to `admin@ai367bar.com`
- Info needed: Clinic name, owner email, phone

### For Sales Staff
- Contact: Clinic Owner (via clinic dashboard)
- Method: "Add Sales Staff" button (when implemented)
- Info needed: Name, email, phone, commission rate

### For Customers
- Contact: Sales Staff (in-person or via Line)
- Method: Sales Wizard "Add Customer" button (when implemented)
- Info needed: Name, email, phone

---

## 🎯 Success Metrics (When Implemented)

### Measure:
- Time to create new user (should be < 2 minutes)
- Invitation acceptance rate (target > 80%)
- User creation errors (target < 5%)
- Customer-to-Sales ratio (track for each sales staff)

### KPIs:
- Active Sales Staff per Clinic
- Active Customers per Sales Staff
- Customer retention rate
- Sales conversion rate (Lead → Customer)

---

## ⚠️ Important Reminders

1. **Security First:**
   - Always validate permissions server-side
   - Never trust client-side role checks
   - Log all user creation actions

2. **Data Privacy:**
   - PDPA compliance required
   - Customer data belongs to clinic
   - Sales can only see own customers

3. **Scalability:**
   - Pagination for user lists
   - Search/filter functionality
   - Bulk operations for large clinics

4. **User Experience:**
   - Clear error messages
   - Success confirmations
   - Email notifications
   - Mobile-friendly forms

---

**Document Version:** 1.0  
**Last Updated:** November 9, 2025  
**Next Review:** When 2 clinics are ready to launch  
**Owner:** Development Team  
**Status:** 📋 Planning Phase
