-- AI Usage Tracking for Rate Limits and Cost Control
-- Tracks AI API usage per clinic to enforce subscription limits

-- Create ai_usage table
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  provider TEXT NOT NULL, -- 'gemini', 'openai', 'anthropic', 'huggingface'
  model TEXT NOT NULL, -- 'gemini-1.5-flash', 'gpt-4o-mini', etc.
  usage_type TEXT NOT NULL, -- 'skin_analysis', 'chat', 'recommendation'
  request_count INTEGER DEFAULT 1,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 4) DEFAULT 0.0000, -- Cost in USD
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT ai_usage_clinic_date_unique UNIQUE (clinic_id, date, provider, model)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_clinic_date ON public.ai_usage(clinic_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_clinic_month ON public.ai_usage(clinic_id, date_trunc('month', date) DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON public.ai_usage(user_id, date DESC);

-- Create function to check and update usage
CREATE OR REPLACE FUNCTION public.check_ai_usage_limit(
  p_clinic_id UUID,
  p_provider TEXT,
  p_model TEXT,
  p_daily_limit INTEGER DEFAULT NULL
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_usage INTEGER,
  remaining INTEGER,
  daily_limit INTEGER
) AS $$
DECLARE
  v_current_usage INTEGER;
  v_daily_limit INTEGER;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get clinic's daily limit from subscription or use parameter
  SELECT 
    COALESCE(p_daily_limit, 
      CASE 
        WHEN pp.price_amount >= 899000 THEN 1000  -- Enterprise
        WHEN pp.price_amount >= 499000 THEN 500   -- Professional
        ELSE 150  -- Starter
      END
    ) INTO v_daily_limit
  FROM clinics c
  JOIN subscriptions s ON s.clinic_id = c.id
  JOIN pricing_plans pp ON pp.id = s.plan_id
  WHERE c.id = p_clinic_id AND s.status = 'active';
  
  -- If no active subscription, use default limit
  IF v_daily_limit IS NULL THEN
    v_daily_limit := COALESCE(p_daily_limit, 150);
  END IF;
  
  -- Get current usage for today
  SELECT COALESCE(SUM(request_count), 0)
  INTO v_current_usage
  FROM ai_usage
  WHERE clinic_id = p_clinic_id
    AND date = v_today
    AND provider = p_provider
    AND model = p_model;
  
  -- Return result
  RETURN QUERY SELECT 
    v_current_usage < v_daily_limit AS allowed,
    v_current_usage AS current_usage,
    GREATEST(v_daily_limit - v_current_usage - 1, 0) AS remaining,
    v_daily_limit AS daily_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log AI usage
CREATE OR REPLACE FUNCTION public.log_ai_usage(
  p_clinic_id UUID,
  p_user_id UUID,
  p_provider TEXT,
  p_model TEXT,
  p_usage_type TEXT,
  p_tokens_used INTEGER DEFAULT 0,
  p_cost_usd DECIMAL(10, 4) DEFAULT 0.0000
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.ai_usage (
    clinic_id, user_id, date, provider, model, usage_type,
    tokens_used, cost_usd, request_count
  ) VALUES (
    p_clinic_id, p_user_id, CURRENT_DATE, p_provider, p_model, p_usage_type,
    p_tokens_used, p_cost_usd, 1
  )
  ON CONFLICT (clinic_id, date, provider, model)
  DO UPDATE SET
    request_count = ai_usage.request_count + 1,
    tokens_used = ai_usage.tokens_used + p_tokens_used,
    cost_usd = ai_usage.cost_usd + p_cost_usd,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Clinics can view own AI usage" ON public.ai_usage;
CREATE POLICY "Clinics can view own AI usage"
  ON public.ai_usage
  FOR SELECT
  USING (
    is_super_admin()
    OR
    clinic_id = get_user_clinic_id()
  );

DROP POLICY IF EXISTS "Service role can manage AI usage" ON public.ai_usage;
CREATE POLICY "Service role can manage AI usage"
  ON public.ai_usage
  FOR ALL
  USING (auth.role() = 'service_role');

-- Grant permissions
GRANT SELECT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
GRANT EXECUTE ON FUNCTION public.check_ai_usage_limit TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_ai_usage TO service_role;
