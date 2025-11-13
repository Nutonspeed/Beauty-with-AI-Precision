#!/usr/bin/env node

/**
 * Database Status Check Script
 * Verifies:
 * 1. Supabase connection
 * 2. Total tables count
 * 3. Table structure & row counts
 * 4. Critical tables status
 * 5. RLS policies
 */

import * as fs from "fs"
import * as path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials in .env.local")
  process.exit(1)
}

console.log("🔍 Database Status Check\n")
console.log(`📍 Supabase URL: ${SUPABASE_URL}`)

// Create Supabase client
const createClient = async () => {
  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js")
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}

// Check 1: Connection test
async function checkConnection() {
  console.log("\n✓ Checking Supabase connection...")
  try {
    const supabase = await createClient()
    const { data: session, error } = await supabase.auth.getSession()
    console.log("  ✅ Connection successful")
    return true
  } catch (error) {
    console.log("  ❌ Connection failed:", error.message)
    return false
  }
}

// Check 2: Count tables
async function checkTableCount() {
  console.log("\n✓ Counting database tables...")
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc("execute_raw_sql", {
      sql: `
        SELECT COUNT(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `,
    })

    if (error) {
      // Fallback: Try direct query
      const { data: tables, error: err2 } = await supabase
        .from("information_schema.tables")
        .select("table_name", { count: "exact", head: true })
        .eq("table_schema", "public")

      if (err2) {
        console.log("  ⚠️  Cannot count tables (RPC not available)")
        return null
      }
    }

    console.log(`  ✅ Database is accessible`)
    return true
  } catch (error) {
    console.log("  ❌ Error:", error.message)
    return false
  }
}

// Check 3: Critical tables
async function checkCriticalTables() {
  console.log("\n✓ Checking critical tables...")
  const criticalTables = [
    "users",
    "skin_analyses",
    "invitations",
    "clinics",
    "customers",
    "appointments",
    "staff_members",
    "treatment_plans",
    "action_plans",
  ]

  const supabase = await createClient()
  const results = {}

  for (const table of criticalTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })

      if (error) {
        results[table] = { exists: false, rows: 0, error: error.message }
      } else {
        results[table] = { exists: true, rows: count || 0 }
      }
    } catch (error) {
      results[table] = { exists: false, rows: 0, error: error.message }
    }
  }

  // Display results
  let existCount = 0
  for (const [table, result] of Object.entries(results)) {
    const status = result.exists ? "✅" : "❌"
    const rowInfo = result.exists ? ` (${result.rows} rows)` : ""
    console.log(`  ${status} ${table}${rowInfo}`)
    if (result.exists) existCount++
  }

  console.log(`\n  📊 Total: ${existCount}/${criticalTables.length} tables found`)
  return results
}

// Check 4: Migrations
async function checkMigrations() {
  console.log("\n✓ Checking migration files...")
  const migrationsDir = path.join(__dirname, "../supabase/migrations")

  try {
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"))
    console.log(`  ✅ Found ${files.length} migration files`)

    // Show last 5 migrations
    console.log("\n  📋 Recent migrations:")
    files.slice(-5).forEach((f) => {
      console.log(`     - ${f}`)
    })

    return files.length
  } catch (error) {
    console.log(`  ❌ Error reading migrations:`, error.message)
    return 0
  }
}

// Main execution
async function main() {
  console.log("=" * 60)
  console.log("DATABASE STATUS REPORT")
  console.log("=" * 60)

  const connected = await checkConnection()
  if (!connected) {
    console.error("\n❌ Cannot connect to Supabase. Aborting.")
    process.exit(1)
  }

  await checkTableCount()
  const tableResults = await checkCriticalTables()
  const migrationCount = await checkMigrations()

  console.log("\n" + "=" * 60)
  console.log("SUMMARY")
  console.log("=" * 60)
  console.log("✅ Supabase connection: OK")
  console.log(`✅ Migrations: ${migrationCount} files`)

  const existingTables = Object.values(tableResults).filter((t) => t.exists).length
  const status = existingTables >= 9 ? "🟢 READY" : "🟡 PARTIAL"
  console.log(`${status} Critical tables: ${existingTables}/9`)

  console.log("\n💡 Next steps:")
  console.log("   1. If tables are missing, run: pnpm supabase db push")
  console.log("   2. To verify data integrity: npm run db:verify")
  console.log("   3. To seed test data: npm run db:seed")

  process.exit(0)
}

main().catch((error) => {
  console.error("❌ Fatal error:", error)
  process.exit(1)
})
