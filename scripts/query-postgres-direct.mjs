#!/usr/bin/env node

/**
 * Query PostgreSQL directly to verify actual table count and structure
 */

import pg from "pg"
import * as p from "node:path"
import { fileURLToPath } from "node:url"
import dotenv from "dotenv"

const __filename = fileURLToPath(import.meta.url)
const __dirname = p.dirname(__filename)

dotenv.config({ path: p.join(__dirname, "../.env.local") })

const POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

if (!POSTGRES_URL) {
  console.error("❌ Missing POSTGRES_URL in environment")
  process.exit(1)
}

console.log("🔍 DIRECT POSTGRESQL SCHEMA QUERY\n")
console.log("Connecting to PostgreSQL...")

const client = new pg.Client({
  connectionString: POSTGRES_URL,
})

try {
  await client.connect()
  console.log("✅ Connected to PostgreSQL\n")

  // Query 1: Count all tables in public schema
  const countResult = await client.query(`
    SELECT COUNT(*) as total
    FROM information_schema.tables
    WHERE table_schema = 'public'
  `)

  const totalTables = countResult.rows[0].total
  console.log(`📊 Total tables in public schema: ${totalTables}\n`)

  // Query 2: List all tables with row count
  const tablesResult = await client.query(`
    SELECT 
      tablename,
      schemaname,
      (SELECT count(*) FROM pg_class p 
       JOIN pg_namespace n ON p.relnamespace = n.oid 
       WHERE n.nspname = t.schemaname AND p.relname = t.tablename) as rows
    FROM pg_tables t
    WHERE schemaname = 'public'
    ORDER BY tablename
  `)

  const tables = tablesResult.rows

  console.log("📋 ALL TABLES IN DATABASE:\n")

  let totalRows = 0
  const tablesWithData = []

  for (const table of tables) {
    try {
      // Get actual row count
      const rowCountResult = await client.query(`SELECT COUNT(*) as count FROM "${table.tablename}"`)
      const rowCount = parseInt(rowCountResult.rows[0].count)
      totalRows += rowCount

      const status = rowCount > 0 ? "📝" : "⚪"
      console.log(`${status} ${table.tablename.padEnd(35)} ${String(rowCount).padStart(6)} rows`)

      if (rowCount > 0) {
        tablesWithData.push({ name: table.tablename, count: rowCount })
      }
    } catch (err) {
      console.log(`❌ ${table.tablename.padEnd(35)} [Error reading]`)
    }
  }

  console.log("\n" + "=" * 70)
  console.log("SUMMARY")
  console.log("=" * 70)
  console.log(`✅ Total tables: ${totalTables}`)
  console.log(`📝 Tables with data: ${tablesWithData.length}`)
  console.log(`📊 Total rows in database: ${totalRows}`)

  if (tablesWithData.length > 0) {
    console.log("\n🔝 Top tables by row count:")
    tablesWithData.sort((a, b) => b.count - a.count).slice(0, 10).forEach(({ name, count }) => {
      console.log(`   • ${name}: ${count} rows`)
    })
  }

  // Query 3: Check for any hidden/system tables
  const systemResult = await client.query(`
    SELECT COUNT(*) as count
    FROM information_schema.tables
    WHERE table_schema NOT IN ('public', 'information_schema', 'pg_catalog')
  `)

  const systemTableCount = systemResult.rows[0].count
  if (systemTableCount > 0) {
    console.log(`\n⚠️  Found ${systemTableCount} tables in non-public schemas`)
  }

  console.log("\n✅ Database verification complete!")

  await client.end()
  process.exit(0)
} catch (error) {
  console.error("❌ Error:", error.message)
  await client.end()
  process.exit(1)
}
