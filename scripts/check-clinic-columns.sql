-- ตรวจสอบคอลัมน์ที่มีอยู่จริงในตาราง clinics
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'clinics'
ORDER BY ordinal_position;
