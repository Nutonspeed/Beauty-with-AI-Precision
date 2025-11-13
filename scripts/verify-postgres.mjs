#!/usr/bin/env node

/**
 * Verify PostgreSQL schema using env connection with smart fallbacks.
 * - Prefers POSTGRES_URL_NON_POOLING, then POSTGRES_URL, then POSTGRES_PRISMA_URL
 * - Handles self-signed certs and pooler port fallback automatically
 */

import pg from "pg"
import dotenv from "dotenv"
import * as p from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = p.dirname(__filename)

dotenv.config({ path: p.join(__dirname, "../.env.local") })

const pickUrl = () => {
  return (
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ""
  )
}

const baseUrl = pickUrl()
if (!baseUrl) {
  console.error("❌ Missing POSTGRES_URL env. Set POSTGRES_URL_NON_POOLING or POSTGRES_URL.")
  process.exit(1)
}

const makeClient = (connectionString, ssl) => new pg.Client({ connectionString, ssl })

const variants = () => {
  const out = []
  // 1) as-is with ssl disabled verify
  out.push({ url: baseUrl, ssl: { rejectUnauthorized: false } })

  // 2) remove sslmode param
  try {
    const u = new URL(baseUrl)
    u.searchParams.delete("sslmode")
    out.push({ url: u.toString(), ssl: { rejectUnauthorized: false } })

    // 3) try pooler 6543 and strip sslmode
    const pooled = new URL(u.toString())
    if (pooled.port === "5432" || pooled.port === "") pooled.port = "6543"
    out.push({ url: pooled.toString(), ssl: undefined })
  } catch {
    // ignore URL parse errors
  }
  return out
}

console.log("🔍 DIRECT POSTGRESQL SCHEMA QUERY\n")
console.log("Trying connection variants...\n")

let client
let lastErr
for (const v of variants()) {
  try {
    client = makeClient(v.url, v.ssl)
    await client.connect()
    console.log(`✅ Connected using: ${v.url}\n`)
    break
  } catch (e) {
    lastErr = e
    try { await client?.end() } catch {}
    client = undefined
  }
}

if (!client) {
  console.error("❌ Failed to connect to PostgreSQL.")
  console.error(lastErr?.message || lastErr)
  process.exit(1)
}

// Query 1: Count all tables in public schema
const countResult = await client.query(`
  SELECT COUNT(*) as total
  FROM information_schema.tables
  WHERE table_schema = 'public'
`)

const totalTables = Number.parseInt(countResult.rows[0].total)
console.log(`📊 Total objects in public (tables/views): ${totalTables}\n`)

// Query 2: List all tables with row count (public schema only)
const tablesResult = await client.query(`
  SELECT tablename
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename
`)

const tables = tablesResult.rows

console.log("📋 ALL TABLES IN DATABASE:\n")

let totalRows = 0
const tablesWithData = []

for (const table of tables) {
  try {
    const rowCountResult = await client.query(`SELECT COUNT(*) as count FROM "${table.tablename}"`)
    const rowCount = Number.parseInt(rowCountResult.rows[0].count)
    totalRows += rowCount
    const status = rowCount > 0 ? "📝" : "⚪"
    console.log(`${status} ${table.tablename.padEnd(35)} ${String(rowCount).padStart(6)} rows`)
    if (rowCount > 0) tablesWithData.push({ name: table.tablename, count: rowCount })
  } catch {
    console.log(`❌ ${table.tablename.padEnd(35)} [Error reading]`)
  }
}

console.log("\n" + "=".repeat(70))
console.log("SUMMARY")
console.log("=".repeat(70))
console.log(`✅ Total objects: ${totalTables}`)
console.log(`📝 Tables with data: ${tablesWithData.length}`)
console.log(`📊 Total rows in database: ${totalRows}`)

if (tablesWithData.length > 0) {
  console.log("\n🔝 Top tables by row count:")
  for (const { name, count } of tablesWithData.sort((a, b) => b.count - a.count).slice(0, 10)) {
    console.log(`   • ${name}: ${count} rows`)
  }
}

console.log("\n✅ Database verification complete!")

await client.end()
