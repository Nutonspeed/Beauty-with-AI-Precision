#!/usr/bin/env node

/**
 * Break down object counts by table_type and list non-base tables in public schema.
 */

import pg from "pg"
import dotenv from "dotenv"
import * as p from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = p.dirname(__filename)

dotenv.config({ path: p.join(__dirname, "../.env.local") })

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL
if (!url) {
  console.error("❌ Missing POSTGRES_URL env")
  process.exit(1)
}

// Prefer pooler and no sslmode verify if present
let connectionString = url
try {
  const u = new URL(url)
  u.searchParams.delete("sslmode")
  if (u.port === "5432" || u.port === "") u.port = "6543"
  connectionString = u.toString()
} catch {}

const client = new pg.Client({ connectionString })

await client.connect()

const byType = await client.query(`
  SELECT table_type, COUNT(*)::int as count
  FROM information_schema.tables
  WHERE table_schema='public'
  GROUP BY table_type
  ORDER BY table_type
`)

const total = byType.rows.reduce((a, r) => a + r.count, 0)
console.log("📊 Object counts by type (public):")
for (const r of byType.rows) console.log(` - ${r.table_type}: ${r.count}`)
console.log(` - TOTAL: ${total}`)

const nonBase = await client.query(`
  SELECT table_name, table_type
  FROM information_schema.tables
  WHERE table_schema='public' AND table_type <> 'BASE TABLE'
  ORDER BY table_name
`)

if (nonBase.rows.length) {
  console.log("\n🧾 Non-base objects in public:")
  for (const r of nonBase.rows) console.log(` - ${r.table_name} (${r.table_type})`)
}

await client.end()
