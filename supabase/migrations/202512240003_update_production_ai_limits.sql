-- Update AI Rate Limits for Production
-- Adjusts limits based on real usage patterns for 5 clinics with 5-10 staff each

BEGIN;

-- Update AI usage check function to use monthly limits divided by days
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
  daily_limit INTEGER,
  monthly_limit INTEGER,
  monthly_usage INTEGER
) AS $$
DECLARE
  v_current_usage INTEGER;
  v_monthly_usage INTEGER;
  v_daily_limit INTEGER;
  v_monthly_limit INTEGER;
  v_today DATE := CURRENT_DATE;
  v_first_day DATE := date_trunc('month', v_today);
BEGIN
  -- Get clinic's limits from subscription
  SELECT 
    COALESCE(p_daily_limit, 
      CASE 
        -- B2B Plans - More realistic limits for production
        WHEN pp.price_amount >= 29900 THEN 100  -- Enterprise: 3000/month ÷ 30 days
        WHEN pp.price_amount >= 9900 THEN 50    -- Professional: 1500/month ÷ 30 days
        WHEN pp.price_amount >= 2900 THEN 20    -- Starter: 600/month ÷ 30 days
        -- B2C Plans
        WHEN pp.price_amount >= 4900 THEN 30    -- Premium: 900/month ÷ 30 days
        ELSE 1                                  -- Free: 30/month ÷ 30 days
      END
    ),
    CASE 
      -- Monthly limits
      WHEN pp.price_amount >= 29900 THEN 3000   -- Enterprise
      WHEN pp.price_amount >= 9900 THEN 1500    -- Professional
      WHEN pp.price_amount >= 2900 THEN 600     -- Starter
      WHEN pp.price_amount >= 4900 THEN 900     -- Premium
      ELSE 30                                   -- Free
    END
  INTO v_daily_limit, v_monthly_limit
  FROM clinic_subscriptions cs
  JOIN subscription_plans pp ON cs.plan_id = pp.id
  WHERE cs.clinic_id = p_clinic_id 
    AND cs.status = 'active'
    AND (cs.end_date IS NULL OR cs.end_date >= v_today);
  
  -- If no active subscription, use free limits
  IF v_daily_limit IS NULL THEN
    v_daily_limit := COALESCE(p_daily_limit, 1);
    v_monthly_limit := 30;
  END IF;
  
  -- Get today's usage
  SELECT COALESCE(SUM(request_count), 0)
  INTO v_current_usage
  FROM ai_usage
  WHERE clinic_id = p_clinic_id
    AND date = v_today;
  
  -- Get monthly usage
  SELECT COALESCE(SUM(request_count), 0)
  INTO v_monthly_usage
  FROM ai_usage
  WHERE clinic_id = p_clinic_id
    AND date >= v_first_day;
  
  -- Check both daily and monthly limits
  RETURN QUERY SELECT 
    (v_current_usage < v_daily_limit AND v_monthly_usage < v_monthly_limit) as allowed,
    v_current_usage as current_usage,
    GREATEST(v_daily_limit - v_current_usage, 0) as remaining,
    v_daily_limit as daily_limit,
    v_monthly_limit as monthly_limit,
    v_monthly_usage as monthly_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance on production queries
CREATE INDEX IF NOT EXISTS idx_users_clinic_role ON public.users(clinic_id, role);
CREATE INDEX IF NOT EXISTS idx_customers_clinic_created ON public.customers(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON public.appointments(clinic_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_leads_clinic_status ON public.sales_leads(clinic_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_proposals_clinic_created ON public.sales_proposals(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_skin_analyses_clinic_created ON public.skin_analyses(clinic_id, created_at DESC);

-- Create view for easy monitoring of clinic usage
CREATE OR REPLACE VIEW public.clinic_usage_summary AS
SELECT 
  c.id as clinic_id,
  c.name as clinic_name,
  COUNT(DISTINCT u.id) as active_users,
  COALESCE(daily_usage.today_requests, 0) as today_requests,
  COALESCE(daily_usage.daily_limit, 0) as daily_limit,
  COALESCE(monthly_usage.month_requests, 0) as month_requests,
  COALESCE(monthly_usage.monthly_limit, 0) as monthly_limit,
  cs.plan_name,
  cs.status as subscription_status
FROM clinics c
LEFT JOIN users u ON u.clinic_id = c.id AND u.status = 'active'
LEFT JOIN (
  SELECT 
    clinic_id,
    SUM(request_count) as today_requests,
    MAX(daily_limit) as daily_limit
  FROM (
    SELECT 
      au.clinic_id,
      au.request_count,
      (SELECT COALESCE(
        CASE 
          WHEN pp.price_amount >= 29900 THEN 100
          WHEN pp.price_amount >= 9900 THEN 50
          WHEN pp.price_amount >= 2900 THEN 20
          WHEN pp.price_amount >= 4900 THEN 30
          ELSE 1
        END, 1
      ) FROM clinic_subscriptions cs2 
      JOIN subscription_plans pp ON cs2.plan_id = pp.id 
      WHERE cs2.clinic_id = au.clinic_id 
        AND cs2.status = 'active'
        AND (cs2.end_date IS NULL OR cs2.end_date >= CURRENT_DATE)
      ) as daily_limit
    FROM ai_usage au 
    WHERE au.date = CURRENT_DATE
  ) daily
  GROUP BY clinic_id
) daily_usage ON daily_usage.clinic_id = c.id
LEFT JOIN (
  SELECT 
    clinic_id,
    SUM(request_count) as month_requests,
    MAX(monthly_limit) as monthly_limit
  FROM (
    SELECT 
      au.clinic_id,
      au.request_count,
      (SELECT COALESCE(
        CASE 
          WHEN pp.price_amount >= 29900 THEN 3000
          WHEN pp.price_amount >= 9900 THEN 1500
          WHEN pp.price_amount >= 2900 THEN 600
          WHEN pp.price_amount >= 4900 THEN 900
          ELSE 30
        END, 30
      ) FROM clinic_subscriptions cs2 
      JOIN subscription_plans pp ON cs2.plan_id = pp.id 
      WHERE cs2.clinic_id = au.clinic_id 
        AND cs2.status = 'active'
        AND (cs2.end_date IS NULL OR cs2.end_date >= CURRENT_DATE)
      ) as monthly_limit
    FROM ai_usage au 
    WHERE au.date >= date_trunc('month', CURRENT_DATE)
  ) monthly
  GROUP BY clinic_id
) monthly_usage ON monthly_usage.clinic_id = c.id
LEFT JOIN clinic_subscriptions cs ON cs.clinic_id = c.id 
  AND cs.status = 'active' 
  AND (cs.end_date IS NULL OR cs.end_date >= CURRENT_DATE)
LEFT JOIN subscription_plans sp ON cs.plan_id = sp.id
GROUP BY c.id, c.name, daily_usage.today_requests, daily_usage.daily_limit, 
         monthly_usage.month_requests, monthly_usage.monthly_limit, 
         cs.plan_name, cs.status;

-- Grant access to the view
GRANT SELECT ON public.clinic_usage_summary TO authenticated;
GRANT SELECT ON public.clinic_usage_summary TO service_role;

-- Add function to get clinic usage stats
CREATE OR REPLACE FUNCTION public.get_clinic_usage_stats(p_clinic_id UUID)
RETURNS TABLE (
  today_requests INTEGER,
  daily_limit INTEGER,
  month_requests INTEGER,
  monthly_limit INTEGER,
  remaining_today INTEGER,
  remaining_month INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN date = CURRENT_DATE THEN request_count ELSE 0 END), 0) as today_requests,
    COALESCE(MAX(daily_limit), 0) as daily_limit,
    COALESCE(SUM(request_count), 0) as month_requests,
    COALESCE(MAX(monthly_limit), 0) as monthly_limit,
    GREATEST(COALESCE(MAX(daily_limit), 0) - COALESCE(SUM(CASE WHEN date = CURRENT_DATE THEN request_count ELSE 0 END), 0), 0) as remaining_today,
    GREATEST(COALESCE(MAX(monthly_limit), 0) - COALESCE(SUM(request_count), 0), 0) as remaining_month
  FROM (
    SELECT 
      au.clinic_id,
      au.date,
      au.request_count,
      (SELECT COALESCE(
        CASE 
          WHEN pp.price_amount >= 29900 THEN 100
          WHEN pp.price_amount >= 9900 THEN 50
          WHEN pp.price_amount >= 2900 THEN 20
          WHEN pp.price_amount >= 4900 THEN 30
          ELSE 1
        END, 1
      ) FROM clinic_subscriptions cs2 
        JOIN subscription_plans pp ON cs2.plan_id = pp.id 
        WHERE cs2.clinic_id = au.clinic_id 
          AND cs2.status = 'active'
          AND (cs2.end_date IS NULL OR cs2.end_date >= CURRENT_DATE)
      ) as daily_limit,
      (SELECT COALESCE(
        CASE 
          WHEN pp.price_amount >= 29900 THEN 3000
          WHEN pp.price_amount >= 9900 THEN 1500
          WHEN pp.price_amount >= 2900 THEN 600
          WHEN pp.price_amount >= 4900 THEN 900
          ELSE 30
        END, 30
      ) FROM clinic_subscriptions cs2 
        JOIN subscription_plans pp ON cs2.plan_id = pp.id 
        WHERE cs2.clinic_id = au.clinic_id 
          AND cs2.status = 'active'
          AND (cs2.end_date IS NULL OR cs2.end_date >= CURRENT_DATE)
      ) as monthly_limit
    FROM ai_usage au
    WHERE au.clinic_id = p_clinic_id
      AND au.date >= date_trunc('month', CURRENT_DATE)
  ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_clinic_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_clinic_usage_stats TO service_role;

COMMIT;
