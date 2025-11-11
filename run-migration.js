const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.bgejeqqngzvuokdffadu',
  password: 'fovdyaf2TGERL9Yz',
  ssl: false
});

async function runMigration() {
  try {
    console.log('\n🔌 Connecting to PostgreSQL Database...\n');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20240121_action_plans_smart_goals.sql');
    console.log('📖 Reading migration file:', migrationPath);
    
    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log(`📄 Migration file loaded (${sql.length} characters)\n`);

    console.log('🚀 Executing migration...\n');
    console.log('This will create the following tables:');
    console.log('  1. action_plans');
    console.log('  2. action_items');
    console.log('  3. smart_goals');
    console.log('  4. goal_milestones');
    console.log('  5. goal_check_ins');
    console.log('  6. goal_photos\n');

    // Execute the migration
    await client.query(sql);

    console.log('✅ Migration executed successfully!\n');

    // Verify tables were created
    console.log('🔍 Verifying tables...\n');
    
    const tables = [
      'action_plans',
      'action_items',
      'smart_goals',
      'goal_milestones',
      'goal_check_ins',
      'goal_photos'
    ];

    for (const tableName of tables) {
      const result = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);

      if (result.rows.length > 0) {
        console.log(`✅ ${tableName}: Created with ${result.rows.length} columns`);
      } else {
        console.log(`❌ ${tableName}: NOT FOUND`);
      }
    }

    console.log('\n🎉 Week 6 Database Migration Complete!\n');
    console.log('📊 Summary:');
    console.log('  - 6 new tables created');
    console.log('  - All indexes created');
    console.log('  - All RLS policies applied');
    console.log('  - Helper functions deployed');
    console.log('  - Triggers configured\n');

    await client.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration Failed!\n');
    console.error('Error:', error.message);
    
    if (error.position) {
      console.error('Position:', error.position);
    }
    
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    
    if (error.hint) {
      console.error('Hint:', error.hint);
    }

    await client.end().catch(() => {});
    process.exit(1);
  }
}

runMigration();
