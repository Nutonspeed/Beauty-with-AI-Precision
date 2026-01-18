const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://bgejeqqngzvuokdffadu.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZWplcXFuZ3p2dW9rZGZmYWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTYzMzc1NCwiZXhwIjoyMDc3MjA5NzU0fQ.e6QXg-KmZpihUyuD81qeyORTgJtAzoaLTqAbIyamJ0o');

async function check() {
  console.log('--- Database Schema Audit ---');
  
  // 1. Check users table columns
  const { data: uCols, error: uErr } = await supabase.from('users').select('*').limit(1);
  if (uErr) console.error('Users Select Error:', uErr);
  else console.log('Users Columns:', Object.keys(uCols[0] || {}));

  // 2. Check RLS policies for users table
  console.log('\n--- RLS Policies for users table ---');
  const { data: policies, error: pErr } = await supabase.rpc('exec_sql', { 
    sql_query: "SELECT policyname, definition FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'" 
  });
  
  if (pErr) {
    console.log('RPC exec_sql failed, trying standard select from pg_policies...');
    const { data: p2, error: pErr2 } = await supabase.from('pg_policies').select('*').eq('tablename', 'users');
    if (pErr2) console.error('Standard Select pg_policies Error:', pErr2);
    else console.log('Policies:', p2);
  } else {
    console.log('Policies:', policies);
  }

  // 3. Check if center_id is the canonical name
  const { data: centers, error: cErr } = await supabase.from('centers').select('*').limit(1);
  if (cErr) {
    console.log('Centers table might be named clinics? Checking clinics...');
    const { data: clinics, error: clErr } = await supabase.from('clinics').select('*').limit(1);
    if (clErr) console.error('Both centers and clinics failed:', clErr);
    else console.log('Found clinics table instead of centers. Columns:', Object.keys(clinics[0] || {}));
  } else {
    console.log('Found centers table. Columns:', Object.keys(centers[0] || {}));
  }
}

check();
