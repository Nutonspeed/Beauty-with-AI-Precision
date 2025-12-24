-- Check if admin dashboard tables exist
SELECT 
    table_name,
    table_type,
    created_at
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('audit_logs', 'feature_flags')
ORDER BY table_name;
