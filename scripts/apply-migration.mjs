#!/usr/bin/env node
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const { Client } = pg;

async function applyMigration() {
  const migrationFile = process.argv[2];
  
  if (!migrationFile) {
    console.error('❌ Usage: node apply-migration.mjs <migration-file-path>');
    process.exit(1);
  }

  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ POSTGRES_URL not found in environment');
    process.exit(1);
  }

  const cleanUrl = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
  const client = new Client({ 
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // Read migration file
    const migrationSQL = await readFile(migrationFile, 'utf-8');
    console.log(`📄 Applying migration: ${migrationFile}\n`);
    console.log('─'.repeat(80));

    // Execute migration
    const result = await client.query(migrationSQL);
    
    console.log('─'.repeat(80));
    console.log('\n✅ Migration applied successfully!\n');

    // Show any notices
    if (result && result.rows) {
      result.rows.forEach(row => {
        console.log(row);
      });
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

await applyMigration();
