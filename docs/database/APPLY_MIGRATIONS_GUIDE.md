# 🚀 Apply Migrations - คู่มือฉบับย่อ

## ⚡ Quick Start (5 นาที)

### Step 1: Video Call Migration

1. **เปิด Supabase SQL Editor**:
   - URL: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/sql/new

2. **Copy SQL from file**:
   - File: `supabase/migrations/20241121_create_video_call_tables.sql`
   - Action: Select All (Ctrl+A) → Copy (Ctrl+C)

3. **Run in SQL Editor**:
   - Paste in SQL Editor
   - Click **RUN** or press Ctrl+Enter
   - Wait for ✅ success messages

### Step 2: Email Tracking Migration

1. **New Query**:
   - Click "New Query" in SQL Editor

2. **Copy SQL from file**:
   - File: `supabase/migrations/20241121_create_email_tracking_templates.sql`
   - Action: Select All (Ctrl+A) → Copy (Ctrl+C)

3. **Run in SQL Editor**:
   - Paste in SQL Editor
   - Click **RUN**
   - Wait for ✅ success + 4 templates inserted

### ✅ Verify Migrations

Run this in SQL Editor:

```sql
-- Should return 4 tables
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns 
        WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'video_call_sessions',
    'video_call_participants',
    'sales_email_templates',
    'sales_email_tracking'
  )
ORDER BY table_name;
```

Expected Output:
```
sales_email_templates      | 11 columns
sales_email_tracking       | 17 columns
video_call_participants    | 11 columns
video_call_sessions        | 14 columns
```

### 🎯 Check Email Templates

```sql
-- Should return 4 templates
SELECT name, category, is_active 
FROM sales_email_templates 
ORDER BY category, name;
```

Expected Output:
```
Follow-up: First Contact    | follow_up  | true
Proposal Sent              | proposal   | true
Appointment Reminder       | reminder   | true
Thank You - First Visit    | thank_you  | true
```

## 🎉 Success!

When you see all tables and templates, migrations are complete!

**Next**: Task 2 - ตั้งค่า Resend API key
