#!/usr/bin/env node

/**
 * Complete Database Table Audit
 * Lists ALL tables and verifies structure
 */

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
  console.error("❌ Missing Supabase credentials")
  process.exit(1)
}

const { createClient } = await import("@supabase/supabase-js")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

console.log("🔍 COMPLETE DATABASE TABLE AUDIT\n")
console.log("=" * 70)

// Query all tables using raw SQL via the client
async function getAllTables() {
  try {
    // Using direct SQL query through Supabase
    const { data, error } = await supabase.rpc("get_tables_info", {})

    if (error && error.message.includes("does not exist")) {
      // If RPC doesn't exist, try another method
      console.log("⚠️  RPC function not available, using alternative query...\n")

      // Try to query a known table to get connection working
      const { data: result, error: err2 } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })

      if (err2) {
        console.error("❌ Cannot query database:", err2.message)
        return null
      }

      // If we get here, connection works - now get table list from info schema
      // We'll query by trying to list from each expected table
      return await queryTablesFromSchema()
    }

    return data
  } catch (error) {
    console.error("❌ Error:", error.message)
    return null
  }
}

async function queryTablesFromSchema() {
  console.log("📋 Querying database schema...\n")

  // Expected tables based on DATABASE_SCHEMA.md
  const expectedTables = [
    // Core System (4)
    "users",
    "user_profiles",
    "user_preferences",
    "user_activity_log",

    // AI Analysis (4)
    "skin_analyses",
    "analyses",
    "analysis_history",
    "analytics_events",

    // Action Plans (6)
    "action_plans",
    "action_items",
    "smart_goals",
    "goal_milestones",
    "goal_check_ins",
    "goal_photos",

    // Booking System (4)
    "bookings",
    "appointments",
    "appointment_services",
    "availability_slots",

    // Clinic Management (4)
    "clinics",
    "clinic_staff",
    "services",
    "branches",

    // Chat System (4)
    "chat_rooms",
    "chat_messages",
    "chat_participants",
    "chat_read_status",

    // Queue System (4)
    "queue_entries",
    "queue_notifications",
    "queue_settings",
    "queue_statistics",

    // Inventory (3)
    "inventory_items",
    "inventory_categories",
    "inventory_suppliers",

    // Loyalty (4)
    "loyalty_tiers",
    "loyalty_rewards",
    "customer_loyalty_status",
    "points_transactions",

    // Marketing (3)
    "marketing_campaigns",
    "promo_codes",
    "customer_segments",

    // Sales (3)
    "sales_leads",
    "sales_proposals",
    "sales_activities",

    // Treatment (4)
    "treatments",
    "treatment_records",
    "treatment_photos",
    "treatment_outcomes",

    // Reports (3)
    "generated_reports",
    "report_schedules",
    "performance_metrics",

    // System (3)
    "error_logs",
    "invitations",
    "customers",

    // Additional tables
    "staff_members",
    "treatment_plans",
    "chat_history",
    "payment_records",
    "customer_notes",
    "presentation_sessions",
  ]

  const results = {
    existing: [],
    missing: [],
    withData: [],
    empty: [],
  }

  console.log(`Checking ${expectedTables.length} expected tables...\n`)

  for (const table of expectedTables) {
    try {
      const { count, error, data } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })

      if (error) {
        if (error.code === "PGRST103" || error.message.includes("does not exist")) {
          results.missing.push(table)
        } else {
          console.log(`⚠️  ${table}: ${error.message}`)
          results.missing.push(table)
        }
      } else {
        results.existing.push(table)
        if ((count || 0) > 0) {
          results.withData.push({ table, rows: count })
        } else {
          results.empty.push(table)
        }
      }
    } catch (error) {
      results.missing.push(table)
    }
  }

  return results
}

async function main() {
  const tableStatus = await getAllTables()

  if (!tableStatus) {
    const tableStatus = await queryTablesFromSchema()
  }

  if (tableStatus && tableStatus.existing) {
    const { existing, missing, withData, empty } = tableStatus

    console.log("\n" + "=" * 70)
    console.log("📊 TABLE STATISTICS")
    console.log("=" * 70)
    console.log(`✅ Existing tables: ${existing.length}`)
    console.log(`❌ Missing tables: ${missing.length}`)
    console.log(`📝 Tables with data: ${withData.length}`)
    console.log(`🟦 Empty tables: ${empty.length}`)

    if (withData.length > 0) {
      console.log("\n📝 TABLES WITH DATA:")
      console.log("-" * 70)
      withData.sort((a, b) => b.rows - a.rows).forEach(({ table, rows }) => {
        console.log(`  ✅ ${table.padEnd(30)} ${rows} rows`)
      })
    }

    if (empty.length > 0 && empty.length <= 20) {
      console.log("\n🟦 EMPTY TABLES (ready to populate):")
      console.log("-" * 70)
      empty.forEach((table) => {
        console.log(`  ⚪ ${table}`)
      })
    } else if (empty.length > 20) {
      console.log(`\n🟦 EMPTY TABLES: ${empty.length} tables (all ready)`)
    }

    if (missing.length > 0) {
      console.log("\n❌ MISSING TABLES:")
      console.log("-" * 70)
      missing.forEach((table) => {
        console.log(`  ❌ ${table}`)
      })

      console.log("\n💡 To create missing tables, run:")
      console.log("   pnpm supabase db push")
      console.log("   pnpm supabase migration up")
    }

    console.log("\n" + "=" * 70)
    console.log("SUMMARY")
    console.log("=" * 70)

    const percentage = Math.round((existing.length / (existing.length + missing.length)) * 100)
    const statusEmoji = percentage >= 90 ? "🟢" : percentage >= 70 ? "🟡" : "🔴"

    console.log(`${statusEmoji} Database Completeness: ${percentage}% (${existing.length}/${existing.length + missing.length} tables)`)

    if (missing.length === 0) {
      console.log("✅ All expected tables exist!")
    } else {
      console.log(`⚠️  ${missing.length} tables need to be created`)
    }

    process.exit(missing.length === 0 ? 0 : 1)
  } else {
    console.error("❌ Could not retrieve table information")
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
