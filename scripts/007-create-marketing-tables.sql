CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted')),
  reason TEXT,
  reference_id UUID,
  reference_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'points')),
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2),
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  segment_filter JSONB,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error_message TEXT
);

-- Indexes
CREATE INDEX idx_loyalty_points_customer ON loyalty_points(customer_id);
CREATE INDEX idx_loyalty_transactions_customer ON loyalty_transactions(customer_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_code_usage_customer ON promo_code_usage(customer_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaign_recipients_campaign ON email_campaign_recipients(campaign_id);

-- RLS Policies
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Customers can view their own loyalty data
CREATE POLICY "Customers can view own loyalty points"
  ON loyalty_points FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can view own loyalty transactions"
  ON loyalty_transactions FOR SELECT
  USING (customer_id = auth.uid());

-- Staff can view all loyalty data
CREATE POLICY "Staff can view all loyalty points"
  ON loyalty_points FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'clinic_staff', 'sales_staff')
    )
  );

-- Staff can manage loyalty points
CREATE POLICY "Staff can manage loyalty points"
  ON loyalty_points FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'clinic_staff')
    )
  );

-- Everyone can view active promo codes
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  USING (active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- Staff can manage promo codes
CREATE POLICY "Staff can manage promo codes"
  ON promo_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'sales_staff')
    )
  );

-- Staff can manage campaigns
CREATE POLICY "Staff can manage campaigns"
  ON email_campaigns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'sales_staff')
    )
  );

-- Function to update loyalty tier based on points
CREATE OR REPLACE FUNCTION update_loyalty_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lifetime_points >= 10000 THEN
    NEW.tier := 'platinum';
  ELSIF NEW.lifetime_points >= 5000 THEN
    NEW.tier := 'gold';
  ELSIF NEW.lifetime_points >= 2000 THEN
    NEW.tier := 'silver';
  ELSE
    NEW.tier := 'bronze';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loyalty_tier_trigger
  BEFORE UPDATE OF lifetime_points ON loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_tier();

-- Function to award points for bookings
CREATE OR REPLACE FUNCTION award_booking_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
  customer_loyalty_id UUID;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Award 1 point per dollar spent
    points_to_award := FLOOR(NEW.total_price);
    
    -- Get or create loyalty record
    INSERT INTO loyalty_points (customer_id, points, lifetime_points)
    VALUES (NEW.customer_id, points_to_award, points_to_award)
    ON CONFLICT (customer_id) DO UPDATE
    SET points = loyalty_points.points + points_to_award,
        lifetime_points = loyalty_points.lifetime_points + points_to_award
    RETURNING id INTO customer_loyalty_id;
    
    -- Record transaction
    INSERT INTO loyalty_transactions (customer_id, points, type, reason, reference_id, reference_type)
    VALUES (NEW.customer_id, points_to_award, 'earned', 'Booking completed', NEW.id, 'booking');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER award_booking_points_trigger
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION award_booking_points();
