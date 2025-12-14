#!/usr/bin/env node
/**
 * Script to seed test sales leads into the database.
 * Requires DATABASE_URL from .env.local
 */

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

function missingEnv(msg) {
  console.error('Missing required env vars:', msg)
  console.error('Please ensure POSTGRES_URL_NON_POOLING is set in .env.local')
  process.exit(1)
}

const databaseUrl = process.env.POSTGRES_URL_NON_POOLING
if (!databaseUrl) {
  missingEnv('POSTGRES_URL_NON_POOLING is required')
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})

async function seedSalesLeads() {
  const client = await pool.connect()
  try {
    console.log('Connected to database')

    await client.query('BEGIN')

    // Get the sales user IDs (assume seeded users)
    const { rows: users } = await client.query(
      "SELECT id, email FROM users WHERE email IN ('admin@local.test', 'clinic-owner@example.com')"
    )

    if (users.length === 0) {
      throw new Error('No users found. Run seed-test-users.js first.')
    }

    const salesUserId = users[0].id // Use first user

    console.log('Inserting test sales leads')

    const testLeads = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        phone: '081-234-5678',
        primary_concern: 'Wrinkles',
        secondary_concerns: ['Pigmentation'],
        estimated_value: 45000,
        score: 65,
        status: 'qualified'
      },
      {
        name: 'Emma Wilson',
        email: 'emma.w@email.com',
        phone: '082-345-6789',
        primary_concern: 'Elasticity',
        secondary_concerns: ['Wrinkles'],
        estimated_value: 55000,
        score: 58,
        status: 'contacted'
      },
      {
        name: 'Michael Chen',
        email: 'michael.c@email.com',
        phone: '083-456-7890',
        primary_concern: 'Pores',
        secondary_concerns: ['Hydration'],
        estimated_value: 35000,
        score: 78,
        status: 'new'
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.a@email.com',
        phone: '084-567-8901',
        primary_concern: 'Pigmentation',
        secondary_concerns: ['Wrinkles'],
        estimated_value: 85000,
        score: 55,
        status: 'qualified'
      }
    ]

    for (const lead of testLeads) {
      await client.query(
        `INSERT INTO sales_leads (
          name, email, phone, primary_concern, secondary_concerns,
          estimated_value, score, status, sales_user_id, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          score = EXCLUDED.score,
          status = EXCLUDED.status`,
        [
          lead.name,
          lead.email,
          lead.phone,
          lead.primary_concern,
          JSON.stringify(lead.secondary_concerns),
          lead.estimated_value,
          lead.score,
          lead.status,
          salesUserId
        ]
      )
    }

    await client.query('COMMIT')
    console.log('Seeding sales leads complete.')
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {})
    console.error('Failed to seed sales leads:', err.message || err)
    process.exitCode = 2
  } finally {
    client.release()
    await pool.end()
  }
}

seedSalesLeads().catch((err) => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
