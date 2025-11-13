#!/usr/bin/env node

/**
 * Simple SQL query to list all tables
 */

import * as path from "path"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, "../.env.local") })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const { createClient } = await import("@supabase/supabase-js")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

console.log("📊 QUERYING DATABASE TABLES\n")

// Try to query the information_schema directly
const tableQueries = [
  "users",
  "skin_analyses",
  "invitations",
  "clinics",
  "customers",
  "appointments",
  "staff_members",
  "treatment_plans",
  "action_plans",
  "action_items",
  "smart_goals",
  "chat_history",
  "chat_messages",
  "bookings",
  "treatments",
  "loyalty_tiers",
  "inventory_items",
  "marketing_campaigns",
  "sales_leads",
  "error_logs",
  "performance_metrics",
  "payment_records",
  "customer_notes",
  "presentation_sessions",
]

console.log(`Checking ${tableQueries.length} tables...\n`)

let found = 0
let notFound = 0
const results = []

for (const table of tableQueries) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true })

    if (error) {
      console.log(`❌ ${table.padEnd(25)} - NOT FOUND`)
      notFound++
    } else {
      console.log(`✅ ${table.padEnd(25)} - ${count || 0} rows`)
      found++
      results.push({ table, rows: count || 0 })
    }
  } catch (error) {
    console.log(`❌ ${table.padEnd(25)} - ERROR: ${error.message.substring(0, 30)}`)
    notFound++
  }
}

console.log("\n" + "=" * 60)
console.log(`✅ Found: ${found} tables`)
console.log(`❌ Missing: ${notFound} tables`)
console.log("=" * 60)

if (results.length > 0) {
  console.log("\n📝 Tables with data:")
  results.sort((a, b) => b.rows - a.rows).forEach(({ table, rows }) => {
    if (rows > 0) console.log(`   • ${table}: ${rows} rows`)
  })
}
