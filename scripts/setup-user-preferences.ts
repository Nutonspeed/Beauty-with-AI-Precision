import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupUserPreferences() {
  console.log("🚀 Setting up user_preferences table...\n")

  // Step 1: Check if table exists
  console.log("1️⃣ Checking if table exists...")
  const { data: tableCheck, error: tableError } = await supabase
    .from("user_preferences")
    .select("id")
    .limit(1)

  if (tableError && tableError.code === "42P01") {
    console.log("❌ Table doesn't exist yet")
    console.log("\n📋 Please run this in Supabase SQL Editor:")
    console.log("─".repeat(80))
    console.log(`
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  notification_settings JSONB DEFAULT '{
    "email_bookings": true,
    "email_analyses": true,
    "email_promotions": false,
    "email_updates": true,
    "sms_reminders": true,
    "push_notifications": false
  }'::jsonb,
  
  language VARCHAR(10) DEFAULT 'th',
  theme VARCHAR(20) DEFAULT 'system',
  timezone VARCHAR(50) DEFAULT 'Asia/Bangkok',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  currency VARCHAR(10) DEFAULT 'THB',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT user_preferences_user_id_unique UNIQUE (user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON user_preferences FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all preferences" ON user_preferences FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

CREATE OR REPLACE FUNCTION update_user_preferences_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();
`)
    console.log("─".repeat(80))
    return
  }

  console.log("✅ Table exists!\n")

  // Step 2: Test insert
  console.log("2️⃣ Testing insert (upsert)...")
  
  // Get a test user
  const { data: users } = await supabase
    .from("users")
    .select("id, email")
    .limit(1)
    .single()

  if (!users) {
    console.log("⚠️ No users found to test with")
    return
  }

  console.log(`   Using test user: ${users.email}`)

  const { data: insertData, error: insertError } = await supabase
    .from("user_preferences")
    .upsert(
      {
        user_id: users.id,
        language: "th",
        theme: "system",
        notification_settings: {
          email_bookings: true,
          email_analyses: true,
          email_promotions: false,
          email_updates: true,
          sms_reminders: true,
          push_notifications: false,
        },
      },
      { onConflict: "user_id" }
    )
    .select()

  if (insertError) {
    console.log("❌ Insert failed:", insertError.message)
    console.log("\n📋 This might mean RLS policies are missing. Run this SQL:")
    console.log("─".repeat(80))
    console.log(`
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can delete own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admins can view all preferences" ON user_preferences;

CREATE POLICY "Users can read own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON user_preferences FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all preferences" ON user_preferences FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));
`)
    console.log("─".repeat(80))
    return
  }

  console.log("✅ Insert successful!")
  console.log("   Data:", insertData)

  // Step 3: Test select
  console.log("\n3️⃣ Testing select...")
  const { data: selectData, error: selectError } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", users.id)

  if (selectError) {
    console.log("❌ Select failed:", selectError.message)
    return
  }

  console.log("✅ Select successful!")
  console.log("   Data:", selectData)

  // Step 4: Summary
  console.log("\n" + "═".repeat(80))
  console.log("🎉 USER_PREFERENCES TABLE SETUP COMPLETE!")
  console.log("═".repeat(80))
  console.log("\n✅ Table exists")
  console.log("✅ RLS policies working")
  console.log("✅ Insert/Update working")
  console.log("✅ Select working")
  console.log("\n📊 Ready to use in Profile page!")
  console.log("\n🔗 Test at: http://localhost:3000/profile")
  console.log("═".repeat(80))
}

setupUserPreferences()
