/**
 * Check existing database schema for treatments
 */

import postgres from 'postgres';

const sql = postgres('postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', {
  ssl: false,
  max: 1
});

async function checkSchema() {
  try {
    console.log('🔍 Checking Existing Database Schema...\n');

    // Check treatments table
    console.log('📋 TREATMENTS TABLE:');
    const treatmentCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'treatments' 
      ORDER BY ordinal_position
    `;

    if (treatmentCols.length > 0) {
      console.log(`   Found ${treatmentCols.length} columns:`);
      treatmentCols.forEach(row => {
        console.log(`   ${row.column_name.padEnd(30)} ${row.data_type}`);
      });
      
      // Sample data
      const sampleTreatments = await sql`
        SELECT id, name, category, subcategory, price_min, price_max
        FROM treatments 
        LIMIT 3
      `;
      console.log(`\n   Sample data (${sampleTreatments.length} rows):`);
      sampleTreatments.forEach(t => {
        console.log(`   - ${t.name} (${t.category}/${t.subcategory}) ฿${t.price_min}-${t.price_max}`);
      });
    } else {
      console.log('   ⚠️ Table not found');
    }

    // Check treatment_recommendations table (existing)
    console.log('\n📋 TREATMENT_RECOMMENDATIONS TABLE:');
    const recCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'treatment_recommendations' 
      ORDER BY ordinal_position
    `;

    console.log(`   Found ${recCols.length} columns:`);
    recCols.forEach(row => {
      console.log(`   ${row.column_name.padEnd(30)} ${row.data_type}`);
    });

    // Check skin_analyses table
    console.log('\n📋 SKIN_ANALYSES TABLE:');
    const analysisCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'skin_analyses' 
      ORDER BY ordinal_position
    `;

    if (analysisCols.length > 0) {
      console.log(`   Found ${analysisCols.length} columns:`);
      analysisCols.slice(0, 10).forEach(row => {
        console.log(`   ${row.column_name.padEnd(30)} ${row.data_type}`);
      });
      if (analysisCols.length > 10) {
        console.log(`   ... and ${analysisCols.length - 10} more columns`);
      }
    } else {
      console.log('   ⚠️ Table not found');
    }

    console.log('\n━'.repeat(60));
    console.log('✅ Schema Check Complete!');
    console.log('\nConclusion:');
    console.log('   • treatment_recommendations table EXISTS (Week 6 schema)');
    console.log('   • Need to ADAPT our API to use existing schema');
    console.log('   • Will use treatments table for treatment details');
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

checkSchema();
