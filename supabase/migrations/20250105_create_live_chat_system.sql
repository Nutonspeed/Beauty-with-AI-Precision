-- ============================================================================
-- Live Chat System Migration
-- Beauty Clinic Management System
-- 
-- Context: This is for a BEAUTY/AESTHETICS CLINIC (คลินิกเสริมความงาม)
-- IMPORTANT: Use "customer" (ลูกค้า) NOT "patient" (ผู้ป่วย)
-- Customers seek beauty enhancement services, NOT medical treatment
-- ============================================================================

-- Table: chat_rooms
-- Purpose: Chat conversation rooms between customers and clinic staff
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Participants
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Room metadata
    room_type VARCHAR(50) DEFAULT 'support', -- support, consultation, appointment_inquiry, general
    subject VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- active, assigned, resolved, closed, archived
    priority VARCHAR(50) DEFAULT 'normal', -- low, normal, high, urgent
    
    -- Assignment tracking
    assigned_at TIMESTAMPTZ,
    auto_assigned BOOLEAN DEFAULT false,
    
    -- Resolution tracking
    resolved_at TIMESTAMPTZ,
    resolved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    
    -- Satisfaction rating (1-5 stars)
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    satisfaction_comment TEXT,
    rated_at TIMESTAMPTZ,
    
    -- Statistics
    total_messages INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    last_message_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Auto-close settings
    auto_close_enabled BOOLEAN DEFAULT true,
    inactive_hours_before_close INTEGER DEFAULT 24,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE INDEX idx_chat_rooms_clinic ON chat_rooms(clinic_id);
CREATE INDEX idx_chat_rooms_customer ON chat_rooms(customer_id);
CREATE INDEX idx_chat_rooms_staff ON chat_rooms(assigned_staff_id);
CREATE INDEX idx_chat_rooms_status ON chat_rooms(status);
CREATE INDEX idx_chat_rooms_priority ON chat_rooms(priority);
CREATE INDEX idx_chat_rooms_last_message ON chat_rooms(last_message_at DESC);
CREATE INDEX idx_chat_rooms_created ON chat_rooms(created_at DESC);

COMMENT ON TABLE chat_rooms IS 'Chat rooms for beauty clinic customer support and consultations';
COMMENT ON COLUMN chat_rooms.customer_id IS 'Customer (ลูกค้า) participating in chat - beauty clinic client';
COMMENT ON COLUMN chat_rooms.assigned_staff_id IS 'Clinic staff member assigned to handle this chat';

-- Table: chat_messages
-- Purpose: Individual messages in chat rooms
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    
    -- Message sender
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_type VARCHAR(50) NOT NULL, -- customer, staff, system
    
    -- Message content
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, file, system_notification
    content TEXT NOT NULL,
    
    -- File attachments
    attachments JSONB DEFAULT '[]', -- Array of {file_name, file_url, file_type, file_size}
    
    -- Message metadata
    is_system_message BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    
    -- Delivery tracking
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    
    -- Read tracking (who has read this message)
    read_by JSONB DEFAULT '[]', -- Array of {user_id, read_at}
    
    -- Reply/Thread
    reply_to_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);

COMMENT ON TABLE chat_messages IS 'Individual chat messages between customers and clinic staff';
COMMENT ON COLUMN chat_messages.sender_type IS 'Type of sender: customer (beauty clinic client), staff, or system';

-- Table: chat_typing_indicators
-- Purpose: Real-time typing indicators (short-lived records)
CREATE TABLE IF NOT EXISTS chat_typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Typing status
    is_typing BOOLEAN DEFAULT true,
    
    -- Auto-expire after 5 seconds of inactivity
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 seconds'),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Only one typing indicator per user per room
    CONSTRAINT unique_typing_indicator UNIQUE (room_id, user_id)
);

CREATE INDEX idx_chat_typing_room ON chat_typing_indicators(room_id);
CREATE INDEX idx_chat_typing_expires ON chat_typing_indicators(expires_at);

COMMENT ON TABLE chat_typing_indicators IS 'Real-time typing indicators for chat rooms';

-- Table: chat_participants
-- Purpose: Track all participants in a chat room (for group chats)
CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participant role
    role VARCHAR(50) DEFAULT 'participant', -- customer, staff, observer, supervisor
    
    -- Join/leave tracking
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    
    -- Notification settings
    notifications_enabled BOOLEAN DEFAULT true,
    muted_until TIMESTAMPTZ,
    
    -- Last read message tracking
    last_read_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    last_read_at TIMESTAMPTZ,
    
    -- Unread count
    unread_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint
    CONSTRAINT unique_participant UNIQUE (room_id, user_id)
);

CREATE INDEX idx_chat_participants_room ON chat_participants(room_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX idx_chat_participants_active ON chat_participants(is_active) WHERE is_active = true;

COMMENT ON TABLE chat_participants IS 'Participants in chat rooms with read status tracking';

-- Table: chat_file_uploads
-- Purpose: Track file uploads in chat
CREATE TABLE IF NOT EXISTS chat_file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    
    -- Upload metadata
    uploaded_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- File details
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100), -- image/jpeg, application/pdf, etc.
    file_size_bytes INTEGER,
    file_url TEXT NOT NULL,
    file_path TEXT,
    
    -- Storage info
    storage_provider VARCHAR(50) DEFAULT 'supabase', -- supabase, s3, cloudinary
    storage_bucket VARCHAR(100),
    storage_key TEXT,
    
    -- Image specific (if applicable)
    is_image BOOLEAN DEFAULT false,
    image_width INTEGER,
    image_height INTEGER,
    thumbnail_url TEXT,
    
    -- Security
    is_scanned BOOLEAN DEFAULT false,
    scan_status VARCHAR(50), -- clean, suspicious, malicious
    scan_result JSONB,
    
    -- Access tracking
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMPTZ,
    
    -- Auto-delete settings
    expires_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_file_uploads_room ON chat_file_uploads(room_id);
CREATE INDEX idx_chat_file_uploads_message ON chat_file_uploads(message_id);
CREATE INDEX idx_chat_file_uploads_user ON chat_file_uploads(uploaded_by_user_id);
CREATE INDEX idx_chat_file_uploads_created ON chat_file_uploads(created_at DESC);

COMMENT ON TABLE chat_file_uploads IS 'File attachments in chat messages';

-- Table: chat_auto_replies
-- Purpose: Automated reply templates for common questions
CREATE TABLE IF NOT EXISTS chat_auto_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Trigger configuration
    trigger_keywords JSONB DEFAULT '[]', -- Array of keywords that trigger this reply
    trigger_pattern VARCHAR(500), -- Regex pattern for matching
    
    -- Reply content
    reply_message TEXT NOT NULL,
    include_staff_assignment BOOLEAN DEFAULT false,
    
    -- Conditions
    active_hours_only BOOLEAN DEFAULT false,
    business_hours_start TIME,
    business_hours_end TIME,
    
    -- Priority and ordering
    priority INTEGER DEFAULT 0,
    match_order INTEGER DEFAULT 0,
    
    -- Usage statistics
    triggered_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_auto_replies_clinic ON chat_auto_replies(clinic_id);
CREATE INDEX idx_chat_auto_replies_active ON chat_auto_replies(is_active) WHERE is_active = true;
CREATE INDEX idx_chat_auto_replies_priority ON chat_auto_replies(priority DESC);

COMMENT ON TABLE chat_auto_replies IS 'Automated reply templates for beauty clinic chat system';

-- ============================================================================
-- Functions
-- ============================================================================

-- Function: Mark message as read
CREATE OR REPLACE FUNCTION mark_message_as_read(
    p_message_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_read_by JSONB;
    v_already_read BOOLEAN;
BEGIN
    -- Get current read_by array
    SELECT read_by INTO v_read_by
    FROM chat_messages
    WHERE id = p_message_id;
    
    -- Check if user already read this message
    SELECT EXISTS (
        SELECT 1 FROM jsonb_array_elements(v_read_by) elem
        WHERE elem->>'user_id' = p_user_id::TEXT
    ) INTO v_already_read;
    
    IF NOT v_already_read THEN
        -- Add user to read_by array
        UPDATE chat_messages
        SET read_by = read_by || jsonb_build_object('user_id', p_user_id, 'read_at', NOW())
        WHERE id = p_message_id;
        
        -- Update participant's last_read
        UPDATE chat_participants
        SET 
            last_read_message_id = p_message_id,
            last_read_at = NOW(),
            unread_count = GREATEST(unread_count - 1, 0)
        WHERE room_id = (SELECT room_id FROM chat_messages WHERE id = p_message_id)
        AND user_id = p_user_id;
        
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_message_as_read IS 'Mark a chat message as read by a user';

-- Function: Get unread message count for user
CREATE OR REPLACE FUNCTION get_unread_message_count(
    p_user_id UUID,
    p_room_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    IF p_room_id IS NOT NULL THEN
        -- Count unread in specific room
        SELECT COUNT(*)::INTEGER INTO v_count
        FROM chat_messages cm
        WHERE cm.room_id = p_room_id
        AND cm.sender_id != p_user_id
        AND NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements(cm.read_by) elem
            WHERE elem->>'user_id' = p_user_id::TEXT
        );
    ELSE
        -- Count unread across all rooms
        SELECT SUM(unread_count)::INTEGER INTO v_count
        FROM chat_participants
        WHERE user_id = p_user_id
        AND is_active = true;
    END IF;
    
    RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_unread_message_count IS 'Get unread message count for user in room or all rooms';

-- Function: Auto-assign chat to available staff
CREATE OR REPLACE FUNCTION auto_assign_chat_to_staff(
    p_room_id UUID,
    p_clinic_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_staff_id UUID;
BEGIN
    -- Find least busy staff member who is active
    SELECT cs.user_id INTO v_staff_id
    FROM clinic_staff cs
    LEFT JOIN chat_rooms cr ON cr.assigned_staff_id = cs.user_id AND cr.status IN ('active', 'assigned')
    WHERE cs.clinic_id = p_clinic_id
    AND cs.is_active = true
    AND cs.role IN ('staff', 'admin', 'manager')
    GROUP BY cs.user_id
    ORDER BY COUNT(cr.id) ASC
    LIMIT 1;
    
    IF v_staff_id IS NOT NULL THEN
        -- Assign the room to this staff member
        UPDATE chat_rooms
        SET 
            assigned_staff_id = v_staff_id,
            assigned_at = NOW(),
            auto_assigned = true,
            status = 'assigned'
        WHERE id = p_room_id;
        
        -- Add staff as participant
        INSERT INTO chat_participants (room_id, user_id, role)
        VALUES (p_room_id, v_staff_id, 'staff')
        ON CONFLICT (room_id, user_id) DO NOTHING;
    END IF;
    
    RETURN v_staff_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_assign_chat_to_staff IS 'Automatically assign chat room to least busy available staff member';

-- ============================================================================
-- Triggers
-- ============================================================================

-- Trigger: Update chat_rooms stats when message is sent
CREATE OR REPLACE FUNCTION update_chat_room_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_rooms
    SET 
        total_messages = total_messages + 1,
        last_message_at = NEW.created_at,
        last_message_by_user_id = NEW.sender_id,
        updated_at = NOW()
    WHERE id = NEW.room_id;
    
    -- Increment unread count for other participants
    UPDATE chat_participants
    SET 
        unread_count = unread_count + 1,
        updated_at = NOW()
    WHERE room_id = NEW.room_id
    AND user_id != NEW.sender_id
    AND is_active = true;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_room_stats
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_room_stats();

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_updated_at();

CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_updated_at();

CREATE TRIGGER update_chat_participants_updated_at
    BEFORE UPDATE ON chat_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_updated_at();

CREATE TRIGGER update_chat_typing_indicators_updated_at
    BEFORE UPDATE ON chat_typing_indicators
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_updated_at();

-- Trigger: Clean up expired typing indicators
CREATE OR REPLACE FUNCTION cleanup_expired_typing_indicators()
RETURNS void AS $$
BEGIN
    DELETE FROM chat_typing_indicators
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_auto_replies ENABLE ROW LEVEL SECURITY;

-- Policies for chat_rooms
CREATE POLICY "Customers can view their own chat rooms"
    ON chat_rooms FOR SELECT
    USING (customer_id = auth.uid());

CREATE POLICY "Clinic staff can view assigned chat rooms"
    ON chat_rooms FOR SELECT
    USING (
        assigned_staff_id = auth.uid()
        OR clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Customers can create chat rooms"
    ON chat_rooms FOR INSERT
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff can update chat rooms"
    ON chat_rooms FOR UPDATE
    USING (
        clinic_id IN (
            SELECT clinic_id FROM clinic_staff 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Policies for chat_messages
CREATE POLICY "Users can view messages in their chat rooms"
    ON chat_messages FOR SELECT
    USING (
        room_id IN (
            SELECT id FROM chat_rooms 
            WHERE customer_id = auth.uid() 
            OR assigned_staff_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages in their chat rooms"
    ON chat_messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND room_id IN (
            SELECT id FROM chat_rooms 
            WHERE customer_id = auth.uid() 
            OR assigned_staff_id = auth.uid()
        )
    );

-- Policies for chat_participants
CREATE POLICY "Users can view their own participations"
    ON chat_participants FOR SELECT
    USING (user_id = auth.uid());

-- Policies for chat_typing_indicators
CREATE POLICY "Users can manage their own typing indicators"
    ON chat_typing_indicators FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Policies for chat_file_uploads
CREATE POLICY "Users can view files in their chat rooms"
    ON chat_file_uploads FOR SELECT
    USING (
        room_id IN (
            SELECT id FROM chat_rooms 
            WHERE customer_id = auth.uid() 
            OR assigned_staff_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload files in their chat rooms"
    ON chat_file_uploads FOR INSERT
    WITH CHECK (
        uploaded_by_user_id = auth.uid()
        AND room_id IN (
            SELECT id FROM chat_rooms 
            WHERE customer_id = auth.uid() 
            OR assigned_staff_id = auth.uid()
        )
    );

-- ============================================================================
-- Sample Data (Optional - for development/testing)
-- ============================================================================

-- Sample auto-reply templates
INSERT INTO chat_auto_replies (clinic_id, trigger_keywords, reply_message, is_active)
SELECT 
    c.id,
    '["ราคา", "price", "เท่าไหร่", "how much"]'::JSONB,
    'สวัสดีค่ะ ขอบคุณที่สอบถามค่ะ ทางเราจะมีเจ้าหน้าที่ตอบคำถามเรื่องราคาให้เร็วๆ นี้ค่ะ หรือสามารถดูรายละเอียดได้ที่เว็บไซต์ของเราได้เลยค่ะ',
    true
FROM clinics c
LIMIT 1;

INSERT INTO chat_auto_replies (clinic_id, trigger_keywords, reply_message, is_active)
SELECT 
    c.id,
    '["นัดหมาย", "appointment", "booking", "จอง"]'::JSONB,
    'สวัสดีค่ะ หากต้องการนัดหมายสามารถจองผ่านระบบออนไลน์ได้เลยค่ะ หรือติดต่อเจ้าหน้าที่เพื่อช่วยจองให้ค่ะ',
    true
FROM clinics c
LIMIT 1;
