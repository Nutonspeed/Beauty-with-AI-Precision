#!/usr/bin/env node
/**
 * Simple script to seed test users into a PostgreSQL database.
 * Usage (PowerShell):
 *   $env:PGHOST='localhost'; $env:PGPORT='5432'; $env:PGUSER='postgres'; $env:PGPASSWORD='secret'; $env:PGDATABASE='mydb'; node ./scripts/seed-test-users.js
 *
 * WARNING: Run only against a local/test database. Do NOT run against production.
 */

const { Pool } = require('pg')

function missingEnv(msg) {
  console.error('Missing required env vars to run seed script:', msg)
  console.error('Please set PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE')
  process.exit(1)
}

const { PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE } = process.env
if (!PGHOST || !PGPORT || !PGUSER || !PGPASSWORD || !PGDATABASE) {
  missingEnv('one or more PG* environment variables are empty')
}

const pool = new Pool({
  host: PGHOST,
  port: Number(PGPORT),
  user: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
})

async function seed() {
  const client = await pool.connect()
  try {
    console.log('Connected to', PGHOST, 'database', PGDATABASE)

    await client.query('BEGIN')

    // Ensure pgcrypto available for crypt() usage (safe to run if extension exists)
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;")

    // NOTE: adapt table/column names to your project schema as needed
    // These inserts assume a table public.users with columns: email, password_hash, role, created_at
    console.log('Inserting test users (admin, clinic-owner) into public.users')

    await client.query(
      `INSERT INTO public.users (email, password_hash, role, created_at)
       VALUES ($1, crypt($2, gen_salt('bf')), $3, now())
       ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role`,
      ['admin@local.test', 'password123', 'super-admin']
    )

    await client.query(
      `INSERT INTO public.users (email, password_hash, role, created_at)
       VALUES ($1, crypt($2, gen_salt('bf')), $3, now())
       ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role`,
      ['clinic-owner@example.com', 'password123', 'clinic-owner']
    )

    await client.query('COMMIT')
    console.log('Seeding complete. Test users created/updated.')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('Failed to seed test users:', err.message || err)
    process.exitCode = 2
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch((err) => {
  console.error('Unhandled error in seed script:', err)
  process.exit(1)
})
