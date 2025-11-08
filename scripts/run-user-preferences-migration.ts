import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log("🚀 Running user_preferences migration...")

    // Read migration file
    const migrationPath = join(
      process.cwd(),
      "supabase",
      "migrations",
      "20241031_create_user_preferences.sql"
    )
    const migrationSQL = readFileSync(migrationPath, "utf-8")

    // Execute migration
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL })

    if (error) {
      console.error("❌ Migration failed:", error)
      
      // Try alternative method - execute via direct query
      console.log("⚠️ Trying alternative method...")
      
      const statements = migrationSQL
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      for (const statement of statements) {
        try {
          const { error: stmtError } = await supabase.rpc("exec_sql", {
            sql: statement + ";",
          })
          if (stmtError) {
            console.error(`❌ Statement failed: ${statement.substring(0, 50)}...`)
            console.error(stmtError)
          }
        } catch (err) {
          console.error(`❌ Error executing statement: ${err}`)
        }
      }
    } else {
      console.log("✅ Migration completed successfully!")
    }

    // Verify table creation
    const { data: tables, error: tablesError } = await supabase
      .from("user_preferences")
      .select("*")
      .limit(0)

    if (tablesError) {
      console.log("⚠️ Table verification failed:", tablesError.message)
      console.log("\n📝 Please run this SQL manually in Supabase SQL Editor:")
      console.log("\n" + migrationSQL)
    } else {
      console.log("✅ Table user_preferences verified!")
    }
  } catch (error) {
    console.error("❌ Error:", error)
    console.log("\n📝 Please run this SQL manually in Supabase SQL Editor:")
    const migrationPath = join(
      process.cwd(),
      "supabase",
      "migrations",
      "20241031_create_user_preferences.sql"
    )
    const migrationSQL = readFileSync(migrationPath, "utf-8")
    console.log("\n" + migrationSQL)
  }
}

runMigration()
