/**
 * Apply RLS policies using direct PostgreSQL connection
 */

require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.bgejeqqngzvuokdffadu',
  password: 'fovdyaf2TGERL9Yz',
  ssl: false
});

async function applyRLS() {
  await client.connect();
  
  try {
    console.log('🔧 Applying RLS policies to analytics_events...\n');

    // Enable RLS
    await client.query('ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;');
    console.log('✅ RLS enabled');

    // Drop existing policies
    await client.query(`
      DROP POLICY IF EXISTS "Allow anonymous analytics insert" ON analytics_events;
      DROP POLICY IF EXISTS "Users can read own analytics" ON analytics_events;
      DROP POLICY IF EXISTS "Admins can read all analytics" ON analytics_events;
    `);
    console.log('✅ Old policies dropped');

    // Create new policies
    await client.query(`
      CREATE POLICY "Allow anonymous analytics insert"
      ON analytics_events
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
    `);
    console.log('✅ Anonymous INSERT policy created');

    await client.query(`
      CREATE POLICY "Users can read own analytics"
      ON analytics_events
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
    `);
    console.log('✅ User read policy created');

    await client.query(`
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
    `);
    console.log('✅ Admin read policy created');

    console.log('\n🎉 All RLS policies applied successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error details:', error);
    throw error;
  } finally {
    await client.end();
  }
}

applyRLS().then(() => {
  console.log('\n✅ Done! Now test with: node test-analytics-api.mjs');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Failed:', err.message);
  process.exit(1);
});
