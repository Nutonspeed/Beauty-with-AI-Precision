#!/usr/bin/env tsx
/**
 * Database Health Check Script
 * Verifies Supabase database setup and connectivity
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials")
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface CheckResult {
  name: string
  status: "pass" | "fail" | "warn"
  message: string
  details?: any
}

const results: CheckResult[] = []

async function checkConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        results.push({
          name: "Database Connection",
          status: "warn",
          message: "Connected but tables not created yet",
          details: error.message,
        })
      } else {
        results.push({
          name: "Database Connection",
          status: "fail",
          message: "Connection failed",
          details: error.message,
        })
      }
    } else {
      results.push({
        name: "Database Connection",
        status: "pass",
        message: "Successfully connected to Supabase",
      })
    }
  } catch (error) {
    results.push({
      name: "Database Connection",
      status: "fail",
      message: "Connection error",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

async function checkTables() {
  const requiredTables = ["users", "tenants", "user_profiles", "skin_analyses", "treatment_plans", "bookings"]

  const tableStatus: Record<string, boolean> = {}

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select("count").limit(1)
      tableStatus[table] = !error
    } catch {
      tableStatus[table] = false
    }
  }

  const existingTables = Object.entries(tableStatus)
    .filter(([_, exists]) => exists)
    .map(([name]) => name)
  const missingTables = Object.entries(tableStatus)
    .filter(([_, exists]) => !exists)
    .map(([name]) => name)

  if (missingTables.length === 0) {
    results.push({
      name: "Database Tables",
      status: "pass",
      message: `All ${requiredTables.length} tables exist`,
      details: existingTables,
    })
  } else if (existingTables.length === 0) {
    results.push({
      name: "Database Tables",
      status: "fail",
      message: "No tables found - run migration script",
      details: { missing: missingTables },
    })
  } else {
    results.push({
      name: "Database Tables",
      status: "warn",
      message: `${missingTables.length} tables missing`,
      details: { existing: existingTables, missing: missingTables },
    })
  }
}

async function checkRLS() {
  try {
    // Try to query without auth - should fail if RLS is working
    const anonClient = createClient(supabaseUrl!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseKey!)

    const { data, error } = await anonClient.from("users").select("*")

    if (error || (data && data.length === 0)) {
      results.push({
        name: "Row Level Security",
        status: "pass",
        message: "RLS is properly configured",
      })
    } else {
      results.push({
        name: "Row Level Security",
        status: "warn",
        message: "RLS may not be configured correctly",
        details: "Unauthenticated query returned data",
      })
    }
  } catch (error) {
    results.push({
      name: "Row Level Security",
      status: "warn",
      message: "Could not verify RLS",
      details: error instanceof Error ? error.message : String(error),
    })
  }
}

async function checkEnvironment() {
  const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  const missingVars = requiredVars.filter((v) => !process.env[v])

  if (missingVars.length === 0) {
    results.push({
      name: "Environment Variables",
      status: "pass",
      message: "All required variables are set",
    })
  } else {
    results.push({
      name: "Environment Variables",
      status: "fail",
      message: `Missing ${missingVars.length} required variables`,
      details: missingVars,
    })
  }
}

function printResults() {
  console.log("\n" + "=".repeat(60))
  console.log("🔍 DATABASE HEALTH CHECK REPORT")
  console.log("=".repeat(60) + "\n")

  let passCount = 0
  let failCount = 0
  let warnCount = 0

  results.forEach((result) => {
    const icon = result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⚠️"
    console.log(`${icon} ${result.name}`)
    console.log(`   ${result.message}`)

    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`)
    }
    console.log()

    if (result.status === "pass") passCount++
    else if (result.status === "fail") failCount++
    else warnCount++
  })

  console.log("=".repeat(60))
  console.log(`Summary: ${passCount} passed, ${warnCount} warnings, ${failCount} failed`)
  console.log("=".repeat(60) + "\n")

  if (failCount > 0) {
    console.log("❌ Critical issues found. Please fix before deploying.")
    console.log("\nNext steps:")
    console.log("1. Run the migration script in Supabase SQL Editor:")
    console.log("   scripts/00-complete-migration.sql")
    console.log("2. Set missing environment variables in Vercel")
    console.log("3. Run this check again: pnpm check:db\n")
    process.exit(1)
  } else if (warnCount > 0) {
    console.log("⚠️  Some warnings found. Review before deploying.")
    process.exit(0)
  } else {
    console.log("✅ All checks passed! Database is ready for deployment.")
    process.exit(0)
  }
}

async function main() {
  console.log("Starting database health check...\n")

  await checkEnvironment()
  await checkConnection()
  await checkTables()
  await checkRLS()

  printResults()
}

main().catch((error) => {
  console.error("❌ Health check failed:", error)
  process.exit(1)
})
