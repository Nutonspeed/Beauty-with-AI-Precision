# 💬 Enable Supabase Realtime for Chat

## ⚡ Quick Enable (2 นาที)

### Step 1: Enable Realtime in Supabase

1. **เปิด Supabase SQL Editor**:
   - URL: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/sql/new

2. **Run this SQL**:

```sql
-- Enable realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Optional: Enable for chat_rooms too
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;

-- Optional: Enable for sales_chat_messages (if exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sales_chat_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE sales_chat_messages';
    RAISE NOTICE '✅ Enabled realtime for sales_chat_messages';
  ELSE
    RAISE NOTICE 'ℹ️  Table sales_chat_messages does not exist';
  END IF;
END $$;
```

3. Click **RUN** or press Ctrl+Enter

### ✅ Verify Realtime is Enabled

Run this query:

```sql
-- Check which tables have realtime enabled
SELECT 
  schemaname,
  tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

**Expected Output** (should include):
```
public | chat_messages
public | chat_rooms
```

### Step 2: Test Realtime (Browser Console)

1. **เปิด Sales Dashboard**:
   - URL: http://localhost:3004/sales/dashboard

2. **เปิด Browser Console** (F12)

3. **Run this test**:

```javascript
// Test Realtime Subscription
const { createClient } = window.supabase;

// Create client (ใช้ credentials จาก .env.local)
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Subscribe to chat_messages
const channel = supabase
  .channel('test-realtime-chat')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages'
  }, (payload) => {
    console.log('🎉 New message received:', payload.new);
  })
  .subscribe((status) => {
    console.log('📡 Subscription status:', status);
  });

// You should see: 📡 Subscription status: SUBSCRIBED
```

4. **Send a test message**:
   - Open Chat Drawer in UI
   - Send a message
   - ✅ Check console for: "🎉 New message received:"

### Step 3: Verify Component Implementation

ตรวจสอบว่า components มี realtime subscription:

```bash
# Check chat-drawer has realtime
grep -n "supabase.channel" components/sales/chat-drawer.tsx
```

**Expected**: ควรเห็น code ที่มี:
- `.channel(`sales_chat_messages:...`)`
- `.on('postgres_changes', ...)`
- `.subscribe()`

## 🎯 Testing Realtime

### Test 1: Single User

1. เปิด Sales Dashboard
2. เลือก Lead
3. เปิด Chat Drawer
4. ส่งข้อความ
5. ✅ ข้อความควรปรากฏทันที

### Test 2: Multiple Users (Real-time!)

1. **Browser 1**: Chrome
   - Login as User A
   - Open Lead chat

2. **Browser 2**: Firefox (Incognito)
   - Login as User B (different user)
   - Open same Lead chat

3. **Test**:
   - Send message from Browser 1
   - ✅ Browser 2 ควรเห็นข้อความทันที (ไม่ต้อง refresh!)
   - Send message from Browser 2
   - ✅ Browser 1 ควรเห็นข้อความทันที

### Test 3: Database Insert

```sql
-- Insert test message directly in database
INSERT INTO chat_messages (
  room_id,
  sender_id,
  sender_type,
  message_type,
  content,
  sent_at
) VALUES (
  'your-room-id',
  'your-user-id',
  'staff',
  'text',
  'Test realtime message from SQL!',
  NOW()
);
```

✅ ข้อความควรปรากฏในทุก browsers ที่เปิด chat อยู่!

## 🔍 Debug Realtime

### Check Realtime Status

```javascript
// In browser console
supabase.realtime.channels.forEach(channel => {
  console.log('Channel:', channel.topic);
  console.log('State:', channel.state);
  console.log('Subscriptions:', channel.bindings);
});
```

**Healthy Status**:
- State: "joined"
- Subscriptions: มี array ของ postgres_changes

### Common Issues

**Issue 1: "Subscription status: CHANNEL_ERROR"**

Solution:
```sql
-- Make sure table is in publication
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'chat_messages';

-- If empty, run again:
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
```

**Issue 2: Messages not appearing**

1. ✅ Check RLS policies allow SELECT
```sql
-- Test policy
SELECT * FROM chat_messages 
WHERE room_id = 'your-room-id'
LIMIT 5;
```

2. ✅ Check subscription filter
```javascript
// Make sure filter matches your data
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'chat_messages',
  filter: `room_id=eq.${roomId}`  // Check roomId is correct
})
```

**Issue 3: "Realtime disabled"**

1. Go to: https://supabase.com/dashboard/project/bgejeqqngzvuokdffadu/settings/api
2. Check **"Enable Realtime"** is ON
3. Check **"Database Webhooks"** is ON

## 📊 Realtime Performance

### Supabase Realtime Limits (Free Tier):
- ✅ 200 concurrent connections
- ✅ 2 million messages/month
- ✅ WebSocket connections
- ⚠️ Broadcast disabled by default

### Optimize Performance:

1. **Use specific filters**:
```javascript
// Good - only specific room
filter: `room_id=eq.${roomId}`

// Bad - all messages
// no filter
```

2. **Unsubscribe when done**:
```javascript
useEffect(() => {
  const channel = supabase.channel(...).subscribe();
  
  return () => {
    supabase.removeChannel(channel);  // Cleanup
  };
}, []);
```

3. **Batch updates**:
```javascript
// Instead of updating state for each message
// Batch updates in intervals
const [pendingMessages, setPendingMessages] = useState([]);

useEffect(() => {
  const interval = setInterval(() => {
    if (pendingMessages.length > 0) {
      setMessages(prev => [...prev, ...pendingMessages]);
      setPendingMessages([]);
    }
  }, 1000);  // Batch every 1 second
  
  return () => clearInterval(interval);
}, [pendingMessages]);
```

## ✅ Success Checklist

- [ ] Run SQL to enable realtime
- [ ] Verify with pg_publication_tables query
- [ ] Test in browser console
- [ ] Test single user chat
- [ ] Test multi-user chat (2 browsers)
- [ ] Messages appear instantly without refresh ✅
- [ ] No console errors
- [ ] Subscriptions clean up properly

## 🎉 Done!

Chat realtime ทำงาน 100%!

**Benefits**:
- ✅ Instant messaging
- ✅ No polling
- ✅ No page refresh needed
- ✅ Multiple users see updates simultaneously
- ✅ Professional chat experience

**Next**: Task 3 - Setup TURN Server (หรือ Task 5 - Fix TypeScript)
