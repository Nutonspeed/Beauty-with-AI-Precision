# Customer Notes System

ระบบบันทึกลูกค้าแบบไทม์ไลน์สำหรับทีมขาย

## 📁 ไฟล์ที่สร้างแล้ว

### Backend
- `prisma/migrations/manual/20250108_customer_notes.sql` - Database schema
- `app/api/customer-notes/route.ts` - CRUD API endpoints

### Frontend
- `hooks/useCustomerNotes.ts` - React hook สำหรับจัดการ notes
- `components/sales/customer-notes/notes-drawer.tsx` - Drawer แสดงรายการ notes
- `components/sales/customer-notes/add-note-form.tsx` - ฟอร์มเพิ่ม note
- `components/sales/customer-notes/floating-notes-button.tsx` - ปุ่ม floating
- `components/sales/customer-notes/index.tsx` - Export index

## 🚀 วิธีติดตั้ง

### 1. รัน Migration
```bash
# เชื่อมต่อ Supabase SQL Editor และรันไฟล์นี้:
prisma/migrations/manual/20250108_customer_notes.sql
```

### 2. ติดตั้ง Dependencies (ถ้ายังไม่มี)
```bash
pnpm install date-fns
```

## 💡 วิธีใช้งาน

### ใช้ Floating Button (แนะนำ)
เหมาะสำหรับหน้าข้อมูลลูกค้า, หน้า Quick Scan, หน้า Lead Details

```tsx
import { FloatingNotesButton } from "@/components/sales/customer-notes";

export default function CustomerDetailPage({ params }) {
  return (
    <div>
      {/* เนื้อหาหน้า */}
      
      <FloatingNotesButton
        customer_id={params.customerId}
        customer_name="คุณสมชาย"
        position="bottom-right" // หรือ "bottom-left"
      />
    </div>
  );
}
```

### ใช้ Drawer แบบ Manual
เหมาะสำหรับปุ่มใน Lead Card หรือ Dashboard

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NotesDrawer } from "@/components/sales/customer-notes";
import { StickyNote } from "lucide-react";

export function LeadCard({ customer }) {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setNotesOpen(true)}>
        <StickyNote className="mr-2 h-4 w-4" />
        บันทึก
      </Button>

      <NotesDrawer
        open={notesOpen}
        onOpenChange={setNotesOpen}
        customer_id={customer.id}
        customer_name={customer.full_name}
      />
    </div>
  );
}
```

### ใช้ Hook โดยตรง
เหมาะสำหรับการแสดง Recent Notes ใน Dashboard

```tsx
import { useCustomerNotes } from "@/hooks/useCustomerNotes";

export function RecentNotes({ customerId }) {
  const { notes, loading } = useCustomerNotes(customerId, {
    pinned_only: false,
    include_private: true
  });

  if (loading) return <div>กำลังโหลด...</div>;

  return (
    <div>
      <h3>บันทึกล่าสุด</h3>
      {notes.slice(0, 3).map(note => (
        <div key={note.id}>
          <p>{note.content}</p>
          <small>{note.created_by_name} - {note.created_at}</small>
        </div>
      ))}
    </div>
  );
}
```

## 🎯 ฟีเจอร์

### ✅ ใช้งานได้แล้ว
- ✅ เพิ่ม/แก้ไข/ลบ บันทึก
- ✅ ระบบ Timeline (หลายบันทึกต่อเวลา)
- ✅ Quick Templates (โทรศัพท์, นัดหมาย, ติดตาม, งบประมาณ, กำหนดเอง)
- ✅ แท็ก (tags) + แท็กแนะนำ
- ✅ ปักหมุด (pin) บันทึกสำคัญ
- ✅ บันทึกส่วนตัว (private)
- ✅ กำหนดวันติดตาม (follow-up date)
- ✅ Badge แสดงจำนวนการติดตามที่ค้าง
- ✅ Multi-tenant security (RLS)
- ✅ Audit trail (created_by_name, updated_by_name)

### ⏳ อยู่ในแผน (TODO)
- ⏳ Voice Input (ใช้ lib/voice-recognition.ts)
- ⏳ AI Auto-summary หลังแชท
- ⏳ Smart Reminders
- ⏳ แนบรูปภาพ/ไฟล์
- ⏳ เชื่อมกับ Scan Results & Proposals

## 📊 Database Schema

```sql
customer_notes (
  id UUID PRIMARY KEY,
  customer_id UUID → users(id),
  sales_staff_id UUID → users(id),
  clinic_id UUID → clinics(id),
  content TEXT NOT NULL,
  note_type TEXT (call|meeting|followup|general|important),
  tags TEXT[],
  is_private BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  followup_date TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,
  related_scan_id UUID,
  related_proposal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_name TEXT,
  updated_by_name TEXT
)
```

## 🔒 Security

- **RLS Policies**: แยกข้อมูลตาม clinic_id
- **Private Notes**: เห็นได้เฉพาะคนที่สร้าง
- **Owner Verification**: แก้ไข/ลบได้เฉพาะคนที่สร้าง
- **Audit Trail**: บันทึกชื่อผู้สร้าง/แก้ไข

## 📝 ตัวอย่างการใช้งาน

### ในหน้า Quick Scan
```tsx
// app/[locale]/sales/quick-scan/page.tsx
import { FloatingNotesButton } from "@/components/sales/customer-notes";

export default function QuickScanPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  return (
    <div>
      {/* ... existing code ... */}
      
      {selectedCustomer && (
        <FloatingNotesButton
          customer_id={selectedCustomer.id}
          customer_name={selectedCustomer.full_name}
        />
      )}
    </div>
  );
}
```

### ใน Hot Lead Card
```tsx
// components/sales/hot-lead-card.tsx
import { useState } from "react";
import { NotesDrawer } from "@/components/sales/customer-notes";
import { useCustomerNotes } from "@/hooks/useCustomerNotes";

export function HotLeadCard({ customer }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const { notes } = useCustomerNotes(customer.id);
  
  const latestNote = notes[0];
  const overdueFollowups = notes.filter(n => 
    n.followup_date && 
    new Date(n.followup_date) <= new Date() &&
    !n.reminder_sent
  ).length;

  return (
    <Card>
      {/* ... existing card content ... */}
      
      {/* แสดง Latest Note */}
      {latestNote && (
        <div className="text-xs text-gray-500 mt-2">
          <p className="truncate">{latestNote.content}</p>
          <small>{latestNote.created_by_name}</small>
        </div>
      )}

      {/* Badge แสดงการติดตามค้าง */}
      {overdueFollowups > 0 && (
        <Badge variant="destructive" className="mt-2">
          ต้องติดตาม {overdueFollowups} รายการ
        </Badge>
      )}

      <Button onClick={() => setNotesOpen(true)}>
        <StickyNote className="mr-2 h-4 w-4" />
        ดูบันทึกทั้งหมด ({notes.length})
      </Button>

      <NotesDrawer
        open={notesOpen}
        onOpenChange={setNotesOpen}
        customer_id={customer.id}
        customer_name={customer.full_name}
      />
    </Card>
  );
}
```

## 🎨 UI Components ที่ใช้

จาก `components/ui/`:
- Sheet (Drawer)
- Button
- Badge
- ScrollArea
- Textarea
- Input
- Label
- Switch
- Calendar
- Popover
- Select
- DropdownMenu
- AlertDialog

## 🔄 State Management

ใช้ React Hooks + Local State:
- `useState` for UI state
- `useEffect` for data fetching
- `useCallback` for memoized functions
- Optimistic updates (add/update/delete)

## 📱 Responsive Design

- **Mobile**: Full-width drawer with floating button
- **Desktop**: Max-width drawer, timeline view (future)
- **Tablet**: Adaptive layout

## 🚧 Next Steps

1. รัน migration ใน Supabase
2. ทดสอบใน dev environment
3. เพิ่ม FloatingNotesButton ในหน้าต่าง ๆ:
   - `/sales/quick-scan`
   - `/customer/[id]`
   - `/sales/dashboard` (ใน Lead Cards)
4. ทดสอบการสร้าง/แก้ไข/ลบ notes
5. เพิ่ม Voice Input (phase 2)
6. เพิ่ม AI features (phase 3)
