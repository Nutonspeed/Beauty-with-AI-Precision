-- Check payment_type constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.payments'::regclass 
AND conname LIKE '%payment_type%';
