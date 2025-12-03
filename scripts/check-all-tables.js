const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bgejeqqngzvuokdffadu.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || '<REDACTED_SUPABASE_SERVICE_KEY>'
);

async function getAllTables() {
  try {
    console.log('\n=== Fetching ALL Tables from Database ===\n');
    
    // Use REST API to query information_schema
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          table_name,
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });

    if (error) {
      console.log('RPC method not available, trying direct query...\n');
      
      // Alternative: Try to list known tables
      const knownTables = [
        'skin_analyses', 'users', 'user_profiles', 'profiles',
        'email_preferences', 'privacy_settings', 
        'action_plans', 'action_items', 
        'smart_goals', 'goal_milestones', 'goal_check_ins', 'goal_photos',
        'bookings', 'services', 'staff', 'branches',
        'notifications', 'queue_entries', 'appointments'
      ];
      
      const existingTables = [];
      
      for (const table of knownTables) {
        try {
          const { error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            existingTables.push({ table_name: table, count: count || 0 });
          }
        } catch (e) {
          // Table doesn't exist
        }
      }
      
      console.log('📊 Tables Found in Database:\n');
      existingTables.forEach((t, i) => {
        console.log(`${i + 1}. ✅ ${t.table_name} (${t.count} rows)`);
      });
      console.log(`\n📈 Total: ${existingTables.length} tables\n`);
      
    } else {
      console.log('📊 All Tables in Database:\n');
      data.forEach((row, i) => {
        console.log(`${i + 1}. ✅ ${row.table_name} (${row.column_count} columns)`);
      });
      console.log(`\n📈 Total: ${data.length} tables\n`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

getAllTables();
