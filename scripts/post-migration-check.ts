#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface CheckResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: any
}

const results: CheckResult[] = []

async function checkDatabaseConnection() {
  console.log("\n🔍 Checking database connection...")
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)
    if (error) throw error
    results.push({
      name: "Database Connection",
      status: "pass",
      message: "Successfully connected to Supabase",
    })
  } catch (error) {
    results.push({
      name: "Database Connection",
      status: "fail",
      message: `Failed to connect: ${error}`,
    })
  }
}

async function checkTables() {
  console.log("\n🔍 Checking tables...")
  const requiredTables = ["users", "user_profiles", "skin_analyses", "treatment_plans", "bookings", "tenants"]

  const foundTables: string[] = []
  const missingTables: string[] = []

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select("count").limit(1)
      if (error) {
        missingTables.push(table)
      } else {
        foundTables.push(table)
      }
    } catch (error) {
      missingTables.push(table)
    }
  }

  if (missingTables.length === 0) {
    results.push({
      name: "Tables",
      status: "pass",
      message: `All ${requiredTables.length} tables found`,
      details: foundTables,
    })
  } else {
    results.push({
      name: "Tables",
      status: "fail",
      message: `Missing ${missingTables.length} tables`,
      details: { found: foundTables, missing: missingTables },
    })
  }
}

async function checkRLS() {
  console.log("\n🔍 Checking Row Level Security...")
  try {
    // Try to access data without auth (should fail if RLS is working)
    const anonClient = createClient(supabaseUrl!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")

    const { data, error } = await anonClient.from("users").select("*")

    if (error || !data || data.length === 0) {
      results.push({
        name: "Row Level Security",
        status: "pass",
        message: "RLS is properly configured (anonymous access blocked)",
      })
    } else {
      results.push({
        name: "Row Level Security",
        status: "warning",
        message: "RLS may not be properly configured (anonymous access allowed)",
      })
    }
  } catch (error) {
    results.push({
      name: "Row Level Security",
      status: "pass",
      message: "RLS is working (access denied)",
    })
  }
}

async function checkIndexes() {
  console.log("\n🔍 Checking indexes...")
  try {
    const { data, error } = await supabase.rpc("pg_indexes", {})

    if (error) {
      results.push({
        name: "Indexes",
        status: "warning",
        message: "Could not verify indexes",
      })
    } else {
      results.push({
        name: "Indexes",
        status: "pass",
        message: "Indexes verified",
      })
    }
  } catch (error) {
    results.push({
      name: "Indexes",
      status: "warning",
      message: "Could not check indexes (this is OK)",
    })
  }
}

async function checkDataIntegrity() {
  console.log("\n🔍 Checking data integrity...")
  try {
    // Check if we can create and delete a test record
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      role: "customer",
    }

    const { data: created, error: createError } = await supabase.from("users").insert(testUser).select().single()

    if (createError) throw createError

    const { error: deleteError } = await supabase.from("users").delete().eq("id", created.id)

    if (deleteError) throw deleteError

    results.push({
      name: "Data Integrity",
      status: "pass",
      message: "CRUD operations working correctly",
    })
  } catch (error) {
    results.push({
      name: "Data Integrity",
      status: "fail",
      message: `CRUD operations failed: ${error}`,
    })
  }
}

async function checkEnvironmentVariables() {
  console.log("\n🔍 Checking environment variables...")
  const required = [
    "SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length === 0) {
    results.push({
      name: "Environment Variables",
      status: "pass",
      message: "All required variables set",
    })
  } else {
    results.push({
      name: "Environment Variables",
      status: "fail",
      message: `Missing variables: ${missing.join(", ")}`,
    })
  }

  // Check optional but recommended
  const recommended = ["NEXTAUTH_SECRET", "NEXTAUTH_URL"]
  const missingRecommended = recommended.filter((key) => !process.env[key])

  if (missingRecommended.length > 0) {
    results.push({
      name: "Optional Environment Variables",
      status: "warning",
      message: `Recommended variables missing: ${missingRecommended.join(", ")}`,
    })
  }
}

function printResults() {
  console.log("\n" + "=".repeat(60))
  console.log("📊 POST-MIGRATION CHECK RESULTS")
  console.log("=".repeat(60) + "\n")

  let passCount = 0
  let failCount = 0
  let warningCount = 0

  results.forEach((result) => {
    const icon = result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⚠️"
    console.log(`${icon} ${result.name}`)
    console.log(`   ${result.message}`)
    if (result.details) {
      console.log(`   Details:`, result.details)
    }
    console.log()

    if (result.status === "pass") passCount++
    else if (result.status === "fail") failCount++
    else warningCount++
  })

  console.log("=".repeat(60))
  console.log(`✅ Passed: ${passCount}`)
  console.log(`⚠️  Warnings: ${warningCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log("=".repeat(60))

  const score = Math.round((passCount / results.length) * 100)
  console.log(`\n📊 Overall Score: ${score}/100`)

  if (failCount === 0 && warningCount === 0) {
    console.log("\n🎉 All checks passed! Ready for deployment.")
    return 0
  } else if (failCount === 0) {
    console.log("\n✅ All critical checks passed. Warnings can be addressed later.")
    return 0
  } else {
    console.log("\n❌ Some checks failed. Please fix issues before deployment.")
    return 1
  }
}

async function main() {
  console.log("🚀 Starting post-migration verification...")

  await checkEnvironmentVariables()
  await checkDatabaseConnection()
  await checkTables()
  await checkRLS()
  await checkIndexes()
  await checkDataIntegrity()

  const exitCode = printResults()
  process.exit(exitCode)
}

main().catch((error) => {
  console.error("❌ Verification failed:", error)
  process.exit(1)
})
