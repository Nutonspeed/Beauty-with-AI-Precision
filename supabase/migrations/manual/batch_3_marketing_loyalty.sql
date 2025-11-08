-- ===================================
-- BATCH 3: MARKETING + LOYALTY (Simplified)
-- Tasks 18-19
-- Note: Simplified version - core tables only
-- ===================================

BEGIN;

-- ===================================
-- TASK 18: MARKETING & PROMO SYSTEM
-- ===================================

DROP TABLE IF EXISTS campaign_performance CASCADE;
DROP TABLE IF EXISTS promo_code_usage CASCADE;
DROP TABLE IF EXISTS campaign_customers CASCADE;
DROP TABLE IF EXISTS customer_segments CASCADE;
DROP TABLE IF EXISTS promo_codes CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;

-- 1. Marketing Campaigns Table
CREATE TABLE marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_code VARCHAR(50) UNIQUE NOT NULL,
    campaign_name VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    target_audience JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    total_budget DECIMAL(12,2),
    spent_budget DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Promo Codes Table
CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    code_type VARCHAR(50) NOT NULL,
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    max_discount_amount DECIMAL(10,2),
    min_purchase_amount DECIMAL(10,2) DEFAULT 0,
    max_total_uses INTEGER,
    max_uses_per_customer INTEGER DEFAULT 1,
    current_total_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Promo Code Usage Table
CREATE TABLE promo_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    final_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'applied',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Customer Segments Table
CREATE TABLE customer_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_name VARCHAR(200) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL,
    customer_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Campaign Customers Table
CREATE TABLE campaign_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES customer_segments(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_campaign_customer UNIQUE (campaign_id, customer_id)
);

-- 6. Campaign Performance Table
CREATE TABLE campaign_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_converted INTEGER DEFAULT 0,
    revenue_generated DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_campaign_date UNIQUE (campaign_id, date)
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_code_usage_customer ON promo_code_usage(customer_id);
CREATE INDEX idx_campaign_customers_campaign ON campaign_customers(campaign_id);

-- Enable RLS
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access marketing_campaigns" ON marketing_campaigns FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access promo_codes" ON promo_codes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access promo_code_usage" ON promo_code_usage FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access customer_segments" ON customer_segments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access campaign_customers" ON campaign_customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access campaign_performance" ON campaign_performance FOR ALL USING (auth.role() = 'service_role');

-- ===================================
-- TASK 19: LOYALTY POINTS SYSTEM
-- ===================================

DROP TABLE IF EXISTS loyalty_reward_redemptions CASCADE;
DROP TABLE IF EXISTS loyalty_rewards CASCADE;
DROP TABLE IF EXISTS points_transactions CASCADE;
DROP TABLE IF EXISTS points_earning_rules CASCADE;
DROP TABLE IF EXISTS customer_loyalty_status CASCADE;
DROP TABLE IF EXISTS loyalty_tiers CASCADE;

-- 1. Loyalty Tiers Table
CREATE TABLE loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_name VARCHAR(100) NOT NULL,
    tier_level INTEGER NOT NULL,
    min_points_required INTEGER NOT NULL DEFAULT 0,
    points_multiplier DECIMAL(4,2) DEFAULT 1.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    benefits_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_tier_level UNIQUE (tier_level),
    CONSTRAINT valid_tier_level CHECK (tier_level > 0)
);

-- Insert default tiers
INSERT INTO loyalty_tiers (tier_name, tier_level, min_points_required, points_multiplier, discount_percentage, benefits_description) VALUES
('Bronze', 1, 0, 1.0, 0, 'สมาชิกระดับเริ่มต้น'),
('Silver', 2, 1000, 1.2, 5, 'รับคะแนน 1.2 เท่า ส่วนลด 5%'),
('Gold', 3, 5000, 1.5, 10, 'รับคะแนน 1.5 เท่า ส่วนลด 10%'),
('Platinum', 4, 10000, 2.0, 15, 'รับคะแนน 2 เท่า ส่วนลด 15%')
ON CONFLICT (tier_level) DO NOTHING;

-- 2. Customer Loyalty Status Table
CREATE TABLE customer_loyalty_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    current_tier_id UUID REFERENCES loyalty_tiers(id),
    total_points_earned INTEGER DEFAULT 0,
    total_points_spent INTEGER DEFAULT 0,
    current_points_balance INTEGER DEFAULT 0,
    total_spending DECIMAL(12,2) DEFAULT 0,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_customer_loyalty UNIQUE (customer_id),
    CONSTRAINT non_negative_points CHECK (current_points_balance >= 0)
);

-- 3. Points Earning Rules Table
CREATE TABLE points_earning_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(200) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    points_per_unit INTEGER,
    points_per_baht DECIMAL(6,4),
    minimum_purchase_amount DECIMAL(10,2),
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rules
INSERT INTO points_earning_rules (rule_name, rule_type, points_per_unit, points_per_baht, minimum_purchase_amount) VALUES
('Purchase Points', 'purchase', NULL, 0.01, 100),
('Referral Bonus', 'referral', 500, NULL, NULL),
('Review Bonus', 'review', 100, NULL, NULL),
('Birthday Bonus', 'birthday', 200, NULL, NULL)
ON CONFLICT DO NOTHING;

-- 4. Points Transactions Table
CREATE TABLE points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL,
    points_amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    expires_at TIMESTAMPTZ,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_points_transactions_customer ON points_transactions(customer_id);
CREATE INDEX idx_points_transactions_date ON points_transactions(transaction_date DESC);

-- 5. Loyalty Rewards Table
CREATE TABLE loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reward_name VARCHAR(200) NOT NULL,
    description TEXT,
    reward_type VARCHAR(50) NOT NULL,
    points_required INTEGER NOT NULL,
    reward_value DECIMAL(10,2),
    stock_quantity INTEGER,
    available_quantity INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Loyalty Reward Redemptions Table
CREATE TABLE loyalty_reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES loyalty_rewards(id) ON DELETE RESTRICT,
    points_redeemed INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    fulfilled_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_earning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access loyalty_tiers" ON loyalty_tiers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access customer_loyalty_status" ON customer_loyalty_status FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access points_earning_rules" ON points_earning_rules FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access points_transactions" ON points_transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access loyalty_rewards" ON loyalty_rewards FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role access loyalty_reward_redemptions" ON loyalty_reward_redemptions FOR ALL USING (auth.role() = 'service_role');

COMMIT;

SELECT 'Marketing System: 6 tables created' as status
UNION ALL
SELECT 'Loyalty Points System: 6 tables created'
UNION ALL
SELECT 'Total: 12 tables created in this batch';
