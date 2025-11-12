-- ============================================
-- FIX: Sales Leads Data - Complete Reset
-- ============================================
-- This script will:
-- 1. Check current data
-- 2. Delete all existing sales_leads
-- 3. Insert 5 test leads with HIGH scores
-- 4. Verify the results
-- ============================================

-- STEP 1: Check what's currently in the table
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN score >= 70 THEN 1 END) as high_priority_count
FROM public.sales_leads
WHERE sales_user_id = 'ff95a068-eb10-4828-acc6-911a57216d7e';

-- STEP 2: DELETE all existing leads for this user
-- (Clean slate approach)
DELETE FROM public.sales_leads 
WHERE sales_user_id = 'ff95a068-eb10-4828-acc6-911a57216d7e';

-- STEP 3: INSERT 5 high-quality test leads
INSERT INTO public.sales_leads (
  sales_user_id,
  customer_user_id,
  name,
  email,
  phone,
  line_id,
  status,
  score,
  source,
  primary_concern,
  secondary_concerns,
  interested_treatments,
  estimated_value,
  budget_range_min,
  budget_range_max,
  first_contact_at,
  last_contact_at,
  tags,
  notes,
  metadata,
  created_at,
  updated_at
) VALUES
-- Lead 1: VIP High Priority (Score 92)
(
  'ff95a068-eb10-4828-acc6-911a57216d7e',
  NULL,
  'ประภา มั่งมี',
  'prapa.rich@example.com',
  NULL,
  '@prapa_rich',
  'qualified',
  92,
  'line',
  'ริ้วรอยและเส้นใยแห่งวัย',
  ARRAY['ความกระชับของผิว', 'จุดด่างดำ', 'ผิวหมองคล้ำ'],
  ARRAY['Botox', 'Filler', 'Thread Lift', 'Laser Treatment', 'Vitamin Drip'],
  120000.00,
  80000.00,
  150000.00,
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '30 minutes',
  ARRAY['hot-lead', 'high-value', 'vip', 'ready-to-book'],
  'VIP customer, ready to proceed with premium package',
  jsonb_build_object(
    'age', 42,
    'skin_type', 'dry',
    'photo', '/images/avatars/female-3.jpg',
    'wrinkles', 85,
    'pigmentation', 70,
    'pores', 50,
    'hydration', 35,
    'engagement_count', 12,
    'consultation_requested', true,
    'consultation_completed', true,
    'preferred_branch', 'เอกมัย',
    'referral_source', 'LINE Official',
    'previous_treatments', ARRAY['Facial', 'Vitamin C'],
    'willing_to_pay_premium', true
  ),
  NOW() - INTERVAL '1 week',
  NOW() - INTERVAL '30 minutes'
),

-- Lead 2: High Priority (Score 85)
(
  'ff95a068-eb10-4828-acc6-911a57216d7e',
  NULL,
  'สมใจ ใจดี',
  'somjai@example.com',
  NULL,
  '@somjai_joy',
  'new',
  85,
  'website',
  'ริ้วรอยและเส้นใยแห่งวัย',
  ARRAY['จุดด่างดำ', 'ความกระชับของผิว'],
  ARRAY['Botox', 'Filler', 'Laser Treatment'],
  45000.00,
  30000.00,
  50000.00,
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour',
  ARRAY['high-priority', 'botox-interested', 'vip-potential'],
  'Very interested in anti-aging treatments',
  jsonb_build_object(
    'age', 35,
    'skin_type', 'combination',
    'photo', '/images/avatars/female-1.jpg',
    'wrinkles', 75,
    'pigmentation', 60,
    'pores', 40,
    'hydration', 55,
    'engagement_count', 8,
    'consultation_requested', true,
    'preferred_branch', 'สุขุมวิท',
    'referral_source', 'Facebook Ads'
  ),
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '1 hour'
),

-- Lead 3: High Priority (Score 78)
(
  'ff95a068-eb10-4828-acc6-911a57216d7e',
  NULL,
  'วิภา สวยงาม',
  'wipa.beautiful@example.com',
  NULL,
  '@wipa_beauty',
  'contacted',
  78,
  'facebook',
  'สิวและรอยสิว',
  ARRAY['ผิวมันเกิน', 'รูขุมขนกว้าง'],
  ARRAY['Acne Treatment', 'Chemical Peel', 'Laser Resurfacing'],
  35000.00,
  25000.00,
  40000.00,
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '3 hours',
  ARRAY['acne-treatment', 'follow-up-needed'],
  'Needs follow-up, interested in acne package',
  jsonb_build_object(
    'age', 28,
    'skin_type', 'oily',
    'photo', '/images/avatars/female-2.jpg',
    'wrinkles', 20,
    'pigmentation', 45,
    'pores', 80,
    'hydration', 40,
    'engagement_count', 5,
    'consultation_requested', true,
    'preferred_branch', 'สยาม',
    'referral_source', 'Facebook Page'
  ),
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '3 hours'
),

-- Lead 4: Medium Priority (Score 68)
(
  'ff95a068-eb10-4828-acc6-911a57216d7e',
  NULL,
  'นภา ขาวใส',
  'napa.white@example.com',
  NULL,
  '@napa_white',
  'new',
  68,
  'instagram',
  'ผิวหมองคล้ำ',
  ARRAY['จุดด่างดำ', 'ผิวไม่เรียบเนียน'],
  ARRAY['Vitamin Drip', 'Laser Treatment', 'Chemical Peel'],
  28000.00,
  20000.00,
  35000.00,
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '6 hours',
  ARRAY['brightening', 'first-time'],
  'First-time customer, interested in brightening',
  jsonb_build_object(
    'age', 26,
    'skin_type', 'normal',
    'photo', '/images/avatars/female-4.jpg',
    'wrinkles', 15,
    'pigmentation', 65,
    'pores', 45,
    'hydration', 60,
    'engagement_count', 1,
    'consultation_requested', false,
    'preferred_branch', 'ทองหล่อ',
    'referral_source', 'Instagram Ads'
  ),
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '6 hours'
),

-- Lead 5: Medium Priority (Score 55)
(
  'ff95a068-eb10-4828-acc6-911a57216d7e',
  NULL,
  'มานี สนใจ',
  'manee.interested@example.com',
  NULL,
  '@manee_care',
  'contacted',
  55,
  'google',
  'ปรึกษาทั่วไป',
  ARRAY['ดูแลผิวหน้า'],
  ARRAY['Facial', 'Skin Analysis'],
  15000.00,
  10000.00,
  20000.00,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '1 day',
  ARRAY['general-inquiry', 'low-budget'],
  'General inquiry, budget conscious',
  jsonb_build_object(
    'age', 24,
    'skin_type', 'combination',
    'photo', '/images/avatars/female-5.jpg',
    'wrinkles', 10,
    'pigmentation', 30,
    'pores', 55,
    'hydration', 50,
    'engagement_count', 3,
    'consultation_requested', false,
    'preferred_branch', 'สาทร',
    'referral_source', 'Google Search'
  ),
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '1 day'
);

-- STEP 4: VERIFY - Check the results
SELECT 
  id,
  name,
  email,
  score,
  status,
  primary_concern,
  estimated_value,
  created_at
FROM public.sales_leads
WHERE sales_user_id = 'ff95a068-eb10-4828-acc6-911a57216d7e'
ORDER BY score DESC, created_at DESC;

-- STEP 5: Count verification
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN score >= 70 THEN 1 END) as high_priority_leads,
  COUNT(CASE WHEN score BETWEEN 50 AND 69 THEN 1 END) as medium_priority_leads,
  SUM(estimated_value) as total_potential_revenue
FROM public.sales_leads
WHERE sales_user_id = 'ff95a068-eb10-4828-acc6-911a57216d7e';
