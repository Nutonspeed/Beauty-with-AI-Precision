-- ============================================================================
-- Sample Data for Revenue Analytics Testing
-- Purpose: Insert test data for subscription plans, subscriptions, invoices, and payments
-- ============================================================================

-- Insert sample clinic subscriptions
INSERT INTO public.clinic_subscriptions (clinic_id, plan_id, status, current_period_start, current_period_end, mrr, arr)
SELECT 
  c.id,
  (SELECT id FROM public.subscription_plans WHERE name = 'Professional' AND billing_interval = 'monthly' LIMIT 1),
  'active',
  NOW() - INTERVAL '30 days',
  NOW() + INTERVAL '30 days',
  4990.00,
  59880.00
FROM public.clinics c
WHERE c.name LIKE '%Beauty%'
LIMIT 3
ON CONFLICT DO NOTHING;

INSERT INTO public.clinic_subscriptions (clinic_id, plan_id, status, current_period_start, current_period_end, mrr, arr)
SELECT 
  c.id,
  (SELECT id FROM public.subscription_plans WHERE name = 'Starter' AND billing_interval = 'monthly' LIMIT 1),
  'trial',
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '23 days',
  0,
  0
FROM public.clinics c
WHERE c.name LIKE '%Clinic%'
LIMIT 2
ON CONFLICT DO NOTHING;

-- Insert sample invoices
INSERT INTO public.billing_invoices (clinic_id, subscription_id, invoice_number, status, amount_due, amount_paid, due_date, paid_at, payment_method)
SELECT 
  cs.clinic_id,
  cs.id,
  'INV-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 6, '0'),
  'paid',
  cs.mrr,
  cs.mrr,
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '14 days',
  'credit_card'
FROM public.clinic_subscriptions cs
WHERE cs.status = 'active'
LIMIT 5;

-- Insert sample payment transactions
INSERT INTO public.payment_transactions (clinic_id, invoice_id, amount, status, payment_method, transaction_id)
SELECT 
  i.clinic_id,
  i.id,
  i.amount_paid,
  'succeeded',
  i.payment_method,
  'txn_' || substr(md5(random()::text), 1, 16)
FROM public.billing_invoices i
WHERE i.status = 'paid'
LIMIT 10;

COMMENT ON TABLE public.clinic_subscriptions IS 'Sample data inserted for testing revenue analytics';
