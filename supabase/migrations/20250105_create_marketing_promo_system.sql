-- =====================================================================================
-- Marketing Campaign & Promo Code System Migration
-- =====================================================================================
-- Description: Complete marketing system for beauty clinic with campaigns, promo codes,
--              discount rules, usage tracking, and customer segmentation
-- Created: 2025-01-05
-- Terminology: Uses "customer" (ลูกค้า) NOT "patient" (ผู้ป่วย) - Beauty Clinic context
-- =====================================================================================

-- =====================================================================================
-- 1. MARKETING CAMPAIGNS TABLE
-- =====================================================================================
-- Purpose: Store marketing campaigns for promotions and customer engagement
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Campaign Details
    campaign_code VARCHAR(50) UNIQUE NOT NULL,
    campaign_name VARCHAR(200) NOT NULL,
    campaign_name_en VARCHAR(200),
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL, -- 'seasonal', 'new_customer', 'loyalty', 'referral', 'flash_sale', 'bundle', 'birthday', 'anniversary'
    
    -- Campaign Period
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Target Audience
    target_audience JSONB, -- {customer_segment: [], min_age: 18, max_age: 65, gender: 'all/female/male', location: []}
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_uses_per_customer INTEGER, -- NULL = unlimited
    
    -- Campaign Channels
    channels JSONB, -- ['website', 'line', 'facebook', 'instagram', 'email', 'sms', 'in_store']
    
    -- Tracking
    total_budget DECIMAL(12,2),
    spent_budget DECIMAL(12,2) DEFAULT 0,
    target_customers INTEGER,
    reached_customers INTEGER DEFAULT 0,
    converted_customers INTEGER DEFAULT 0, -- Customers who used promo codes
    total_revenue DECIMAL(12,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled'
    
    -- Meta
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- =====================================================================================
-- 2. PROMO CODES TABLE
-- =====================================================================================
-- Purpose: Store promotional codes that customers can use for discounts
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
    
    -- Promo Code Details
    code VARCHAR(50) UNIQUE NOT NULL,
    code_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed_amount', 'free_service', 'free_product', 'bundle_discount'
    
    -- Discount Configuration
    discount_percentage DECIMAL(5,2), -- For percentage discounts (e.g., 20.00 = 20%)
    discount_amount DECIMAL(10,2), -- For fixed amount discounts
    max_discount_amount DECIMAL(10,2), -- Maximum discount for percentage codes
    
    -- Applicability
    applies_to VARCHAR(50) NOT NULL, -- 'all', 'services', 'products', 'specific_items'
    applicable_service_ids JSONB, -- Array of service IDs if applies_to = 'services' or 'specific_items'
    applicable_product_ids JSONB, -- Array of product IDs if applies_to = 'products' or 'specific_items'
    applicable_category_ids JSONB, -- Array of category IDs
    
    -- Restrictions
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    min_items_quantity INTEGER DEFAULT 1,
    requires_new_customer BOOLEAN DEFAULT false,
    branch_ids JSONB, -- NULL = all branches, or specific branch IDs
    
    -- Usage Limits
    max_total_uses INTEGER, -- Total times code can be used across all customers
    max_uses_per_customer INTEGER DEFAULT 1,
    current_total_uses INTEGER DEFAULT 0,
    
    -- Validity Period
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    
    -- Combination Rules
    can_combine_with_other_promos BOOLEAN DEFAULT false,
    excludes_sale_items BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true, -- If false, code is private/invitation-only
    
    -- Meta
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    terms_and_conditions TEXT
);

-- =====================================================================================
-- 3. PROMO CODE USAGE TABLE
-- =====================================================================================
-- Purpose: Track usage of promo codes by customers for analytics
CREATE TABLE IF NOT EXISTS promo_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Usage Details
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    order_id UUID, -- For product orders (if implemented)
    
    -- Discount Applied
    original_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    
    -- Usage Context
    used_at TIMESTAMPTZ DEFAULT NOW(),
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    
    -- Status
    status VARCHAR(50) DEFAULT 'applied', -- 'applied', 'refunded', 'cancelled'
    refunded_at TIMESTAMPTZ,
    refund_reason TEXT,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- =====================================================================================
-- 4. CUSTOMER SEGMENTS TABLE
-- =====================================================================================
-- Purpose: Define customer segments for targeted marketing campaigns
CREATE TABLE IF NOT EXISTS customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Segment Details
    segment_name VARCHAR(200) NOT NULL,
    segment_name_en VARCHAR(200),
    description TEXT,
    segment_type VARCHAR(50) NOT NULL, -- 'demographic', 'behavioral', 'value_based', 'lifecycle', 'custom'
    
    -- Segment Criteria (stored as JSONB for flexibility)
    criteria JSONB NOT NULL, -- {age_range: [18,65], gender: 'female', total_spent: {min: 10000}, visit_frequency: 'high', last_visit_days: 90}
    
    -- Dynamic vs Static
    is_dynamic BOOLEAN DEFAULT true, -- If true, automatically updates based on criteria
    
    -- Customer Count
    customer_count INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Meta
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- 5. CUSTOMER SEGMENT MEMBERS TABLE
-- =====================================================================================
-- Purpose: Store which customers belong to which segments
CREATE TABLE IF NOT EXISTS customer_segment_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Membership Details
    added_at TIMESTAMPTZ DEFAULT NOW(),
    added_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- For dynamic segments
    last_evaluated_at TIMESTAMPTZ,
    
    -- Meta
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_segment_customer UNIQUE(segment_id, customer_id)
);

-- =====================================================================================
-- 6. CAMPAIGN MESSAGES TABLE
-- =====================================================================================
-- Purpose: Store marketing messages sent as part of campaigns
CREATE TABLE IF NOT EXISTS campaign_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    
    -- Message Details
    message_type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'line', 'push_notification', 'in_app'
    subject VARCHAR(500), -- For emails
    message_content TEXT NOT NULL,
    message_html TEXT, -- For HTML emails
    
    -- Targeting
    target_segment_id UUID REFERENCES customer_segments(id) ON DELETE SET NULL,
    
    -- Scheduling
    scheduled_send_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    
    -- Tracking
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    converted_count INTEGER DEFAULT 0, -- Recipients who made purchase
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
    
    -- Meta
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================================
-- 7. CAMPAIGN MESSAGE RECIPIENTS TABLE
-- =====================================================================================
-- Purpose: Track individual message deliveries to customers
CREATE TABLE IF NOT EXISTS campaign_message_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES campaign_messages(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Delivery Status
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ, -- When customer made purchase
    
    -- Tracking
    delivery_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced', 'unsubscribed'
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Conversion
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    order_id UUID, -- For product orders
    
    -- Meta
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_message_customer UNIQUE(message_id, customer_id)
);

-- =====================================================================================
-- 8. DISCOUNT RULES TABLE
-- =====================================================================================
-- Purpose: Complex discount rules for automated promotions
CREATE TABLE IF NOT EXISTS discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    
    -- Rule Details
    rule_name VARCHAR(200) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'buy_x_get_y', 'spend_x_get_y', 'bundle', 'tiered', 'time_based', 'quantity_based'
    
    -- Rule Configuration (flexible JSONB)
    rule_config JSONB NOT NULL, -- {buy_quantity: 2, get_quantity: 1, get_discount: 100, applies_to: [...]}
    
    -- Applicability
    applies_to VARCHAR(50) NOT NULL, -- 'services', 'products', 'categories', 'all'
    applicable_ids JSONB, -- Service/Product/Category IDs
    
    -- Priority (higher number = higher priority)
    priority INTEGER DEFAULT 0,
    
    -- Validity
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    
    -- Days/Times
    valid_days_of_week JSONB, -- [1,2,3,4,5] = Monday to Friday
    valid_time_ranges JSONB, -- [{start: "09:00", end: "12:00"}]
    
    -- Limits
    max_applications_per_transaction INTEGER DEFAULT 1,
    max_total_applications INTEGER, -- Total times rule can be applied
    current_applications INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Meta
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

-- =====================================================================================
-- INDEXES
-- =====================================================================================

-- Marketing Campaigns
CREATE INDEX idx_marketing_campaigns_clinic ON marketing_campaigns(clinic_id);
CREATE INDEX idx_marketing_campaigns_code ON marketing_campaigns(campaign_code);
CREATE INDEX idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);
CREATE INDEX idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_marketing_campaigns_active ON marketing_campaigns(is_active, status);

-- Promo Codes
CREATE INDEX idx_promo_codes_clinic ON promo_codes(clinic_id);
CREATE INDEX idx_promo_codes_campaign ON promo_codes(campaign_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX idx_promo_codes_validity ON promo_codes(valid_from, valid_until);
CREATE INDEX idx_promo_codes_public ON promo_codes(is_public, is_active);

-- Promo Code Usage
CREATE INDEX idx_promo_usage_clinic ON promo_code_usage(clinic_id);
CREATE INDEX idx_promo_usage_code ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_usage_customer ON promo_code_usage(customer_id);
CREATE INDEX idx_promo_usage_booking ON promo_code_usage(booking_id);
CREATE INDEX idx_promo_usage_date ON promo_code_usage(used_at DESC);
CREATE INDEX idx_promo_usage_status ON promo_code_usage(status);

-- Customer Segments
CREATE INDEX idx_customer_segments_clinic ON customer_segments(clinic_id);
CREATE INDEX idx_customer_segments_type ON customer_segments(segment_type);
CREATE INDEX idx_customer_segments_active ON customer_segments(is_active);

-- Customer Segment Members
CREATE INDEX idx_segment_members_segment ON customer_segment_members(segment_id);
CREATE INDEX idx_segment_members_customer ON customer_segment_members(customer_id);
CREATE INDEX idx_segment_members_active ON customer_segment_members(is_active);

-- Campaign Messages
CREATE INDEX idx_campaign_messages_clinic ON campaign_messages(clinic_id);
CREATE INDEX idx_campaign_messages_campaign ON campaign_messages(campaign_id);
CREATE INDEX idx_campaign_messages_type ON campaign_messages(message_type);
CREATE INDEX idx_campaign_messages_status ON campaign_messages(status);
CREATE INDEX idx_campaign_messages_scheduled ON campaign_messages(scheduled_send_at);

-- Campaign Message Recipients
CREATE INDEX idx_message_recipients_message ON campaign_message_recipients(message_id);
CREATE INDEX idx_message_recipients_customer ON campaign_message_recipients(customer_id);
CREATE INDEX idx_message_recipients_status ON campaign_message_recipients(delivery_status);
CREATE INDEX idx_message_recipients_booking ON campaign_message_recipients(booking_id);

-- Discount Rules
CREATE INDEX idx_discount_rules_clinic ON discount_rules(clinic_id);
CREATE INDEX idx_discount_rules_campaign ON discount_rules(campaign_id);
CREATE INDEX idx_discount_rules_type ON discount_rules(rule_type);
CREATE INDEX idx_discount_rules_active ON discount_rules(is_active);
CREATE INDEX idx_discount_rules_validity ON discount_rules(valid_from, valid_until);
CREATE INDEX idx_discount_rules_priority ON discount_rules(priority DESC);

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================================

-- Enable RLS
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_rules ENABLE ROW LEVEL SECURITY;

-- Marketing Campaigns Policies
CREATE POLICY marketing_campaigns_view ON marketing_campaigns
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY marketing_campaigns_manage ON marketing_campaigns
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('clinic_admin', 'marketing_staff')
        )
    );

-- Promo Codes Policies
CREATE POLICY promo_codes_view_public ON promo_codes
    FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY promo_codes_view_clinic ON promo_codes
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY promo_codes_manage ON promo_codes
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('clinic_admin', 'marketing_staff')
        )
    );

-- Promo Code Usage Policies
CREATE POLICY promo_usage_view_own ON promo_code_usage
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY promo_usage_view_clinic ON promo_code_usage
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY promo_usage_create ON promo_code_usage
    FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Customer Segments Policies
CREATE POLICY customer_segments_view ON customer_segments
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY customer_segments_manage ON customer_segments
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('clinic_admin', 'marketing_staff')
        )
    );

-- Customer Segment Members Policies
CREATE POLICY segment_members_view ON customer_segment_members
    FOR SELECT USING (
        segment_id IN (
            SELECT id FROM customer_segments 
            WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY segment_members_manage ON customer_segment_members
    FOR ALL USING (
        segment_id IN (
            SELECT id FROM customer_segments 
            WHERE clinic_id IN (
                SELECT clinic_id FROM users 
                WHERE id = auth.uid() 
                AND role IN ('clinic_admin', 'marketing_staff')
            )
        )
    );

-- Campaign Messages Policies
CREATE POLICY campaign_messages_view ON campaign_messages
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY campaign_messages_manage ON campaign_messages
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('clinic_admin', 'marketing_staff')
        )
    );

-- Campaign Message Recipients Policies
CREATE POLICY message_recipients_view_own ON campaign_message_recipients
    FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY message_recipients_view_clinic ON campaign_message_recipients
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM campaign_messages 
            WHERE clinic_id IN (
                SELECT clinic_id FROM users WHERE id = auth.uid()
            )
        )
    );

-- Discount Rules Policies
CREATE POLICY discount_rules_view ON discount_rules
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY discount_rules_manage ON discount_rules
    FOR ALL USING (
        clinic_id IN (
            SELECT clinic_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('clinic_admin', 'marketing_staff')
        )
    );

-- =====================================================================================
-- TRIGGERS
-- =====================================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_marketing_campaigns_updated_at
    BEFORE UPDATE ON marketing_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at
    BEFORE UPDATE ON promo_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_segments_updated_at
    BEFORE UPDATE ON customer_segments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_messages_updated_at
    BEFORE UPDATE ON campaign_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_message_recipients_updated_at
    BEFORE UPDATE ON campaign_message_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_rules_updated_at
    BEFORE UPDATE ON discount_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- DATABASE FUNCTIONS
-- =====================================================================================

-- Function 1: Validate promo code for customer
CREATE OR REPLACE FUNCTION validate_promo_code(
    p_code VARCHAR,
    p_customer_id UUID,
    p_purchase_amount DECIMAL,
    p_service_ids JSONB DEFAULT NULL,
    p_product_ids JSONB DEFAULT NULL,
    p_branch_id UUID DEFAULT NULL
) RETURNS TABLE(
    is_valid BOOLEAN,
    promo_code_id UUID,
    discount_amount DECIMAL,
    error_message TEXT
) AS $$
DECLARE
    v_promo promo_codes%ROWTYPE;
    v_customer_uses INTEGER;
    v_discount DECIMAL;
    v_error TEXT;
BEGIN
    -- Get promo code
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE code = p_code
    AND is_active = true;
    
    -- Check if code exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'Promo code not found or inactive';
        RETURN;
    END IF;
    
    -- Check validity period
    IF NOW() < v_promo.valid_from OR NOW() > v_promo.valid_until THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'Promo code has expired or not yet valid';
        RETURN;
    END IF;
    
    -- Check minimum purchase amount
    IF p_purchase_amount < v_promo.min_purchase_amount THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 
            'Minimum purchase amount of ' || v_promo.min_purchase_amount || ' required';
        RETURN;
    END IF;
    
    -- Check branch restriction
    IF v_promo.branch_ids IS NOT NULL AND p_branch_id IS NOT NULL THEN
        IF NOT (v_promo.branch_ids ? p_branch_id::TEXT) THEN
            RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'Promo code not valid for this branch';
            RETURN;
        END IF;
    END IF;
    
    -- Check total usage limit
    IF v_promo.max_total_uses IS NOT NULL AND v_promo.current_total_uses >= v_promo.max_total_uses THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'Promo code usage limit reached';
        RETURN;
    END IF;
    
    -- Check customer usage limit
    SELECT COUNT(*) INTO v_customer_uses
    FROM promo_code_usage
    WHERE promo_code_id = v_promo.id
    AND customer_id = p_customer_id
    AND status = 'applied';
    
    IF v_promo.max_uses_per_customer IS NOT NULL AND v_customer_uses >= v_promo.max_uses_per_customer THEN
        RETURN QUERY SELECT false, NULL::UUID, 0::DECIMAL, 'You have already used this promo code';
        RETURN;
    END IF;
    
    -- Calculate discount
    IF v_promo.code_type = 'percentage' THEN
        v_discount := p_purchase_amount * (v_promo.discount_percentage / 100);
        IF v_promo.max_discount_amount IS NOT NULL AND v_discount > v_promo.max_discount_amount THEN
            v_discount := v_promo.max_discount_amount;
        END IF;
    ELSIF v_promo.code_type = 'fixed_amount' THEN
        v_discount := v_promo.discount_amount;
    ELSE
        v_discount := 0;
    END IF;
    
    -- Return success
    RETURN QUERY SELECT true, v_promo.id, v_discount, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Apply promo code and record usage
CREATE OR REPLACE FUNCTION apply_promo_code(
    p_promo_code_id UUID,
    p_customer_id UUID,
    p_booking_id UUID,
    p_original_amount DECIMAL,
    p_discount_amount DECIMAL,
    p_branch_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Insert usage record
    INSERT INTO promo_code_usage (
        clinic_id,
        promo_code_id,
        customer_id,
        booking_id,
        original_amount,
        discount_amount,
        final_amount,
        branch_id
    )
    SELECT 
        pc.clinic_id,
        p_promo_code_id,
        p_customer_id,
        p_booking_id,
        p_original_amount,
        p_discount_amount,
        p_original_amount - p_discount_amount,
        p_branch_id
    FROM promo_codes pc
    WHERE pc.id = p_promo_code_id;
    
    -- Update promo code usage count
    UPDATE promo_codes
    SET current_total_uses = current_total_uses + 1
    WHERE id = p_promo_code_id;
    
    -- Update campaign stats if associated
    UPDATE marketing_campaigns
    SET converted_customers = converted_customers + 1
    WHERE id = (SELECT campaign_id FROM promo_codes WHERE id = p_promo_code_id);
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Calculate segment customer count
CREATE OR REPLACE FUNCTION update_segment_customer_count(p_segment_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM customer_segment_members
    WHERE segment_id = p_segment_id
    AND is_active = true;
    
    UPDATE customer_segments
    SET customer_count = v_count,
        last_calculated_at = NOW()
    WHERE id = p_segment_id;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- SAMPLE DATA (Conditional Insert)
-- =====================================================================================

-- Insert sample campaign (only if clinic exists)
DO $$
DECLARE
    v_clinic_id UUID;
    v_admin_id UUID;
    v_campaign_id UUID;
BEGIN
    -- Get first clinic and admin
    SELECT id INTO v_clinic_id FROM clinics LIMIT 1;
    SELECT id INTO v_admin_id FROM users WHERE role = 'clinic_admin' LIMIT 1;
    
    IF v_clinic_id IS NOT NULL THEN
        -- Insert sample campaign
        INSERT INTO marketing_campaigns (
            clinic_id,
            campaign_code,
            campaign_name,
            campaign_name_en,
            description,
            campaign_type,
            start_date,
            end_date,
            target_audience,
            channels,
            total_budget,
            status,
            created_by_user_id
        ) VALUES (
            v_clinic_id,
            'NEW2025',
            'โปรโมชั่นลูกค้าใหม่ 2025',
            'New Customer Promotion 2025',
            'Special discount for new beauty clinic customers',
            'new_customer',
            NOW(),
            NOW() + INTERVAL '90 days',
            '{"customer_segment": ["new"], "min_age": 18, "max_age": 65}'::JSONB,
            '["website", "line", "facebook", "instagram"]'::JSONB,
            100000.00,
            'active',
            v_admin_id
        )
        RETURNING id INTO v_campaign_id;
        
        -- Insert sample promo code
        IF v_campaign_id IS NOT NULL THEN
            INSERT INTO promo_codes (
                clinic_id,
                campaign_id,
                code,
                code_type,
                discount_percentage,
                max_discount_amount,
                applies_to,
                min_purchase_amount,
                max_total_uses,
                max_uses_per_customer,
                valid_from,
                valid_until,
                is_active,
                is_public,
                description,
                created_by_user_id
            ) VALUES (
                v_clinic_id,
                v_campaign_id,
                'WELCOME20',
                'percentage',
                20.00,
                1000.00,
                'all',
                500.00,
                1000,
                1,
                NOW(),
                NOW() + INTERVAL '90 days',
                true,
                true,
                'Welcome discount for new beauty clinic customers - 20% off',
                v_admin_id
            );
        END IF;
    END IF;
END $$;

-- =====================================================================================
-- END OF MIGRATION
-- =====================================================================================
