-- Sample security data for testing the Security Monitoring Panel
-- This migration creates test data for security events, failed logins, active sessions, and suspicious activities

-- Insert sample security events
INSERT INTO security_events (event_type, severity, user_id, ip_address, user_agent, error_message, resolved, created_at)
SELECT 
  event_type,
  severity,
  (SELECT id FROM auth.users ORDER BY RANDOM() LIMIT 1),
  ('192.168.' || floor(random() * 255)::text || '.' || floor(random() * 255)::text)::inet,
  CASE floor(random() * 3)
    WHEN 0 THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    WHEN 1 THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'
    ELSE 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  END,
  error_message,
  CASE WHEN severity IN ('low', 'medium') THEN true ELSE false END,
  NOW() - (random() * INTERVAL '7 days')
FROM (
  VALUES
    ('failed_login', 'medium', 'Invalid credentials provided'),
    ('failed_login', 'medium', 'Account locked due to multiple failed attempts'),
    ('unauthorized_access', 'high', 'Attempted access to restricted resource'),
    ('suspicious_activity', 'high', 'Unusual login pattern detected'),
    ('brute_force', 'critical', 'Brute force attack detected from IP'),
    ('failed_login', 'low', 'User entered wrong password'),
    ('unauthorized_access', 'medium', 'API key validation failed'),
    ('suspicious_activity', 'medium', 'Multiple failed login attempts'),
    ('failed_login', 'medium', 'Invalid credentials'),
    ('session_hijack', 'critical', 'Potential session hijacking detected')
) AS events(event_type, severity, error_message);

-- Insert sample failed login attempts
INSERT INTO failed_login_attempts (email, ip_address, user_agent, failure_reason, attempt_count, first_attempt_at, last_attempt_at, blocked_until)
VALUES
  ('admin@example.com', '192.168.1.100'::inet, 'Mozilla/5.0 (Windows NT 10.0)', 'invalid_credentials', 3, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', NULL),
  ('test@clinic.com', '192.168.1.101'::inet, 'Mozilla/5.0 (iPhone)', 'invalid_credentials', 2, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '15 minutes', NULL),
  ('hacker@evil.com', '203.0.113.42'::inet, 'curl/7.68.0', 'invalid_credentials', 8, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '5 minutes', NOW() + INTERVAL '25 minutes'),
  ('user@test.com', '192.168.1.102'::inet, 'Mozilla/5.0 (Macintosh)', 'account_locked', 5, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '2 hours', NULL),
  ('banned@test.com', '203.0.113.43'::inet, 'Python-requests/2.28.0', 'invalid_credentials', 12, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '29 minutes');

-- Insert sample active sessions (only if users exist)
INSERT INTO active_sessions (user_id, session_token, ip_address, user_agent, device_type, browser, os, location_country, location_city, last_activity_at, expires_at, is_active, created_at)
SELECT 
  id,
  encode(gen_random_bytes(32), 'hex'),
  ('192.168.' || floor(random() * 255)::text || '.' || floor(random() * 255)::text)::inet,
  CASE device
    WHEN 'desktop' THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0'
    WHEN 'mobile' THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1'
    ELSE 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15'
  END,
  device,
  CASE device
    WHEN 'desktop' THEN 'Chrome'
    WHEN 'mobile' THEN 'Safari Mobile'
    ELSE 'Safari'
  END,
  CASE device
    WHEN 'desktop' THEN 'Windows 10'
    WHEN 'mobile' THEN 'iOS 17'
    ELSE 'macOS 14'
  END,
  country,
  city,
  NOW() - (random() * INTERVAL '30 minutes'),
  NOW() + INTERVAL '7 days',
  true,
  NOW() - (random() * INTERVAL '2 hours')
FROM auth.users
CROSS JOIN (
  VALUES
    ('desktop', 'Thailand', 'Bangkok'),
    ('mobile', 'Thailand', 'Chiang Mai'),
    ('tablet', 'United States', 'New York')
) AS devices(device, country, city)
LIMIT 10;

-- Insert sample suspicious activities
INSERT INTO suspicious_activities (activity_type, user_id, ip_address, description, risk_score, indicators, auto_blocked, reviewed, created_at)
SELECT 
  activity_type,
  (SELECT id FROM auth.users ORDER BY RANDOM() LIMIT 1),
  ('203.0.113.' || floor(random() * 255)::text)::inet,
  description,
  risk_score,
  indicators::jsonb,
  risk_score >= 80,
  risk_score < 60,
  NOW() - (random() * INTERVAL '7 days')
FROM (
  VALUES
    ('unusual_location', 'Login from new country detected', 75, '["New geolocation", "Different IP range", "Unknown device"]'),
    ('rapid_requests', 'Excessive API requests detected', 85, '["100+ requests/min", "Multiple endpoints", "Rate limit exceeded"]'),
    ('data_export', 'Large data export attempt', 65, '["Bulk download", "Sensitive data", "After hours"]'),
    ('privilege_escalation', 'Attempted unauthorized role change', 95, '["Admin endpoint access", "Invalid token", "Suspicious headers"]'),
    ('api_abuse', 'Automated scraping detected', 70, '["Bot-like behavior", "Sequential requests", "No user interaction"]'),
    ('unusual_location', 'VPN detected from high-risk country', 80, '["VPN/Proxy detected", "Blacklisted IP range"]'),
    ('rapid_requests', 'DDoS-like traffic pattern', 90, '["Distributed sources", "Identical payloads", "Flood attack"]'),
    ('data_export', 'Customer data export without approval', 88, '["PII access", "No audit trail", "Unauthorized user"]')
) AS activities(activity_type, description, risk_score, indicators);
