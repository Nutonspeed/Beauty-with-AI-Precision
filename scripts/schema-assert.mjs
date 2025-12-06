#!/usr/bin/env node

/**
 * Assert public schema counts: BASE TABLES and VIEWS.
 * Usage: node scripts/schema-assert.mjs --tables 78 --views 2
 * Exit code 0 if match, 1 otherwise.
 */

import pg from "pg"
import dotenv from "dotenv"
import * as p from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = p.dirname(__filename)

dotenv.config({ path: p.join(__dirname, "../.env.local") })

const argv = new Map()
for (let i = 2; i < process.argv.length; i += 2) {
  const k = process.argv[i]
  const v = process.argv[i + 1]
  if (!k?.startsWith("--")) continue
  argv.set(k.slice(2), v)
}

const expectedTables = Number.parseInt(argv.get("tables") || "78")
const expectedViews = Number.parseInt(argv.get("views") || "2")

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL
if (!url) {
  console.error("❌ Missing POSTGRES_URL env")
  process.exit(1)
}

let connectionString = url
try {
  const u = new URL(url)
  u.searchParams.delete("sslmode")
  connectionString = u.toString()
} catch {}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } })
client.on("error", (err) => {
  console.warn("schema-assert client error (ignored):", err?.message || err)
})

try {
  await client.connect()
  const res = await client.query(`
    SELECT table_type, COUNT(*)::int AS count
    FROM information_schema.tables
    WHERE table_schema='public'
    GROUP BY table_type
  `)

  let baseTables = 0
  let views = 0
  for (const r of res.rows) {
    if (r.table_type === "BASE TABLE") baseTables = r.count
    if (r.table_type === "VIEW") views = r.count
  }

  const ok = baseTables === expectedTables && views === expectedViews
  console.log(JSON.stringify({ baseTables, views, expectedTables, expectedViews, ok }, null, 2))

  await client.end()
  process.exit(ok ? 0 : 1)
} catch (e) {
  console.error("❌ schema-assert error:", e.message)
  try { await client.end() } catch {}
  process.exit(1)
}
