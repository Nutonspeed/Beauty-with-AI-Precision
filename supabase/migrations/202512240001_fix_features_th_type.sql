-- Fix features_th type mismatch in get_plans_by_type function
CREATE OR REPLACE FUNCTION public.get_plans_by_type(plan_type_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  price_amount DECIMAL,
  currency TEXT,
  max_users INTEGER,
  max_storage_gb INTEGER,
  features JSONB,
  metadata JSONB,
  max_customers_per_month INTEGER,
  max_analyses_per_month INTEGER,
  trial_days INTEGER,
  name_th TEXT,
  features_th JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id,
    sp.name,
    sp.slug,
    sp.price_amount,
    sp.currency,
    sp.max_users,
    sp.max_storage_gb,
    sp.features,
    sp.metadata,
    (sp.metadata->>'max_customers_per_month')::INTEGER,
    (sp.metadata->>'max_analyses_per_month')::INTEGER,
    (sp.metadata->>'trial_days')::INTEGER,
    sp.metadata->>'name_th',
    (sp.metadata->>'features_th')::JSONB  -- Cast TEXT to JSONB
  FROM public.subscription_plans sp
  WHERE sp.plan_type = plan_type_param
    AND sp.is_active = true
  ORDER BY sp.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_plans_by_type TO authenticated, anon;
