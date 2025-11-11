#!/usr/bin/env node

/**
 * Apply Critical Infrastructure Migration
 * Creates profiles view for backward compatibility
 */

import postgres from 'postgres'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const connectionString = 'postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'

console.log('🔄 Connecting to Supabase...\n')

const sql = postgres(connectionString, {
  ssl: false,
  max: 1,
})

async function applyMigration() {
  try {
    console.log('📝 Reading migration file...')
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250128_create_profiles_view.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('✅ Migration file loaded\n')

    console.log('🚀 Applying migration: Create profiles view...\n')

    // Execute the migration
    await sql.unsafe(migrationSQL)

    console.log('✅ Migration applied successfully!\n')

    // Verify the view was created
    console.log('🔍 Verifying profiles view...')
    
    const viewExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
      );
    `

    if (viewExists[0].exists) {
      console.log('✅ profiles view created successfully\n')

      // Test the view
      console.log('🧪 Testing view with sample query...')
      const sampleData = await sql`
        SELECT id, email, role, full_name 
        FROM profiles 
        LIMIT 3;
      `

      if (sampleData.length > 0) {
        console.log(`✅ View is working! Found ${sampleData.length} user(s):\n`)
        sampleData.forEach(user => {
          console.log(`   📧 ${user.email} (${user.role})`)
        })
      } else {
        console.log('ℹ️  View is working but no users found in database')
      }
    } else {
      console.log('❌ profiles view was not created')
    }

    console.log('\n✅ Migration completed!')
    console.log('\n📌 Next steps:')
    console.log('1. Run: node scripts/create-test-users-admin.mjs')
    console.log('2. Run: pnpm test:e2e\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code) console.error('   Code:', error.code)
    if (error.detail) console.error('   Detail:', error.detail)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

applyMigration()
