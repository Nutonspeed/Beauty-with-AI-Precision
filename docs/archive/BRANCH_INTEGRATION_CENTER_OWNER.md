# Branch Management Integration for Clinic Owners

## Overview
ผสานระบบ Branch Management เข้ากับ Clinic Owner role เพื่อให้เจ้าของคลินิกสามารถดูและจัดการสาขาทั้งหมดในคลินิกของตัวเอง

## Changes Made

### 1. Navigation Menu (`components/header.tsx`)
```typescript
case "clinic_owner":
  return [
    { href: "/clinic/dashboard", label: t.nav.dashboard },
    { href: "/branches", label: "🏢 Branches" }, // ← NEW
    { href: "/customers", label: t.nav.customers },
    { href: "/ai-chat", label: "💬 AI Advisor" },
    { href: "/analytics", label: t.nav.analytics },
  ]
```

**เพิ่ม "Branches" menu item** สำหรับ clinic_owner ให้เข้าถึงหน้าจัดการสาขา

### 2. Middleware Permissions (`lib/supabase/middleware.ts`)
```typescript
// Clinic and branches routes require clinic_owner or clinic_staff
if ((pathname.startsWith("/clinic") || pathname.startsWith("/branches")) && 
    userProfile.role !== "clinic_owner" && 
    userProfile.role !== "clinic_staff" &&
    userProfile.role !== "clinic_admin") {
  // redirect to dashboard
}
```

**อนุญาตให้ clinic_owner, clinic_admin, และ clinic_staff** เข้าถึง `/branches` route

### 3. Branch Management Page (`app/branches/page.tsx`)

#### เพิ่ม Features:
- ✅ **Authentication Check**: ตรวจสอบว่าเป็น clinic staff
- ✅ **Permission Check**: ใช้ `useClinicContext()` เช็คสิทธิ์
- ✅ **Loading State**: แสดง loading spinner ขณะโหลดข้อมูล
- ✅ **Error Handling**: แสดง error alert หากโหลดข้อมูลไม่สำเร็จ
- ✅ **Header/Footer**: เพิ่ม layout components
- ✅ **Role-based UI**: ปุ่ม "Add New Branch" disable ถ้าไม่มีสิทธิ์จัดการ

## Permission Matrix

| Role | View Branches | Manage Branches | Add Branch | Transfer Staff |
|------|--------------|----------------|-----------|---------------|
| `clinic_owner` | ✅ | ✅ | ✅ | ✅ |
| `clinic_admin` | ✅ | ✅ | ✅ | ✅ |
| `clinic_staff` | ✅ | ❌ | ❌ | ❌ |
| `sales_staff` | ❌ | ❌ | ❌ | ❌ |

## API Endpoints Used

### GET `/api/branches?clinic_id={id}`
ดึงรายการสาขาทั้งหมดในคลินิก

**Response:**
```json
[
  {
    "id": "uuid",
    "clinic_id": "uuid",
    "branch_code": "MAIN001",
    "branch_name": "สาขาหลัก",
    "address": "123 ถนนสุขุมวิท",
    "city": "กรุงเทพมหานคร",
    "province": "กรุงเทพมหานคร",
    "is_active": true,
    "is_main_branch": true,
    "branch_manager": { ... }
  }
]
```

### POST `/api/branches`
สร้างสาขาใหม่

**Body:**
```json
{
  "clinic_id": "uuid",
  "branch_code": "BKK002",
  "branch_name": "สาขาสยาม",
  "address": "456 ถนนพระราม 1",
  "city": "กรุงเทพมหานคร",
  "province": "กรุงเทพมหานคร"
}
```

## Database Schema

### `branches` Table
```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  branch_code VARCHAR(50) UNIQUE,
  branch_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  is_main_branch BOOLEAN DEFAULT false,
  branch_manager_id UUID REFERENCES users(id),
  -- ... more fields
);
```

### Row Level Security (RLS)
```sql
-- Clinic staff can view their clinic branches
CREATE POLICY "Clinic staff can view their clinic branches"
    ON branches FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Clinic admins can manage branches
CREATE POLICY "Clinic admins can manage branches"
    ON branches FOR ALL
    USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'owner')
            AND is_active = true
        )
    );
```

## Usage Example

### For Clinic Owner
```typescript
import { useClinicContext } from '@/hooks/useClinicContext';

function BranchManager() {
  const { clinicId, canManageClinic } = useClinicContext();
  
  // Fetch branches for this clinic
  const fetchBranches = async () => {
    const response = await fetch(`/api/branches?clinic_id=${clinicId}`);
    const branches = await response.json();
    return branches;
  };
  
  // Add new branch (only if has permission)
  const addBranch = async (data) => {
    if (!canManageClinic()) {
      throw new Error('No permission to add branch');
    }
    
    const response = await fetch('/api/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, clinic_id: clinicId })
    });
    
    return response.json();
  };
}
```

## Testing

### Manual Test Steps:
1. ✅ Login as `clinic-owner@example.com`
2. ✅ Navigate to "Branches" from header menu
3. ✅ Verify branches load correctly
4. ✅ Verify "Add New Branch" button is enabled
5. ✅ Test creating new branch (if implemented)
6. ✅ Test viewing branch details
7. ✅ Test staff transfer functionality

### Test as Different Roles:
- **clinic_owner**: Full access ✅
- **clinic_admin**: Full access ✅
- **clinic_staff**: Read-only access ✅
- **sales_staff**: No access (redirected) ✅

## Future Enhancements

1. **Branch Creation Modal**: Form to add new branches
2. **Branch Edit Modal**: Update branch information
3. **Branch Dashboard**: Detailed stats per branch
4. **Staff Assignment**: Assign staff to specific branches
5. **Inventory Transfer**: Move inventory between branches
6. **Analytics Dashboard**: Compare performance across branches

## Related Files

- `components/header.tsx` - Navigation menu
- `lib/supabase/middleware.ts` - Route protection
- `app/branches/page.tsx` - Main branch management page
- `hooks/useClinicContext.ts` - Clinic context and permissions
- `hooks/useBranch.ts` - Branch data hooks
- `components/branch-dashboard.tsx` - Branch details component
- `app/api/branches/route.ts` - Branch API endpoints

## Support

For questions or issues, contact the development team.

---
**Last Updated:** November 9, 2025  
**Status:** ✅ Integrated and Ready for Testing
