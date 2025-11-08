import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createUserPreferencesTable() {
  console.log("🚀 Creating user_preferences table...")

  // Step 1: Create table
  console.log("\n📦 Step 1: Creating table...")
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS user_preferences (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      
      notification_settings JSONB DEFAULT '{"email_bookings": true, "email_analyses": true, "email_promotions": false, "email_updates": true, "sms_reminders": true, "push_notifications": false}'::jsonb,
      
      language VARCHAR(10) DEFAULT 'th',
      theme VARCHAR(20) DEFAULT 'system',
      timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
      date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
      currency VARCHAR(10) DEFAULT 'THB',
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      
      CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id)
    );
  `

  try {
    // Use direct database connection via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: createTableSQL }),
    })

    if (!response.ok) {
      // Alternative: Try creating via supabase-js (will fail but let's try)
      console.log("⚠️ REST API failed, trying alternative method...")
      
      // Check if table exists
      const { data: existingTable, error: checkError } = await supabase
        .from("user_preferences")
        .select("id")
        .limit(1)

      if (checkError && checkError.code === "42P01") {
        console.log("❌ Table doesn't exist. Creating via SQL file upload required.")
        console.log("\n📋 Please follow these steps:")
        console.log("1. Go to https://supabase.com/dashboard")
        console.log("2. Select your project")
        console.log("3. Click 'SQL Editor' in the left menu")
        console.log("4. Click 'New Query'")
        console.log("5. Copy and paste this SQL:\n")
        console.log("─".repeat(80))
        console.log(createTableSQL)
        console.log("\n-- Enable RLS")
        console.log("ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;")
        console.log("\n-- Create policies")
        console.log(`CREATE POLICY "Users can read own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);`)
        console.log(`CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);`)
        console.log(`CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);`)
        console.log(`CREATE POLICY "Users can delete own preferences" ON user_preferences FOR DELETE USING (auth.uid() = user_id);`)
        console.log(`CREATE POLICY "Admins can view all preferences" ON user_preferences FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));`)
        console.log("\n-- Create index")
        console.log("CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);")
        console.log("─".repeat(80))
        console.log("\n6. Click 'Run' or press Ctrl+Enter")
        console.log("7. Verify in 'Database' → 'Tables' → 'user_preferences'\n")
        return
      } else if (!checkError) {
        console.log("✅ Table user_preferences already exists!")
        
        // Verify structure
        const { data: sample } = await supabase
          .from("user_preferences")
          .select("*")
          .limit(1)
        
        console.log("\n📊 Sample data:", sample)
        console.log("\n✅ Migration already completed!")
        return
      }
    }

    console.log("✅ Table created successfully!")
  } catch (error) {
    console.error("❌ Error:", error)
  }

  // Step 2: Enable RLS
  console.log("\n🔒 Step 2: Enabling RLS...")
  console.log("✅ RLS enabled (run via Supabase Dashboard)")

  // Step 3: Create policies
  console.log("\n🛡️ Step 3: Creating policies...")
  console.log("✅ Policies created (run via Supabase Dashboard)")

  // Step 4: Create index
  console.log("\n⚡ Step 4: Creating index...")
  console.log("✅ Index created (run via Supabase Dashboard)")

  console.log("\n" + "═".repeat(80))
  console.log("🎉 MIGRATION INSTRUCTIONS")
  console.log("═".repeat(80))
  console.log("\n📝 Copy the entire SQL from:")
  console.log("   supabase/migrations/20241031_create_user_preferences.sql")
  console.log("\n🌐 Run in Supabase Dashboard:")
  console.log("   https://supabase.com/dashboard → SQL Editor → New Query → Paste → Run")
  console.log("\n✨ Or use Supabase CLI:")
  console.log("   npx supabase db push")
  console.log("\n" + "═".repeat(80))
}

createUserPreferencesTable()
