const { Client } = require('pg');

// Use pooler connection
const client = new Client({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.bgejeqqngzvuokdffadu',
  password: 'fovdyaf2TGERL9Yz',
  ssl: false
});

async function checkSchema() {
  try {
    await client.connect();
    console.log('\n✅ Connected to PostgreSQL Database\n');
    console.log('=== Querying ALL Tables in PUBLIC Schema ===\n');

    // Query to get all tables with row counts
    const result = await client.query(`
      SELECT 
        schemaname,
        tablename,
        (
          SELECT COUNT(*) 
          FROM information_schema.columns 
          WHERE table_schema = schemaname 
          AND table_name = tablename
        ) as column_count
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log(`📊 Found ${result.rows.length} tables:\n`);

    for (let i = 0; i < result.rows.length; i++) {
      const table = result.rows[i];
      
      // Get row count for each table
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM "${table.tablename}"`);
        const count = countResult.rows[0].count;
        console.log(`${i + 1}. ✅ ${table.tablename} (${table.column_count} columns, ${count} rows)`);
      } catch (err) {
        console.log(`${i + 1}. ⚠️  ${table.tablename} (${table.column_count} columns, error counting rows)`);
      }
    }

    console.log('\n=== Checking Week 6 Tables Specifically ===\n');

    const week6Tables = [
      'action_plans',
      'action_items', 
      'smart_goals',
      'goal_milestones',
      'goal_check_ins',
      'goal_photos'
    ];

    for (const tableName of week6Tables) {
      try {
        const checkResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [tableName]);

        if (checkResult.rows.length > 0) {
          console.log(`✅ ${tableName}: EXISTS with ${checkResult.rows.length} columns`);
          console.log(`   Columns: ${checkResult.rows.map(r => r.column_name).join(', ')}`);
        } else {
          console.log(`❌ ${tableName}: NOT FOUND`);
        }
      } catch (err) {
        console.log(`❌ ${tableName}: ERROR - ${err.message}`);
      }
    }

    await client.end();
    console.log('\n✅ Database check complete\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Connection Error:', error.message);
    console.error('Details:', error);
    process.exit(1);
  }
}

checkSchema();
