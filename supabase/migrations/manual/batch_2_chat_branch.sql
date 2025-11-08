-- ===================================
-- BATCH 2: LIVE CHAT + BRANCH MANAGEMENT
-- Tasks 16-17
-- ===================================

BEGIN;

-- ===================================
-- TASK 16: LIVE CHAT SYSTEM
-- ===================================

DROP TABLE IF EXISTS chat_read_status CASCADE;
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;

-- 1. Chat Rooms Table
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type VARCHAR(20) CHECK (room_type IN ('direct', 'group', 'support')) NOT NULL,
  name VARCHAR(255),
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Chat Messages Table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  message_type VARCHAR(20) CHECK (message_type IN ('text', 'image', 'file', 'system')) DEFAULT 'text',
  content TEXT NOT NULL,
  attachments JSONB,
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

-- 3. Chat Participants Table
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(20) CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  
  CONSTRAINT unique_room_participant UNIQUE (room_id, user_id)
);

-- 4. Chat Read Status Table
CREATE TABLE chat_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_message_reader UNIQUE (message_id, user_id)
);

-- Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_read_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access chat_rooms" ON chat_rooms FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access chat_messages" ON chat_messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access chat_participants" ON chat_participants FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access chat_read_status" ON chat_read_status FOR ALL USING (auth.role() = 'service_role');

-- ===================================
-- TASK 17: BRANCH MANAGEMENT SYSTEM
-- ===================================

DROP TABLE IF EXISTS branch_revenue CASCADE;
DROP TABLE IF EXISTS branch_services CASCADE;
DROP TABLE IF EXISTS branch_transfer_items CASCADE;
DROP TABLE IF EXISTS branch_transfers CASCADE;
DROP TABLE IF EXISTS branch_inventory CASCADE;
DROP TABLE IF EXISTS branch_staff_assignments CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- 1. Branches Table
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_code VARCHAR(20) NOT NULL UNIQUE,
  branch_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  manager_id UUID REFERENCES auth.users(id),
  opening_hours JSONB,
  capacity INTEGER,
  services_offered JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Branch Staff Assignments Table
CREATE TABLE branch_staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES auth.users(id),
  role VARCHAR(100),
  start_date DATE NOT NULL,
  end_date DATE,
  is_primary BOOLEAN DEFAULT TRUE,
  working_hours JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_branch_staff UNIQUE (branch_id, staff_id, start_date)
);

-- 3. Branch Inventory Table
CREATE TABLE branch_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  item_id UUID,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 10,
  max_quantity INTEGER,
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_branch_item UNIQUE (branch_id, item_id)
);

-- 4. Branch Transfers Table
CREATE TABLE branch_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_number VARCHAR(50) NOT NULL UNIQUE,
  from_branch_id UUID REFERENCES branches(id),
  to_branch_id UUID REFERENCES branches(id),
  status VARCHAR(20) CHECK (status IN ('pending', 'in-transit', 'received', 'cancelled')) DEFAULT 'pending',
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  transfer_date DATE,
  received_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Branch Transfer Items Table
CREATE TABLE branch_transfer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID REFERENCES branch_transfers(id) ON DELETE CASCADE,
  item_id UUID,
  quantity_requested INTEGER NOT NULL,
  quantity_sent INTEGER,
  quantity_received INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Branch Services Table
CREATE TABLE branch_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  service_id UUID,
  service_name VARCHAR(255) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  price DECIMAL(10, 2),
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_branch_service UNIQUE (branch_id, service_id)
);

-- 7. Branch Revenue Table
CREATE TABLE branch_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue_type VARCHAR(50),
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_branch_revenue UNIQUE (branch_id, date, revenue_type)
);

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_revenue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access branches" ON branches FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access branch_staff_assignments" ON branch_staff_assignments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access branch_inventory" ON branch_inventory FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access branch_transfers" ON branch_transfers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access branch_transfer_items" ON branch_transfer_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access branch_services" ON branch_services FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access branch_revenue" ON branch_revenue FOR ALL USING (auth.role() = 'service_role');

COMMIT;

SELECT 'Live Chat System: 4 tables created' as status
UNION ALL
SELECT 'Branch Management: 7 tables created'
UNION ALL
SELECT 'Total: 11 tables created in this batch';
