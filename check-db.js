const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bgejeqqngzvuokdffadu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZWplcXFuZ3p2dW9rZGZmYWR1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTYzMzc1NCwiZXhwIjoyMDc3MjA5NzU0fQ.e6QXg-KmZpihUyuD81qeyORTgJtAzoaLTqAbIyamJ0o'
);

async function checkTables() {
  try {
    // Method 1: Try to query each expected table
    const tables = [
      'skin_analyses',
      'users',
      'user_profiles',
      'email_preferences',
      'privacy_settings',
      'action_plans',
      'action_items',
      'smart_goals',
      'goal_milestones',
      'goal_check_ins',
      'goal_photos'
    ];

    console.log('\n=== Checking Database Tables ===\n');
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table}: NOT EXISTS (${error.message})`);
        } else {
          console.log(`✅ ${table}: EXISTS (${count || 0} rows)`);
        }
      } catch (e) {
        console.log(`❌ ${table}: ERROR (${e.message})`);
      }
    }

    console.log('\n=== Check Complete ===\n');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTables();
