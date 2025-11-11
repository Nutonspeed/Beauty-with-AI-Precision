#!/usr/bin/env node

/**
 * Get ALL tables from Supabase using pg_tables system catalog
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getAllTables() {
  console.log('\n📊 Fetching ALL Tables from Supabase Database\n');
  
  // Query pg_tables directly to get all public schema tables
  const { data, error } = await supabase.rpc('get_all_tables');
  
  if (error) {
    console.log('⚠️  RPC function not available, trying alternative method...\n');
    
    // Alternative: Try to list tables by querying information_schema through REST API
    // Since we can't execute raw SQL, let's try to access PostgREST API directly
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const tables = await response.json();
      console.log('✅ Found tables via PostgREST introspection');
      console.log(JSON.stringify(tables, null, 2));
    } else {
      console.log('❌ Could not fetch tables');
      console.log('\n💡 Solution: Run this SQL in Supabase SQL Editor:');
      console.log(`
-- Get all public schema tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Or get detailed info
SELECT 
  t.table_name,
  (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as column_count,
  pg_size_pretty(pg_total_relation_size(quote_ident(t.table_name)::regclass)) as size
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;
      `);
    }
  } else {
    console.log('✅ Tables found:');
    console.log(data);
  }
}

async function tryGetTablesList() {
  console.log('🔍 Attempting to list all available tables...\n');
  
  // Try to get OpenAPI spec which lists all tables
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          'Accept': 'application/openapi+json'
        }
      }
    );
    
    if (response.ok) {
      const spec = await response.json();
      
      if (spec.paths) {
        const tables = Object.keys(spec.paths)
          .filter(path => path.startsWith('/'))
          .map(path => path.substring(1))
          .filter(name => name && !name.includes('{'))
          .sort();
        
        console.log(`✅ Found ${tables.length} tables in PostgREST API:\n`);
        
        // Group by category
        const grouped = {
          auth: [],
          booking: [],
          analysis: [],
          clinic: [],
          user: [],
          product: [],
          finance: [],
          other: []
        };
        
        tables.forEach(table => {
          if (table.includes('auth') || table.includes('user')) {
            grouped.user.push(table);
          } else if (table.includes('book') || table.includes('appointment')) {
            grouped.booking.push(table);
          } else if (table.includes('analysis') || table.includes('skin') || table.includes('ai')) {
            grouped.analysis.push(table);
          } else if (table.includes('clinic') || table.includes('branch') || table.includes('staff')) {
            grouped.clinic.push(table);
          } else if (table.includes('product') || table.includes('inventory') || table.includes('stock')) {
            grouped.product.push(table);
          } else if (table.includes('payment') || table.includes('invoice') || table.includes('sale')) {
            grouped.finance.push(table);
          } else {
            grouped.other.push(table);
          }
        });
        
        console.log('📋 Users & Auth:');
        grouped.user.forEach(t => console.log(`   - ${t}`));
        
        console.log('\n📅 Booking & Appointments:');
        grouped.booking.forEach(t => console.log(`   - ${t}`));
        
        console.log('\n🔬 Analysis & AI:');
        grouped.analysis.forEach(t => console.log(`   - ${t}`));
        
        console.log('\n🏥 Clinic & Staff:');
        grouped.clinic.forEach(t => console.log(`   - ${t}`));
        
        console.log('\n📦 Products & Inventory:');
        grouped.product.forEach(t => console.log(`   - ${t}`));
        
        console.log('\n💰 Finance & Sales:');
        grouped.finance.forEach(t => console.log(`   - ${t}`));
        
        console.log('\n📊 Other Tables:');
        grouped.other.forEach(t => console.log(`   - ${t}`));
        
        console.log(`\n✅ Total: ${tables.length} tables\n`);
        
        return tables;
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  return null;
}

async function getTableCounts(tables) {
  console.log('\n📊 Getting record counts...\n');
  
  const results = [];
  
  for (const table of tables.slice(0, 20)) { // Test first 20
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        results.push({ table, count: count || 0 });
      }
    } catch (err) {
      // Skip tables we can't access
    }
  }
  
  results.sort((a, b) => b.count - a.count);
  
  console.log('Top tables by record count:');
  results.slice(0, 10).forEach(({ table, count }) => {
    console.log(`   ${count.toString().padStart(6)} records - ${table}`);
  });
}

async function main() {
  const tables = await tryGetTablesList();
  
  if (tables && tables.length > 0) {
    await getTableCounts(tables);
  }
  
  console.log('\n✅ Done!\n');
}

main().catch(console.error);
