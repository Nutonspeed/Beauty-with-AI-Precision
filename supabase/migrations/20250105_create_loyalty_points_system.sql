-- =====================================================================================
-- Customer Loyalty & Points System for Beauty Clinic
-- =====================================================================================
-- Description: Complete loyalty program system for beauty clinic customers
-- Features:
--   - Points earning rules (purchases, referrals, reviews, birthdays, etc.)
--   - Tier levels (Bronze, Silver, Gold, Platinum) with benefits
--   - Rewards catalog with point-based redemption
--   - Points transaction tracking with full audit trail
--   - Points expiration management
--   - Tier progression tracking
--   - Loyalty analytics and reporting
-- =====================================================================================

-- =====================================================================================
-- Table: loyalty_tiers
-- Purpose: Define loyalty tier levels with benefits for beauty clinic customers
-- =====================================================================================
CREATE TABLE IF NOT EXISTS loyalty_tiers (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Tier Information
    tier_name VARCHAR(100) NOT NULL, -- e.g., "สมาชิกบรอนซ์" (Bronze Member)
    tier_name_en VARCHAR(100), -- e.g., "Bronze Member"
    tier_level INTEGER NOT NULL, -- 1=Bronze, 2=Silver, 3=Gold, 4=Platinum
    tier_color VARCHAR(50), -- Hex color for UI display
    tier_icon TEXT, -- Icon URL or name
    
    -- Requirements
    min_points_required INTEGER NOT NULL DEFAULT 0, -- Minimum points to reach this tier
    min_spending_required DECIMAL(10,2), -- Minimum total spending to reach this tier
    maintenance_points INTEGER, -- Points needed per period to maintain tier
    maintenance_period_days INTEGER, -- Period to maintain points (e.g., 365 days)
    
    -- Benefits
    points_multiplier DECIMAL(4,2) DEFAULT 1.00, -- Points earning multiplier (e.g., 1.5x)
    discount_percentage DECIMAL(5,2) DEFAULT 0, -- Automatic discount percentage
    birthday_bonus_points INTEGER DEFAULT 0, -- Bonus points on customer birthday
    priority_booking BOOLEAN DEFAULT false, -- Priority in booking queue
    exclusive_services BOOLEAN DEFAULT false, -- Access to exclusive services
    free_consultations INTEGER DEFAULT 0, -- Free consultations per year
    special_gifts BOOLEAN DEFAULT false, -- Eligible for special gifts
    benefits_description TEXT, -- Detailed benefits description
    benefits_description_en TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0, -- Order for display in UI
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    notes TEXT,
    
    -- Constraints
    CONSTRAINT unique_clinic_tier_level UNIQUE (clinic_id, tier_level),
    CONSTRAINT unique_clinic_tier_name UNIQUE (clinic_id, tier_name),
    CONSTRAINT valid_tier_level CHECK (tier_level > 0),
    CONSTRAINT valid_points_multiplier CHECK (points_multiplier >= 0),
    CONSTRAINT valid_discount_percentage CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
);

-- =====================================================================================
-- Table: customer_loyalty_status
-- Purpose: Track current loyalty status for each beauty clinic customer
-- =====================================================================================
CREATE TABLE IF NOT EXISTS customer_loyalty_status (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_tier_id UUID REFERENCES loyalty_tiers(id),
    
    -- Points Balance
    total_points_earned INTEGER DEFAULT 0, -- Lifetime points earned
    total_points_spent INTEGER DEFAULT 0, -- Lifetime points redeemed
    current_points_balance INTEGER DEFAULT 0, -- Available points
    pending_points INTEGER DEFAULT 0, -- Points pending approval
    expired_points INTEGER DEFAULT 0, -- Total points expired
    
    -- Tier Information
    tier_achieved_at TIMESTAMPTZ, -- When customer reached current tier
    next_tier_points_needed INTEGER, -- Points needed for next tier
    tier_expiry_date DATE, -- When tier expires if maintenance not met
    
    -- Spending Tracking
    total_spending DECIMAL(12,2) DEFAULT 0, -- Lifetime spending
    current_year_spending DECIMAL(12,2) DEFAULT 0, -- Spending in current year
    last_purchase_date DATE, -- Last purchase date
    
    -- Engagement Metrics
    total_visits INTEGER DEFAULT 0, -- Total clinic visits
    total_referrals INTEGER DEFAULT 0, -- Successful referrals made
    total_reviews INTEGER DEFAULT 0, -- Reviews written
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    enrollment_date DATE DEFAULT CURRENT_DATE, -- When customer joined loyalty program
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_points_activity_at TIMESTAMPTZ, -- Last points transaction
    notes TEXT,
    
    -- Constraints
    CONSTRAINT unique_customer_clinic_loyalty UNIQUE (clinic_id, customer_id),
    CONSTRAINT non_negative_points CHECK (current_points_balance >= 0)
);

-- =====================================================================================
-- Table: points_earning_rules
-- Purpose: Define rules for how beauty clinic customers earn loyalty points
-- =====================================================================================
CREATE TABLE IF NOT EXISTS points_earning_rules (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Rule Information
    rule_name VARCHAR(200) NOT NULL,
    rule_name_en VARCHAR(200),
    description TEXT,
    rule_type VARCHAR(50) NOT NULL, -- 'purchase', 'referral', 'review', 'birthday', 'signup', 'social_media', 'visit', 'custom'
    
    -- Points Calculation
    points_per_unit INTEGER, -- Fixed points per action
    points_per_baht DECIMAL(6,4), -- Points per baht spent (e.g., 0.01 = 1 point per 100 baht)
    minimum_purchase_amount DECIMAL(10,2), -- Minimum purchase to earn points
    maximum_points_per_transaction INTEGER, -- Cap on points per transaction
    
    -- Applicability
    applies_to VARCHAR(50) DEFAULT 'all', -- 'all', 'services', 'products', 'specific_items'
    applicable_service_ids UUID[], -- Array of service IDs
    applicable_product_ids UUID[], -- Array of product IDs
    applicable_category_ids UUID[], -- Array of category IDs
    tier_specific UUID[], -- Array of tier IDs (empty = all tiers)
    
    -- Timing & Validity
    valid_from DATE,
    valid_until DATE,
    valid_days_of_week INTEGER[], -- [1,2,3,4,5,6,7] for Mon-Sun
    valid_time_ranges JSONB, -- [{"start": "09:00", "end": "12:00"}]
    
    -- Restrictions
    max_uses_per_customer INTEGER, -- Maximum times a customer can use this rule
    max_uses_per_day INTEGER, -- Maximum uses per day
    cooldown_period_days INTEGER, -- Days before rule can be used again
    requires_verified_customer BOOLEAN DEFAULT false,
    branch_ids UUID[], -- Applicable branches (empty = all branches)
    
    -- Special Conditions
    multiplier_conditions JSONB, -- Conditions for point multipliers
    bonus_points_conditions JSONB, -- Conditions for bonus points
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher priority rules evaluated first
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    notes TEXT
);

-- =====================================================================================
-- Table: rewards_catalog
-- Purpose: Catalog of rewards beauty clinic customers can redeem with points
-- =====================================================================================
CREATE TABLE IF NOT EXISTS rewards_catalog (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    
    -- Reward Information
    reward_name VARCHAR(200) NOT NULL,
    reward_name_en VARCHAR(200),
    description TEXT,
    description_en TEXT,
    reward_type VARCHAR(50) NOT NULL, -- 'service_discount', 'product_discount', 'free_service', 'free_product', 'voucher', 'gift', 'upgrade'
    
    -- Points Cost
    points_required INTEGER NOT NULL,
    
    -- Reward Details
    discount_percentage DECIMAL(5,2), -- For discount rewards
    discount_amount DECIMAL(10,2), -- Fixed discount amount
    free_service_id UUID REFERENCES services(id), -- For free service rewards
    free_product_id UUID REFERENCES products(id), -- For free product rewards
    voucher_code_prefix VARCHAR(50), -- Prefix for generated voucher codes
    voucher_value DECIMAL(10,2), -- Value of voucher
    
    -- Availability
    stock_quantity INTEGER, -- Available quantity (NULL = unlimited)
    current_stock INTEGER, -- Current stock level
    total_redeemed INTEGER DEFAULT 0, -- Total times redeemed
    
    -- Restrictions
    min_tier_required UUID REFERENCES loyalty_tiers(id), -- Minimum tier to redeem
    max_redemptions_per_customer INTEGER, -- Limit per customer
    requires_minimum_purchase DECIMAL(10,2), -- Minimum purchase when redeeming
    valid_from DATE,
    valid_until DATE,
    expiry_days_after_redemption INTEGER, -- Days until reward expires after redemption
    branch_ids UUID[], -- Applicable branches
    
    -- Display
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[], -- For categorization and filtering
    
    -- Terms
    terms_and_conditions TEXT,
    terms_and_conditions_en TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true, -- Can be temporarily unavailable
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user_id UUID REFERENCES users(id),
    notes TEXT,
    
    -- Constraints
    CONSTRAINT valid_points_required CHECK (points_required > 0),
    CONSTRAINT valid_stock CHECK (current_stock >= 0)
);

-- =====================================================================================
-- Table: points_transactions
-- Purpose: Track all points earning and spending for beauty clinic customers
-- =====================================================================================
CREATE TABLE IF NOT EXISTS points_transactions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    earning_rule_id UUID REFERENCES points_earning_rules(id),
    reward_id UUID REFERENCES rewards_catalog(id),
    booking_id UUID REFERENCES bookings(id),
    order_id UUID, -- Reference to product orders if applicable
    
    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL, -- 'earn', 'redeem', 'expire', 'adjustment', 'refund', 'bonus'
    points_amount INTEGER NOT NULL, -- Positive for earning, negative for spending
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    
    -- Context
    description TEXT, -- Transaction description
    reference_number VARCHAR(100), -- External reference number
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- For Earned Points
    source VARCHAR(100), -- 'purchase', 'referral', 'review', 'birthday', 'bonus', 'manual'
    purchase_amount DECIMAL(10,2), -- Related purchase amount
    
    -- For Redeemed Points
    redeemed_for TEXT, -- Description of what points were redeemed for
    voucher_code VARCHAR(100), -- Generated voucher code if applicable
    
    -- Expiration
    expires_at DATE, -- When these points expire
    expired BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'cancelled', 'refunded', 'expired'
    approved_at TIMESTAMPTZ,
    approved_by_user_id UUID REFERENCES users(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    branch_id UUID REFERENCES branches(id),
    processed_by_user_id UUID REFERENCES users(id),
    notes TEXT,
    
    -- Constraints
    CONSTRAINT valid_balance_calculation CHECK (balance_after = balance_before + points_amount)
);

-- =====================================================================================
-- Table: reward_redemptions
-- Purpose: Track reward redemptions by beauty clinic customers
-- =====================================================================================
CREATE TABLE IF NOT EXISTS reward_redemptions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES rewards_catalog(id),
    points_transaction_id UUID REFERENCES points_transactions(id),
    
    -- Redemption Details
    points_spent INTEGER NOT NULL,
    redemption_date TIMESTAMPTZ DEFAULT NOW(),
    
    -- Reward Details
    reward_code VARCHAR(100), -- Generated reward/voucher code
    reward_value DECIMAL(10,2), -- Value of the reward
    
    -- Usage
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    used_in_booking_id UUID REFERENCES bookings(id),
    used_in_order_id UUID,
    
    -- Validity
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    expires_at DATE,
    expired BOOLEAN DEFAULT false,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'used', 'expired', 'cancelled', 'refunded'
    cancelled_at TIMESTAMPTZ,
    cancelled_reason TEXT,
    refunded_at TIMESTAMPTZ,
    
    -- Metadata
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    
    -- Constraints
    CONSTRAINT valid_points_spent CHECK (points_spent > 0)
);

-- =====================================================================================
-- Table: tier_progression_history
-- Purpose: Track customer tier level changes in beauty clinic loyalty program
-- =====================================================================================
CREATE TABLE IF NOT EXISTS tier_progression_history (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_tier_id UUID REFERENCES loyalty_tiers(id),
    to_tier_id UUID NOT NULL REFERENCES loyalty_tiers(id),
    
    -- Progression Details
    progression_type VARCHAR(50) NOT NULL, -- 'upgrade', 'downgrade', 'initial', 'renewal', 'expiration'
    progression_date TIMESTAMPTZ DEFAULT NOW(),
    points_at_progression INTEGER,
    spending_at_progression DECIMAL(12,2),
    
    -- Reason
    reason TEXT, -- Why tier changed
    triggered_by VARCHAR(100), -- What triggered the change
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- =====================================================================================
-- Indexes for Performance Optimization
-- =====================================================================================

-- loyalty_tiers indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_clinic_id ON loyalty_tiers(clinic_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_tier_level ON loyalty_tiers(tier_level);
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_active ON loyalty_tiers(is_active) WHERE is_active = true;

-- customer_loyalty_status indexes
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_status_clinic_id ON customer_loyalty_status(clinic_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_status_customer_id ON customer_loyalty_status(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_status_tier_id ON customer_loyalty_status(current_tier_id);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_status_points ON customer_loyalty_status(current_points_balance);
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_status_active ON customer_loyalty_status(is_active) WHERE is_active = true;

-- points_earning_rules indexes
CREATE INDEX IF NOT EXISTS idx_points_earning_rules_clinic_id ON points_earning_rules(clinic_id);
CREATE INDEX IF NOT EXISTS idx_points_earning_rules_rule_type ON points_earning_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_points_earning_rules_active ON points_earning_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_points_earning_rules_validity ON points_earning_rules(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_points_earning_rules_priority ON points_earning_rules(priority DESC);

-- rewards_catalog indexes
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_clinic_id ON rewards_catalog(clinic_id);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_reward_type ON rewards_catalog(reward_type);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_points_required ON rewards_catalog(points_required);
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_active ON rewards_catalog(is_active, is_available) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_featured ON rewards_catalog(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_rewards_catalog_min_tier ON rewards_catalog(min_tier_required);

-- points_transactions indexes
CREATE INDEX IF NOT EXISTS idx_points_transactions_clinic_id ON points_transactions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_customer_id ON points_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_transaction_date ON points_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_status ON points_transactions(status);
CREATE INDEX IF NOT EXISTS idx_points_transactions_expires_at ON points_transactions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_points_transactions_booking_id ON points_transactions(booking_id) WHERE booking_id IS NOT NULL;

-- reward_redemptions indexes
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_clinic_id ON reward_redemptions(clinic_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_customer_id ON reward_redemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_reward_id ON reward_redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_redemption_date ON reward_redemptions(redemption_date DESC);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_expires_at ON reward_redemptions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_code ON reward_redemptions(reward_code) WHERE reward_code IS NOT NULL;

-- tier_progression_history indexes
CREATE INDEX IF NOT EXISTS idx_tier_progression_history_clinic_id ON tier_progression_history(clinic_id);
CREATE INDEX IF NOT EXISTS idx_tier_progression_history_customer_id ON tier_progression_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_tier_progression_history_progression_date ON tier_progression_history(progression_date DESC);
CREATE INDEX IF NOT EXISTS idx_tier_progression_history_to_tier ON tier_progression_history(to_tier_id);

-- =====================================================================================
-- Row Level Security (RLS) Policies
-- =====================================================================================

-- Enable RLS
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_earning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_progression_history ENABLE ROW LEVEL SECURITY;

-- loyalty_tiers policies
CREATE POLICY loyalty_tiers_select_policy ON loyalty_tiers FOR SELECT
    USING (true); -- Public can view tier levels

CREATE POLICY loyalty_tiers_insert_policy ON loyalty_tiers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = loyalty_tiers.clinic_id
            AND users.role IN ('admin', 'owner', 'manager')
        )
    );

CREATE POLICY loyalty_tiers_update_policy ON loyalty_tiers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = loyalty_tiers.clinic_id
            AND users.role IN ('admin', 'owner', 'manager')
        )
    );

-- customer_loyalty_status policies
CREATE POLICY customer_loyalty_status_select_policy ON customer_loyalty_status FOR SELECT
    USING (
        customer_id = auth.uid() -- Customers view their own loyalty status
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = customer_loyalty_status.clinic_id
            AND users.role IN ('admin', 'owner', 'manager', 'staff', 'receptionist')
        )
    );

CREATE POLICY customer_loyalty_status_insert_policy ON customer_loyalty_status FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = customer_loyalty_status.clinic_id
            AND users.role IN ('admin', 'owner', 'manager', 'staff')
        )
    );

CREATE POLICY customer_loyalty_status_update_policy ON customer_loyalty_status FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = customer_loyalty_status.clinic_id
            AND users.role IN ('admin', 'owner', 'manager', 'staff')
        )
    );

-- points_earning_rules policies
CREATE POLICY points_earning_rules_select_policy ON points_earning_rules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = points_earning_rules.clinic_id
        )
    );

CREATE POLICY points_earning_rules_manage_policy ON points_earning_rules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = points_earning_rules.clinic_id
            AND users.role IN ('admin', 'owner', 'manager')
        )
    );

-- rewards_catalog policies
CREATE POLICY rewards_catalog_select_policy ON rewards_catalog FOR SELECT
    USING (
        is_active = true -- Active rewards are public
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = rewards_catalog.clinic_id
            AND users.role IN ('admin', 'owner', 'manager', 'staff')
        )
    );

CREATE POLICY rewards_catalog_manage_policy ON rewards_catalog FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = rewards_catalog.clinic_id
            AND users.role IN ('admin', 'owner', 'manager')
        )
    );

-- points_transactions policies
CREATE POLICY points_transactions_select_policy ON points_transactions FOR SELECT
    USING (
        customer_id = auth.uid() -- Customers view their own transactions
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = points_transactions.clinic_id
            AND users.role IN ('admin', 'owner', 'manager', 'staff', 'receptionist')
        )
    );

CREATE POLICY points_transactions_insert_policy ON points_transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = points_transactions.clinic_id
            AND users.role IN ('admin', 'owner', 'manager', 'staff')
        )
    );

-- reward_redemptions policies
CREATE POLICY reward_redemptions_select_policy ON reward_redemptions FOR SELECT
    USING (
        customer_id = auth.uid() -- Customers view their own redemptions
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = reward_redemptions.clinic_id
            AND users.role IN ('admin', 'owner', 'manager', 'staff', 'receptionist')
        )
    );

CREATE POLICY reward_redemptions_insert_policy ON reward_redemptions FOR INSERT
    WITH CHECK (
        customer_id = auth.uid() -- Customers can redeem rewards
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = reward_redemptions.clinic_id
            AND users.role IN ('admin', 'owner', 'manager', 'staff')
        )
    );

CREATE POLICY reward_redemptions_update_policy ON reward_redemptions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = reward_redemptions.clinic_id
            AND users.role IN ('admin', 'owner', 'manager', 'staff')
        )
    );

-- tier_progression_history policies
CREATE POLICY tier_progression_history_select_policy ON tier_progression_history FOR SELECT
    USING (
        customer_id = auth.uid() -- Customers view their own tier history
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.clinic_id = tier_progression_history.clinic_id
            AND users.role IN ('admin', 'owner', 'manager', 'staff')
        )
    );

-- =====================================================================================
-- Functions
-- =====================================================================================

-- Function: Calculate points for a purchase
CREATE OR REPLACE FUNCTION calculate_points_for_purchase(
    p_clinic_id UUID,
    p_customer_id UUID,
    p_purchase_amount DECIMAL,
    p_service_ids UUID[] DEFAULT NULL,
    p_product_ids UUID[] DEFAULT NULL,
    p_branch_id UUID DEFAULT NULL
)
RETURNS TABLE (
    total_points INTEGER,
    applicable_rules JSONB
) AS $$
DECLARE
    v_customer_tier_id UUID;
    v_tier_multiplier DECIMAL;
    v_rule RECORD;
    v_calculated_points INTEGER := 0;
    v_rules_applied JSONB := '[]'::JSONB;
    v_rule_points INTEGER;
BEGIN
    -- Get customer's current tier and multiplier
    SELECT current_tier_id INTO v_customer_tier_id
    FROM customer_loyalty_status
    WHERE clinic_id = p_clinic_id AND customer_id = p_customer_id;
    
    SELECT COALESCE(points_multiplier, 1.00) INTO v_tier_multiplier
    FROM loyalty_tiers
    WHERE id = v_customer_tier_id;
    
    IF v_tier_multiplier IS NULL THEN
        v_tier_multiplier := 1.00;
    END IF;
    
    -- Find applicable earning rules
    FOR v_rule IN
        SELECT * FROM points_earning_rules
        WHERE clinic_id = p_clinic_id
        AND is_active = true
        AND rule_type IN ('purchase', 'custom')
        AND (valid_from IS NULL OR valid_from <= CURRENT_DATE)
        AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
        AND (minimum_purchase_amount IS NULL OR p_purchase_amount >= minimum_purchase_amount)
        AND (tier_specific IS NULL OR tier_specific = '{}' OR v_customer_tier_id = ANY(tier_specific))
        AND (branch_ids IS NULL OR branch_ids = '{}' OR p_branch_id = ANY(branch_ids))
        ORDER BY priority DESC
    LOOP
        v_rule_points := 0;
        
        -- Calculate points based on rule type
        IF v_rule.points_per_baht IS NOT NULL THEN
            v_rule_points := FLOOR(p_purchase_amount * v_rule.points_per_baht);
        ELSIF v_rule.points_per_unit IS NOT NULL THEN
            v_rule_points := v_rule.points_per_unit;
        END IF;
        
        -- Apply tier multiplier
        v_rule_points := FLOOR(v_rule_points * v_tier_multiplier);
        
        -- Apply maximum cap if specified
        IF v_rule.maximum_points_per_transaction IS NOT NULL THEN
            v_rule_points := LEAST(v_rule_points, v_rule.maximum_points_per_transaction);
        END IF;
        
        -- Add to total
        v_calculated_points := v_calculated_points + v_rule_points;
        
        -- Track applied rule
        v_rules_applied := v_rules_applied || jsonb_build_object(
            'rule_id', v_rule.id,
            'rule_name', v_rule.rule_name,
            'points', v_rule_points
        );
    END LOOP;
    
    RETURN QUERY SELECT v_calculated_points, v_rules_applied;
END;
$$ LANGUAGE plpgsql;

-- Function: Award points to customer
CREATE OR REPLACE FUNCTION award_loyalty_points(
    p_clinic_id UUID,
    p_customer_id UUID,
    p_points_amount INTEGER,
    p_transaction_type VARCHAR DEFAULT 'earn',
    p_source VARCHAR DEFAULT 'purchase',
    p_description TEXT DEFAULT NULL,
    p_booking_id UUID DEFAULT NULL,
    p_earning_rule_id UUID DEFAULT NULL,
    p_expires_in_days INTEGER DEFAULT 365
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_expires_at DATE;
BEGIN
    -- Get current balance
    SELECT COALESCE(current_points_balance, 0) INTO v_current_balance
    FROM customer_loyalty_status
    WHERE clinic_id = p_clinic_id AND customer_id = p_customer_id;
    
    IF v_current_balance IS NULL THEN
        v_current_balance := 0;
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_current_balance + p_points_amount;
    
    -- Set expiration date
    IF p_expires_in_days IS NOT NULL THEN
        v_expires_at := CURRENT_DATE + p_expires_in_days;
    END IF;
    
    -- Create transaction record
    INSERT INTO points_transactions (
        clinic_id,
        customer_id,
        transaction_type,
        points_amount,
        balance_before,
        balance_after,
        source,
        description,
        booking_id,
        earning_rule_id,
        expires_at,
        status
    ) VALUES (
        p_clinic_id,
        p_customer_id,
        p_transaction_type,
        p_points_amount,
        v_current_balance,
        v_new_balance,
        p_source,
        p_description,
        p_booking_id,
        p_earning_rule_id,
        v_expires_at,
        'completed'
    ) RETURNING id INTO v_transaction_id;
    
    -- Update customer loyalty status
    UPDATE customer_loyalty_status
    SET 
        total_points_earned = total_points_earned + p_points_amount,
        current_points_balance = v_new_balance,
        last_points_activity_at = NOW(),
        updated_at = NOW()
    WHERE clinic_id = p_clinic_id AND customer_id = p_customer_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Redeem points for reward
CREATE OR REPLACE FUNCTION redeem_loyalty_reward(
    p_clinic_id UUID,
    p_customer_id UUID,
    p_reward_id UUID,
    p_branch_id UUID DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    redemption_id UUID,
    reward_code VARCHAR,
    error_message TEXT
) AS $$
DECLARE
    v_reward RECORD;
    v_customer_status RECORD;
    v_redemption_id UUID;
    v_transaction_id UUID;
    v_reward_code VARCHAR;
    v_new_balance INTEGER;
BEGIN
    -- Get reward details
    SELECT * INTO v_reward
    FROM rewards_catalog
    WHERE id = p_reward_id AND clinic_id = p_clinic_id AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, 'Reward not found or inactive'::TEXT;
        RETURN;
    END IF;
    
    -- Get customer loyalty status
    SELECT * INTO v_customer_status
    FROM customer_loyalty_status
    WHERE clinic_id = p_clinic_id AND customer_id = p_customer_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, 'Customer not enrolled in loyalty program'::TEXT;
        RETURN;
    END IF;
    
    -- Check if customer has enough points
    IF v_customer_status.current_points_balance < v_reward.points_required THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, 'Insufficient points'::TEXT;
        RETURN;
    END IF;
    
    -- Check stock if applicable
    IF v_reward.current_stock IS NOT NULL AND v_reward.current_stock <= 0 THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, 'Reward out of stock'::TEXT;
        RETURN;
    END IF;
    
    -- Generate reward code
    v_reward_code := UPPER(
        COALESCE(v_reward.voucher_code_prefix, 'RWD') || 
        '-' || 
        TO_CHAR(NOW(), 'YYYYMMDD') || 
        '-' || 
        SUBSTRING(gen_random_uuid()::TEXT, 1, 8)
    );
    
    -- Calculate new balance
    v_new_balance := v_customer_status.current_points_balance - v_reward.points_required;
    
    -- Create points transaction (negative for redemption)
    INSERT INTO points_transactions (
        clinic_id,
        customer_id,
        reward_id,
        transaction_type,
        points_amount,
        balance_before,
        balance_after,
        description,
        redeemed_for,
        voucher_code,
        status
    ) VALUES (
        p_clinic_id,
        p_customer_id,
        p_reward_id,
        'redeem',
        -v_reward.points_required,
        v_customer_status.current_points_balance,
        v_new_balance,
        'Redeemed: ' || v_reward.reward_name,
        v_reward.reward_name,
        v_reward_code,
        'completed'
    ) RETURNING id INTO v_transaction_id;
    
    -- Create redemption record
    INSERT INTO reward_redemptions (
        clinic_id,
        customer_id,
        reward_id,
        points_transaction_id,
        points_spent,
        reward_code,
        reward_value,
        expires_at,
        branch_id
    ) VALUES (
        p_clinic_id,
        p_customer_id,
        p_reward_id,
        v_transaction_id,
        v_reward.points_required,
        v_reward_code,
        COALESCE(v_reward.voucher_value, v_reward.discount_amount),
        CASE 
            WHEN v_reward.expiry_days_after_redemption IS NOT NULL 
            THEN CURRENT_DATE + v_reward.expiry_days_after_redemption
            ELSE NULL
        END,
        p_branch_id
    ) RETURNING id INTO v_redemption_id;
    
    -- Update customer loyalty status
    UPDATE customer_loyalty_status
    SET 
        total_points_spent = total_points_spent + v_reward.points_required,
        current_points_balance = v_new_balance,
        last_points_activity_at = NOW(),
        updated_at = NOW()
    WHERE clinic_id = p_clinic_id AND customer_id = p_customer_id;
    
    -- Update reward stock
    IF v_reward.current_stock IS NOT NULL THEN
        UPDATE rewards_catalog
        SET 
            current_stock = current_stock - 1,
            total_redeemed = total_redeemed + 1
        WHERE id = p_reward_id;
    ELSE
        UPDATE rewards_catalog
        SET total_redeemed = total_redeemed + 1
        WHERE id = p_reward_id;
    END IF;
    
    RETURN QUERY SELECT true, v_redemption_id, v_reward_code, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- Triggers
-- =====================================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_loyalty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER loyalty_tiers_updated_at BEFORE UPDATE ON loyalty_tiers
    FOR EACH ROW EXECUTE FUNCTION update_loyalty_updated_at();

CREATE TRIGGER customer_loyalty_status_updated_at BEFORE UPDATE ON customer_loyalty_status
    FOR EACH ROW EXECUTE FUNCTION update_loyalty_updated_at();

CREATE TRIGGER points_earning_rules_updated_at BEFORE UPDATE ON points_earning_rules
    FOR EACH ROW EXECUTE FUNCTION update_loyalty_updated_at();

CREATE TRIGGER rewards_catalog_updated_at BEFORE UPDATE ON rewards_catalog
    FOR EACH ROW EXECUTE FUNCTION update_loyalty_updated_at();

CREATE TRIGGER reward_redemptions_updated_at BEFORE UPDATE ON reward_redemptions
    FOR EACH ROW EXECUTE FUNCTION update_loyalty_updated_at();

-- =====================================================================================
-- Sample Data (conditional on clinic existence)
-- =====================================================================================

DO $$
DECLARE
    v_clinic_id UUID;
    v_tier_bronze_id UUID;
    v_tier_silver_id UUID;
    v_tier_gold_id UUID;
    v_tier_platinum_id UUID;
BEGIN
    -- Get first clinic (for demo purposes)
    SELECT id INTO v_clinic_id FROM clinics LIMIT 1;
    
    IF v_clinic_id IS NOT NULL THEN
        -- Insert loyalty tiers
        INSERT INTO loyalty_tiers (clinic_id, tier_name, tier_name_en, tier_level, tier_color, min_points_required, points_multiplier, discount_percentage, birthday_bonus_points, display_order)
        VALUES 
            (v_clinic_id, 'สมาชิกบรอนซ์', 'Bronze Member', 1, '#CD7F32', 0, 1.00, 0, 100, 1),
            (v_clinic_id, 'สมาชิกซิลเวอร์', 'Silver Member', 2, '#C0C0C0', 500, 1.25, 5, 200, 2),
            (v_clinic_id, 'สมาชิกโกลด์', 'Gold Member', 3, '#FFD700', 2000, 1.50, 10, 500, 3),
            (v_clinic_id, 'สมาชิกแพลทินัม', 'Platinum Member', 4, '#E5E4E2', 5000, 2.00, 15, 1000, 4)
        RETURNING id INTO v_tier_bronze_id;
        
        -- Get tier IDs
        SELECT id INTO v_tier_silver_id FROM loyalty_tiers WHERE clinic_id = v_clinic_id AND tier_level = 2;
        SELECT id INTO v_tier_gold_id FROM loyalty_tiers WHERE clinic_id = v_clinic_id AND tier_level = 3;
        SELECT id INTO v_tier_platinum_id FROM loyalty_tiers WHERE clinic_id = v_clinic_id AND tier_level = 4;
        
        -- Insert sample points earning rules
        INSERT INTO points_earning_rules (clinic_id, rule_name, rule_name_en, rule_type, points_per_baht, is_active)
        VALUES 
            (v_clinic_id, 'คะแนนจากการซื้อบริการ', 'Points from Service Purchase', 'purchase', 0.01, true),
            (v_clinic_id, 'โบนัสวันเกิด', 'Birthday Bonus', 'birthday', 500, true),
            (v_clinic_id, 'คะแนนจากการแนะนำเพื่อน', 'Referral Points', 'referral', 1000, true);
        
        -- Insert sample rewards
        INSERT INTO rewards_catalog (clinic_id, reward_name, reward_name_en, reward_type, points_required, discount_percentage, is_active)
        VALUES 
            (v_clinic_id, 'ส่วนลด 10% สำหรับบริการทุกประเภท', '10% Discount on All Services', 'service_discount', 500, 10, true),
            (v_clinic_id, 'ส่วนลด 100 บาท', '100 THB Discount Voucher', 'voucher', 1000, NULL, true),
            (v_clinic_id, 'บริการฟรี: ทำความสะอาดผิวหน้า', 'Free Service: Facial Cleaning', 'free_service', 2000, NULL, true);
    END IF;
END $$;

-- =====================================================================================
-- End of Migration
-- =====================================================================================
