CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  reward_type VARCHAR(20) DEFAULT 'points' CHECK (reward_type IN ('points', 'discount', 'credit')),
  reward_value DECIMAL(10, 2) NOT NULL,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_given BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_id);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral codes"
  ON referral_codes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own referral codes"
  ON referral_codes FOR INSERT
  WITH CHECK (user_id = auth.uid());
