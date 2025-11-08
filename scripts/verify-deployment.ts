#!/usr/bin/env tsx
/**
 * Deployment Verification Script
 * Checks all critical systems before deployment
 */

import { createClient } from "@supabase/supabase-js"

interface CheckResult {
  name: string
  status: "pass" | "fail" | "warn"
  message: string
  details?: string
}

const results: CheckResult[] = []

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
}

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function addResult(result: CheckResult) {
  results.push(result)
  const icon = result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⚠️"
  const color = result.status === "pass" ? "green" : result.status === "fail" ? "red" : "yellow"
  log(`${icon} ${result.name}: ${result.message}`, color)
  if (result.details) {
    log(`   ${result.details}`, "reset")
  }
}

async function checkEnvironmentVariables() {
  log("\n📋 Checking Environment Variables...", "blue")

  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  const optional = ["NEXTAUTH_SECRET", "NEXTAUTH_URL", "VERCEL_AI_GATEWAY_KEY"]

  let allPresent = true
  const missing: string[] = []

  for (const key of required) {
    if (!process.env[key]) {
      allPresent = false
      missing.push(key)
    }
  }

  if (allPresent) {
    addResult({
      name: "Required Environment Variables",
      status: "pass",
      message: "All required variables present",
      details: `Checked: ${required.join(", ")}`,
    })
  } else {
    addResult({
      name: "Required Environment Variables",
      status: "fail",
      message: "Missing required variables",
      details: `Missing: ${missing.join(", ")}`,
    })
  }

  // Check optional
  const missingOptional = optional.filter((key) => !process.env[key])
  if (missingOptional.length > 0) {
    addResult({
      name: "Optional Environment Variables",
      status: "warn",
      message: "Some optional variables missing",
      details: `Missing: ${missingOptional.join(", ")}`,
    })
  }
}

async function checkSupabaseConnection() {
  log("\n🔌 Checking Supabase Connection...", "blue")

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const { error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      if (error.message.includes("does not exist")) {
        addResult({
          name: "Supabase Connection",
          status: "fail",
          message: "Connected but tables not created",
          details: "Run database migrations first",
        })
      } else {
        addResult({
          name: "Supabase Connection",
          status: "fail",
          message: "Connection failed",
          details: error.message,
        })
      }
    } else {
      addResult({
        name: "Supabase Connection",
        status: "pass",
        message: "Connected successfully",
      })
    }
  } catch (error) {
    addResult({
      name: "Supabase Connection",
      status: "fail",
      message: "Connection error",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

async function checkDatabaseTables() {
  log("\n🗄️  Checking Database Tables...", "blue")

  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const requiredTables = [
      "users",
      "user_profiles",
      "skin_analyses",
      "analysis_history",
      "treatments",
      "products",
      "appointments",
      "notifications",
    ]

    const missingTables: string[] = []

    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select("count").limit(1)
      if (error && error.message.includes("does not exist")) {
        missingTables.push(table)
      }
    }

    if (missingTables.length === 0) {
      addResult({
        name: "Database Tables",
        status: "pass",
        message: "All required tables exist",
        details: `Verified: ${requiredTables.length} tables`,
      })
    } else {
      addResult({
        name: "Database Tables",
        status: "fail",
        message: "Missing tables",
        details: `Missing: ${missingTables.join(", ")}`,
      })
    }
  } catch (error) {
    addResult({
      name: "Database Tables",
      status: "fail",
      message: "Could not verify tables",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

async function checkBuildConfiguration() {
  log("\n⚙️  Checking Build Configuration...", "blue")

  try {
    const packageJson = await import("../package.json")

    // Check critical dependencies
    const criticalDeps = ["next", "react", "@supabase/supabase-js", "@supabase/ssr", "next-auth"]

    const missing = criticalDeps.filter(
      (dep) =>
        !(packageJson.dependencies as Record<string, string>)[dep] &&
        !(packageJson.devDependencies as Record<string, string> | undefined)?.[dep]
    )

    if (missing.length === 0) {
      addResult({
        name: "Critical Dependencies",
        status: "pass",
        message: "All critical dependencies present",
      })
    } else {
      addResult({
        name: "Critical Dependencies",
        status: "fail",
        message: "Missing dependencies",
        details: missing.join(", "),
      })
    }

    // Check for Prisma (should be removed)
    if (packageJson.dependencies["@prisma/client"] || packageJson.dependencies["prisma"]) {
      addResult({
        name: "Prisma Dependencies",
        status: "warn",
        message: "Prisma still in dependencies",
        details: "Should be removed after Supabase migration",
      })
    } else {
      addResult({
        name: "Prisma Dependencies",
        status: "pass",
        message: "Prisma successfully removed",
      })
    }
  } catch (error) {
    addResult({
      name: "Build Configuration",
      status: "fail",
      message: "Could not read package.json",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

async function generateReport() {
  log("\n" + "=".repeat(60), "bold")
  log("📊 DEPLOYMENT VERIFICATION REPORT", "bold")
  log("=".repeat(60), "bold")

  const passed = results.filter((r) => r.status === "pass").length
  const failed = results.filter((r) => r.status === "fail").length
  const warnings = results.filter((r) => r.status === "warn").length
  const total = results.length

  log(`\nTotal Checks: ${total}`, "blue")
  log(`✅ Passed: ${passed}`, "green")
  log(`❌ Failed: ${failed}`, "red")
  log(`⚠️  Warnings: ${warnings}`, "yellow")

  const score = Math.round((passed / total) * 100)
  log(`\n📈 Readiness Score: ${score}%`, score >= 80 ? "green" : score >= 60 ? "yellow" : "red")

  if (failed > 0) {
    log("\n🚨 CRITICAL ISSUES - NOT READY FOR DEPLOYMENT", "red")
    log("\nFailed Checks:", "red")
    results
      .filter((r) => r.status === "fail")
      .forEach((r) => {
        log(`  • ${r.name}: ${r.message}`, "red")
        if (r.details) log(`    ${r.details}`, "reset")
      })
  } else if (warnings > 0) {
    log("\n⚠️  WARNINGS - Review before deployment", "yellow")
    log("\nWarnings:", "yellow")
    results
      .filter((r) => r.status === "warn")
      .forEach((r) => {
        log(`  • ${r.name}: ${r.message}`, "yellow")
        if (r.details) log(`    ${r.details}`, "reset")
      })
  } else {
    log("\n✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT", "green")
  }

  log("\n" + "=".repeat(60), "bold")

  return failed === 0
}

async function main() {
  log("🚀 Starting Deployment Verification...", "bold")
  log("Time: " + new Date().toISOString(), "blue")

  await checkEnvironmentVariables()
  await checkSupabaseConnection()
  await checkDatabaseTables()
  await checkBuildConfiguration()

  const isReady = await generateReport()

  process.exit(isReady ? 0 : 1)
}

main().catch((error) => {
  log("\n💥 Verification script failed:", "red")
  console.error(error)
  process.exit(1)
})
