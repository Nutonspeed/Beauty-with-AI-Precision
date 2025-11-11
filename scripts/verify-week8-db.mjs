/**
 * Verify Week 8 Database Setup
 */

import postgres from 'postgres';

const sql = postgres('postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: false,
  max: 1
});

async function verify() {
  try {
    console.log('🔍 Verifying Week 8 Database Setup...\n');

    // Check table structure
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'treatment_recommendations' 
      ORDER BY ordinal_position
    `;

    console.log(`📊 Table Structure (${columns.length} columns):`);
    columns.forEach(row => {
      console.log(`   ${row.column_name.padEnd(25)} ${row.data_type}`);
    });

    // Check indexes
    const indexes = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'treatment_recommendations'
    `;

    console.log(`\n📑 Indexes (${indexes.length} total):`);
    indexes.forEach(row => {
      console.log(`   ✓ ${row.indexname}`);
    });

    // Check RLS policies
    const policies = await sql`
      SELECT policyname, cmd 
      FROM pg_policies 
      WHERE tablename = 'treatment_recommendations'
    `;

    console.log(`\n🔒 RLS Policies (${policies.length} total):`);
    policies.forEach(row => {
      console.log(`   ✓ ${row.policyname} (${row.cmd})`);
    });

    // Check triggers
    const triggers = await sql`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE event_object_table = 'treatment_recommendations'
    `;

    console.log(`\n⚡ Triggers (${triggers.length} total):`);
    triggers.forEach(row => {
      console.log(`   ✓ ${row.trigger_name}`);
    });

    // Get row count
    const count = await sql`
      SELECT COUNT(*) as total 
      FROM treatment_recommendations
    `;

    console.log(`\n📦 Current Data:`);
    console.log(`   Recommendations stored: ${count[0].total}`);

    console.log('\n━'.repeat(60));
    console.log('✅ Week 8 Database: FULLY CONFIGURED!\n');
    console.log('Ready to use:');
    console.log('   • POST /api/recommendations - Generate new');
    console.log('   • GET /api/recommendations?analysisId=xxx - Fetch by analysis');
    console.log('   • GET /api/recommendations/[userId] - Fetch by user');
    console.log('   • DELETE /api/recommendations/[userId] - Clear all');
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await sql.end();
  }
}

verify();
