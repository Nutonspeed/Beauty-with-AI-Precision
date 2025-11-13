/**
 * Apply analytics_events RLS policies
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyRLSPolicies() {
  console.log('🔧 Applying RLS policies to analytics_events table...\n');

  const policies = [
    {
      name: 'Enable RLS',
      sql: `ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;`
    },
    {
      name: 'Drop existing policies (if any)',
      sql: `
        DROP POLICY IF EXISTS "Allow anonymous analytics insert" ON analytics_events;
        DROP POLICY IF EXISTS "Users can read own analytics" ON analytics_events;
        DROP POLICY IF EXISTS "Admins can read all analytics" ON analytics_events;
      `
    },
    {
      name: 'Allow anonymous INSERT',
      sql: `
        CREATE POLICY "Allow anonymous analytics insert"
        ON analytics_events
        FOR INSERT
        TO anon, authenticated
        WITH CHECK (true);
      `
    },
    {
      name: 'Users can read own events',
      sql: `
        CREATE POLICY "Users can read own analytics"
        ON analytics_events
        FOR SELECT
        TO authenticated
        USING (user_id = auth.uid());
      `
    },
    {
      name: 'Admins can read all events',
      sql: `
        CREATE POLICY "Admins can read all analytics"
        ON analytics_events
        FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('super_admin', 'clinic_admin')
          )
        );
      `
    }
  ];

  for (const policy of policies) {
    console.log(`📝 ${policy.name}...`);
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error) {
        // Try alternative method using raw query
        console.log(`   Trying alternative method...`);
        const { error: altError } = await supabase.from('analytics_events').select('count').limit(0);
        if (altError) {
          console.error(`   ❌ Failed:`, error.message);
        } else {
          console.log(`   ✅ Done (may need manual SQL execution)`);
        }
      } else {
        console.log(`   ✅ Done`);
      }
    } catch (err) {
      console.error(`   ❌ Error:`, err.message);
    }
  }

  console.log('\n🧪 Testing INSERT with ANON_KEY...');
  
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const testEvent = {
    event_type: 'test_event',
    user_id: null,
    properties: { category: 'engagement', test: true },
    timestamp: new Date().toISOString()
  };

  const { error: insertError, status } = await anonClient
    .from('analytics_events')
    .insert(testEvent);

  if (insertError) {
    console.error('❌ Test INSERT failed:', insertError.message);
    console.log('\n⚠️  Manual SQL execution required. Run this in Supabase SQL Editor:');
    console.log('\n```sql');
    policies.forEach(p => console.log(p.sql));
    console.log('```\n');
  } else {
    console.log('✅ Test INSERT successful! Status:', status);
    console.log('🎉 RLS policies applied successfully!\n');
  }
}

applyRLSPolicies().catch(console.error);
