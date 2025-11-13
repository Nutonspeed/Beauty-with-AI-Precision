# 🚀 Quick Reference - User Management Implementation

**For:** Development Team  
**When to use:** Before implementing user creation features  
**Status:** 📋 Planning

---

## 🎯 Quick Decision Guide

### "เมื่อไหร่ต้อง implement?"
- ❌ **ตอนนี้ยัง** - ระบบยัง develop อยู่
- ✅ **เมื่อ** 2 คลินิกพร้อมใช้งานจริง
- ✅ **เมื่อ** Clinic Owner ต้องการสร้าง Sales Staff เอง
- ✅ **เมื่อ** Sales Staff ต้องการสร้าง Customer ในระบบ

### "Feature ไหนทำก่อน?"
1. **Phase 1** (Immediate): ปิด public registration
2. **Phase 2** (High): Clinic Owner → Create Sales
3. **Phase 3** (High): Sales → Create Customer
4. **Phase 4** (Medium): Invitation system
5. **Phase 5** (Low): Approval workflow

---

## 📂 Files to Create (When Ready)

### Priority 1: Clinic Owner Features
```
app/clinic/staff/
├── page.tsx                    // List sales staff
├── create/page.tsx             // Create sales form
└── [id]/page.tsx               // Sales detail/edit

app/api/clinic/staff/
├── route.ts                    // GET, POST
└── [id]/route.ts               // GET, PATCH, DELETE
```

### Priority 2: Sales Staff Features
```
app/sales/customers/
├── page.tsx                    // ENHANCE: Add "Create Customer" button
├── create/page.tsx             // NEW: Create customer form
└── [id]/page.tsx               // Customer detail/edit

app/api/sales/customers/
├── route.ts                    // POST new customer
└── [id]/route.ts               // PATCH customer info
```

### Priority 3: Invitation System
```
lib/invitations/
├── send-invitation.ts          // Email sender
├── validate-token.ts           // Token validator
└── accept-invitation.ts        // Complete signup

app/setup/[token]/page.tsx      // Account setup page

prisma/schema.prisma            // Add invitations table
```

### Priority 4: Components
```
components/forms/
├── create-user-form.tsx        // Reusable user creation
└── setup-account-form.tsx      // First-time password setup

components/users/
├── user-list.tsx               // User table with actions
└── user-card.tsx               // User summary card
```

---

## 🔐 Permission Rules (Copy-Paste Ready)

```typescript
// lib/permissions/user-creation.ts
export const USER_CREATION_PERMISSIONS = {
  super_admin: [
    'create_super_admin',
    'create_clinic_owner',
    'create_clinic_admin', 
    'create_clinic_staff',
    'create_sales_staff',
    'create_customer'
  ],
  clinic_owner: [
    'create_clinic_admin',
    'create_clinic_staff',
    'create_sales_staff'
  ],
  sales_staff: [
    'create_customer'
  ]
}

export function canCreateUser(
  currentRole: string, 
  targetRole: string
): boolean {
  return USER_CREATION_PERMISSIONS[currentRole]?.includes(
    `create_${targetRole}`
  ) || false
}

// Usage in API:
if (!canCreateUser(currentUser.role, 'sales_staff')) {
  return NextResponse.json(
    { error: 'Permission denied' },
    { status: 403 }
  )
}
```

---

## 📧 Email Templates (When Needed)

### Template 1: Sales Staff Invitation
```
Subject: Welcome to [Clinic Name] Team

Hi [Name],

You've been added to [Clinic Name] as a Sales Staff member.

Setup your account: [Link]

Your account details:
- Email: [email]
- Role: Sales Staff
- Clinic: [Clinic Name]

Link expires in 7 days.

Questions? Contact [Clinic Owner Name]
```

### Template 2: Customer Welcome
```
Subject: Welcome to [Clinic Name]

สวัสดีค่ะคุณ[Name],

คุณ[Sales Name] ได้สร้างบัญชีให้คุณแล้ว

เข้าใช้งาน: [Link]

คุณสามารถ:
✨ วิเคราะห์ผิวหน้าด้วย AI
📅 จองนัดหมาย
👁️ ทดลอง AR Makeup

มีคำถาม? Line: [Sales Line ID]
```

---

## 🗄️ Database Queries (Quick Reference)

### Check User Permissions
```sql
-- Check if user can create role
SELECT role FROM users WHERE id = $userId;

-- Get clinic users
SELECT * FROM users 
WHERE clinic_id = $clinicId 
  AND role = 'sales_staff';

-- Get sales's customers
SELECT * FROM users
WHERE assigned_sales_id = $salesId
  AND role = 'customer';
```

### Create User (Manual - Temporary)
```sql
-- Super Admin creates Clinic Owner
INSERT INTO users (email, role, clinic_id)
VALUES ('owner@clinic.com', 'clinic_owner', 'clinic_001');

-- Clinic Owner creates Sales (manual workaround)
INSERT INTO users (email, role, clinic_id, created_by)
VALUES (
  'sales@clinic.com', 
  'sales_staff', 
  'clinic_001',
  $clinic_owner_id
);

-- Sales creates Customer (manual workaround)
INSERT INTO users (email, role, clinic_id, assigned_sales_id, created_by)
VALUES (
  'customer@example.com',
  'customer',
  'clinic_001',
  $sales_staff_id,
  $sales_staff_id
);
```

---

## 🚦 Implementation Stages

### Stage 0: Current (MVP)
- ✅ Roles defined
- ✅ Middleware protection
- ✅ Manual user creation only
- ⚠️ Public registration exists

### Stage 1: Quick Fix (1 day)
```typescript
// app/auth/register/page.tsx
- Show "Registration Closed" message
- Link to /contact
```

### Stage 2: Basic Creation (1 week)
```typescript
// Super Admin: Create Clinic Owner
// Clinic Owner: Create Sales Staff
// Sales Staff: Create Customer
// All via simple forms (no invitation yet)
```

### Stage 3: Invitation System (2 weeks)
```typescript
// Email with magic link
// Self-set password
// Better UX
```

### Stage 4: Polish (Ongoing)
```typescript
// Audit logs
// Bulk import
// Transfer customers
// Advanced permissions
```

---

## 💡 Development Tips

### Don't Forget:
- [ ] Server-side permission checks (never trust client)
- [ ] RLS policies in Supabase
- [ ] Email notifications
- [ ] Audit trail logging
- [ ] PDPA compliance
- [ ] Mobile-friendly forms

### Quick Tests:
```typescript
// Test permission checks
describe('User Creation', () => {
  it('sales cannot create sales', async () => {
    // Assert: 403 error
  })
  
  it('clinic_owner can create sales', async () => {
    // Assert: 201 created
  })
  
  it('assigns correct clinic_id', async () => {
    // Assert: same clinic as creator
  })
})
```

---

## 📞 Emergency Contacts

### Supabase Dashboard Access
- URL: https://supabase.com/dashboard
- Create users manually if needed

### Manual User Creation Script
```bash
# Run in Supabase SQL Editor
INSERT INTO users (email, role, clinic_id) 
VALUES ('newuser@example.com', 'role', 'clinic_id');
```

### Reset Password (Temporary)
```typescript
// Supabase Dashboard → Authentication → Users
// Click user → Send password reset email
```

---

## 🎯 Remember

1. **ไม่เร่งรีบ implement** - รอให้คลินิกพร้อม
2. **เริ่มจากง่ายที่สุด** - Form + API ก่อน, Invitation ทีหลัง  
3. **Security first** - Permission checks ทุก API
4. **Document everything** - Comment code ให้ชัด
5. **Test thoroughly** - Unit test permission logic

---

**Quick Access:**
- Full Plan: `docs/USER_MANAGEMENT_FLOW.md`
- Routes: `docs/ROUTES_STRUCTURE.md`
- Permissions: `lib/permissions/` (when created)

**Last Updated:** November 9, 2025
