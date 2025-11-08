-- ============================================
-- Insert Sample Sales Proposals Data
-- ============================================
-- User: sales@example.com (ff95a068-eb10-4828-acc6-911a57216d7e)
-- Links to existing sales leads created in 20241108000002
-- ============================================

-- Remove existing proposals for this user to make the dataset idempotent
DELETE FROM public.sales_proposals
WHERE sales_user_id = 'ff95a068-eb10-4828-acc6-911a57216d7e';

INSERT INTO public.sales_proposals (
  id,
  lead_id,
  sales_user_id,
  clinic_id,
  title,
  description,
  status,
  treatments,
  subtotal,
  discount_percent,
  discount_amount,
  total_value,
  valid_until,
  payment_terms,
  terms_and_conditions,
  sent_at,
  viewed_at,
  first_viewed_at,
  view_count,
  accepted_at,
  rejected_at,
  rejection_reason,
  win_probability,
  metadata,
  created_at,
  updated_at
) VALUES
-- Proposal 1: Accepted VIP package
(
  gen_random_uuid(),
  (SELECT id FROM public.sales_leads WHERE name = 'ประภา มั่งมี' LIMIT 1),
  'ff95a068-eb10-4828-acc6-911a57216d7e'::uuid,
  NULL,
  'VIP Rejuvenation Package',
  'Premium anti-aging program with follow-up care.',
  'accepted'::proposal_status,
  jsonb_build_array(
    jsonb_build_object('name', 'Deluxe Botox Package', 'price', 62000, 'sessions', 1, 'description', 'High grade botox with follow-up visit'),
    jsonb_build_object('name', 'Signature Thread Lift', 'price', 52000, 'sessions', 1, 'description', 'Diamond PDO threads for cheek lift'),
    jsonb_build_object('name', 'Platinum Skin Booster', 'price', 28000, 'sessions', 3, 'description', 'Deep hydration skin boosters')
  ),
  142000.00,
  5.00,
  7100.00,
  134900.00,
  NOW() + INTERVAL '7 days',
  '50% deposit upon booking, remainder after last session.',
  'Includes six-month follow-up, touch-ups, and skincare kit.',
  NOW() - INTERVAL '6 days',
  NOW() - INTERVAL '5 days 6 hours',
  NOW() - INTERVAL '5 days 8 hours',
  4,
  NOW() - INTERVAL '5 days',
  NULL,
  NULL,
  85.00,
  jsonb_build_object('preferred_branch', 'เอกมัย', 'campaign', 'VIP Skin Renewal'),
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '5 days'
),

-- Proposal 2: Sent waiting for client response
(
  gen_random_uuid(),
  (SELECT id FROM public.sales_leads WHERE name = 'สมใจ ใจดี' LIMIT 1),
  'ff95a068-eb10-4828-acc6-911a57216d7e'::uuid,
  NULL,
  'Advanced Anti-Aging Bundle',
  'Comprehensive treatment plan for wrinkle reduction.',
  'sent'::proposal_status,
  jsonb_build_array(
    jsonb_build_object('name', 'Botox Forehead & Eyes', 'price', 18000, 'sessions', 1, 'description', 'Targeted wrinkle treatment'),
    jsonb_build_object('name', 'Meso Bright Program', 'price', 12000, 'sessions', 2, 'description', 'Brightening mesotherapy'),
    jsonb_build_object('name', 'Collagen Booster Drip', 'price', 8000, 'sessions', 1, 'description', 'IV booster for glow')
  ),
  38000.00,
  7.50,
  2850.00,
  35150.00,
  NOW() + INTERVAL '5 days',
  '30% deposit to confirm booking, flexible payment plan.',
  'Complimentary skin analysis follow-up included.',
  NOW() - INTERVAL '2 days',
  NULL,
  NULL,
  0,
  NULL,
  NULL,
  NULL,
  60.00,
  jsonb_build_object('follow_up', NOW() + INTERVAL '1 day', 'package_type', 'Anti-aging'),
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '2 days'
),

-- Proposal 3: Viewed by client, awaiting decision
(
  gen_random_uuid(),
  (SELECT id FROM public.sales_leads WHERE name = 'วิภา สวยงาม' LIMIT 1),
  'ff95a068-eb10-4828-acc6-911a57216d7e'::uuid,
  NULL,
  'Acne Recovery Intensive Plan',
  '12-week acne control and scar reduction program.',
  'viewed'::proposal_status,
  jsonb_build_array(
    jsonb_build_object('name', 'Deep Cleansing Facial', 'price', 4500, 'sessions', 4, 'description', 'Advanced extraction and detox'),
    jsonb_build_object('name', 'LED Therapy Add-on', 'price', 2500, 'sessions', 4, 'description', 'Blue & red light therapy'),
    jsonb_build_object('name', 'Acne Scar Laser', 'price', 12000, 'sessions', 2, 'description', 'Fractional laser resurfacing')
  ),
  37000.00,
  10.00,
  3700.00,
  33300.00,
  NOW() + INTERVAL '10 days',
  'Full payment upon acceptance, EMI option available.',
  'Includes home-care kit and monthly progress review.',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '3 days 4 hours',
  NOW() - INTERVAL '3 days 6 hours',
  2,
  NULL,
  NULL,
  NULL,
  55.00,
  jsonb_build_object('focus_area', 'Acne Control', 'next_follow_up', NOW() + INTERVAL '2 days'),
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '3 days'
),

-- Proposal 4: Draft in progress
(
  gen_random_uuid(),
  (SELECT id FROM public.sales_leads WHERE name = 'นภา ขาวใส' LIMIT 1),
  'ff95a068-eb10-4828-acc6-911a57216d7e'::uuid,
  NULL,
  'Brightening Starter Plan',
  'Initial proposal draft for skin brightening treatments.',
  'draft'::proposal_status,
  jsonb_build_array(
    jsonb_build_object('name', 'Vitamin C Infusion', 'price', 6500, 'sessions', 3, 'description', 'Brightening infusion therapy'),
    jsonb_build_object('name', 'Gentle Peel Program', 'price', 7200, 'sessions', 3, 'description', 'Lactic & mandelic peel combo')
  ),
  13700.00,
  0.00,
  0.00,
  13700.00,
  NULL,
  NULL,
  'Terms to be confirmed after consultation.',
  NULL,
  NULL,
  NULL,
  0,
  NULL,
  NULL,
  NULL,
  40.00,
  jsonb_build_object('notes', 'Waiting for client budget confirmation'),
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),

-- Proposal 5: Rejected with reason
(
  gen_random_uuid(),
  (SELECT id FROM public.sales_leads WHERE name = 'มานี สนใจ' LIMIT 1),
  'ff95a068-eb10-4828-acc6-911a57216d7e'::uuid,
  NULL,
  'Skin Wellness Essentials',
  'Balanced package for long-term skin maintenance.',
  'rejected'::proposal_status,
  jsonb_build_array(
    jsonb_build_object('name', 'HydraFacial Signature', 'price', 4800, 'sessions', 2, 'description', 'Hydration and pore refinement'),
    jsonb_build_object('name', 'Daily Glow Home Kit', 'price', 3200, 'sessions', 1, 'description', 'Home regimen set'),
    jsonb_build_object('name', 'Skin Coaching Sessions', 'price', 2500, 'sessions', 2, 'description', 'Personalized virtual check-ins')
  ),
  10500.00,
  0.00,
  0.00,
  10500.00,
  NOW() + INTERVAL '3 days',
  'Full payment upfront (installment available).',
  'Standard clinic cancellation policy applies.',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '7 days 20 hours',
  NOW() - INTERVAL '7 days 22 hours',
  1,
  NULL,
  NOW() - INTERVAL '7 days',
  'Chose competitor due to lower price.',
  25.00,
  jsonb_build_object('feedback', 'Client requested budget-friendly option'),
  NOW() - INTERVAL '9 days',
  NOW() - INTERVAL '7 days'
);
