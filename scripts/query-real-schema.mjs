#!/usr/bin/env node

/**
 * Query actual Supabase schema - list ALL tables in public schema
 */

import * as p from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = p.dirname(__filename)

dotenv.config({ path: p.join(__dirname, "../.env.local") })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const { createClient } = await import("@supabase/supabase-js")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

console.log("🔍 QUERY ACTUAL SUPABASE SCHEMA\n")

// Method 1: Try to query information_schema.tables directly
try {
  console.log("📍 Querying information_schema.tables...\n")

  const { data: tables, error } = await supabase
    .from("information_schema.tables")
    .select("table_name, table_schema")
    .eq("table_schema", "public")
    .order("table_name")

  if (error) {
    console.log(`⚠️  Method 1 failed: ${error.message}`)
  } else if (tables && tables.length > 0) {
    console.log(`✅ Found ${tables.length} tables in public schema:\n`)

    for (const t of tables) {
      console.log(`   • ${t.table_name}`)
    }

    console.log(`\n📊 TOTAL: ${tables.length} tables`)
    process.exit(0)
  }
} catch (err) {
  console.log(`⚠️  Method 1 error: ${err.message}`)
}

// Method 2: Try via RPC if available
console.log("\n📍 Attempting via database function...\n")

try {
  const { data, error } = await supabase.rpc("get_all_tables", {})

  if (!error && data) {
    console.log(`✅ Found ${data.length} tables:\n`)
    for (const t of data) {
      console.log(`   • ${t}`)
    }
    console.log(`\n📊 TOTAL: ${data.length} tables`)
    process.exit(0)
  }
} catch (err) {
  // ignore
}

// Method 3: List known tables and verify each
console.log("📍 Falling back to known tables verification...\n")

const allPossibleTables = [
  // Core
  "users",
  "user_profiles",
  "user_preferences",
  "user_activity_log",
  // AI
  "skin_analyses",
  "analyses",
  "analysis_history",
  "analytics_events",
  // Action Plans
  "action_plans",
  "action_items",
  "smart_goals",
  "goal_milestones",
  "goal_check_ins",
  "goal_photos",
  // Booking
  "bookings",
  "appointments",
  "appointment_services",
  "availability_slots",
  // Clinic
  "clinics",
  "clinic_staff",
  "services",
  "branches",
  // Chat
  "chat_rooms",
  "chat_messages",
  "chat_participants",
  "chat_read_status",
  "chat_history",
  // Queue
  "queue_entries",
  "queue_notifications",
  "queue_settings",
  "queue_statistics",
  // Inventory
  "inventory_items",
  "inventory_categories",
  "inventory_suppliers",
  // Loyalty
  "loyalty_tiers",
  "loyalty_rewards",
  "customer_loyalty_status",
  "points_transactions",
  "points_earning_rules",
  // Marketing
  "marketing_campaigns",
  "promo_codes",
  "customer_segments",
  // Sales
  "sales_leads",
  "sales_proposals",
  "sales_activities",
  // Treatment
  "treatments",
  "treatment_records",
  "treatment_photos",
  "treatment_outcomes",
  "treatment_history",
  // Reports
  "generated_reports",
  "report_schedules",
  "performance_metrics",
  // System
  "error_logs",
  "invitations",
  "customers",
  "staff_members",
  "treatment_plans",
  "payment_records",
  "customer_notes",
  "presentation_sessions",
  "share_views",
  "live_chat_sessions",
]

const existing = []
const missing = []

for (const table of allPossibleTables) {
  try {
    const { error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true })

    if (error && error.code === "PGRST103") {
      missing.push(table)
    } else if (!error) {
      existing.push(table)
    }
  } catch {
    missing.push(table)
  }
}

console.log(`✅ EXISTING TABLES (${existing.length}):\n`)
for (const t of existing.sort()) {
  console.log(`   ✓ ${t}`)
}

console.log(`\n❌ MISSING TABLES (${missing.length}):\n`)
for (const t of missing.sort()) {
  console.log(`   ✗ ${t}`)
}

console.log(`\n📊 SUMMARY`)
console.log("=" * 60)
console.log(`Total possible tables: ${allPossibleTables.length}`)
console.log(`Existing in Supabase: ${existing.length}`)
console.log(`Missing: ${missing.length}`)
console.log(`Completeness: ${Math.round((existing.length / allPossibleTables.length) * 100)}%`)
