import pg from 'pg';
const { Client } = pg;

// Skip SSL verification for Supabase connection
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = new Client({
  connectionString: 'postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
});

try {
  await client.connect();
  console.log('✅ Connected to Supabase PostgreSQL\n');

  // Check if data was inserted
  const { rows: leads } = await client.query(`
    SELECT 
      name,
      email,
      score,
      status,
      source,
      estimated_value,
      created_at
    FROM public.sales_leads
    WHERE sales_user_id = 'ff95a068-eb10-4828-acc6-911a57216d7e'
    ORDER BY score DESC;
  `);

  console.log('📊 Sales Leads in Database');
  console.log('Total:', leads.length);
  console.log('---\n');

  if (leads.length === 0) {
    console.log('❌ NO DATA FOUND! The INSERT may have failed.');
    console.log('Please check RLS policies or run the SQL again.\n');
  } else {
    leads.forEach((lead, i) => {
      console.log(`${i + 1}. ${lead.name} (Score: ${lead.score})`);
      console.log(`   Email: ${lead.email}`);
      console.log(`   Status: ${lead.status} | Source: ${lead.source}`);
      console.log(`   Value: ฿${Number(lead.estimated_value).toLocaleString()}`);
      console.log('');
    });
  }

  // Count by priority
  const { rows: stats } = await client.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN score >= 70 THEN 1 END) as high_priority,
      COUNT(CASE WHEN score BETWEEN 50 AND 69 THEN 1 END) as medium_priority,
      SUM(estimated_value) as total_revenue
    FROM public.sales_leads
    WHERE sales_user_id = 'ff95a068-eb10-4828-acc6-911a57216d7e';
  `);

  console.log('📈 Statistics');
  console.log('---');
  console.log('Total Leads:', stats[0].total);
  console.log('High Priority (≥70):', stats[0].high_priority);
  console.log('Medium Priority (50-69):', stats[0].medium_priority);
  console.log('Total Potential Revenue: ฿' + Number(stats[0].total_revenue || 0).toLocaleString());

  await client.end();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
