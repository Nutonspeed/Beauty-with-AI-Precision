-- Test pricing plans after migration
SELECT 
  slug,
  name,
  plan_type,
  price_amount,
  currency,
  display_order
FROM public.subscription_plans 
ORDER BY plan_type, display_order;

-- Test view
SELECT * FROM public.subscription_plans_view LIMIT 5;

-- Test B2C plans
SELECT * FROM public.get_plans_by_type('b2c');

-- Test B2B plans
SELECT * FROM public.get_plans_by_type('b2b');

-- Test feature access
SELECT public.can_access_plan_feature('premium', 'AR Treatment Simulator');
SELECT public.can_access_plan_feature('starter', 'Advanced Reports');
