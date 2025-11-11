#!/usr/bin/env node

/**
 * List all tables and their structure from Supabase database
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

async function listTables() {
  console.log('\n📊 Database Tables Inventory\n');
  
  // Get all tables using service role
  const { data: skinAnalyses, error: saError } = await supabase
    .from('skin_analyses')
    .select('*', { count: 'exact', head: true });
  
  if (!saError) {
    console.log(`✅ skin_analyses - Records: ${skinAnalyses?.length || 0}`);
  }
  
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  if (!usersError) {
    console.log(`✅ users - Records: ${users?.length || 0}`);
  }
  
  // Try other common tables
  const tables = [
    'bookings',
    'appointments', 
    'treatments',
    'treatment_plans',
    'branches',
    'clinics',
    'products',
    'inventory',
    'sales',
    'customers',
    'staff',
    'analytics',
    'notifications',
    'chat_messages',
    'payments',
    'invoices'
  ];
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        console.log(`✅ ${table} - Records: ${count || 0}`);
      }
    } catch (err) {
      // Table doesn't exist, skip
    }
  }
}

async function getSampleData() {
  console.log('\n📋 Sample Data from Key Tables\n');
  
  // Get recent skin analyses
  const { data: analyses } = await supabase
    .from('skin_analyses')
    .select('id, user_id, created_at, quality_overall, image_url')
    .order('created_at', { ascending: false })
    .limit(3);
  
  if (analyses && analyses.length > 0) {
    console.log('Recent Skin Analyses:');
    analyses.forEach((a, i) => {
      console.log(`  ${i + 1}. ID: ${a.id.substring(0, 8)}...`);
      console.log(`     User: ${a.user_id.substring(0, 8)}...`);
      console.log(`     Date: ${a.created_at}`);
      console.log(`     Quality: ${a.quality_overall || 'null'}`);
    });
  }
  
  // Get users
  const { data: usersList } = await supabase
    .from('users')
    .select('id, email, role, created_at')
    .limit(5);
  
  if (usersList && usersList.length > 0) {
    console.log('\nUsers:');
    usersList.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.email} (${u.role})`);
    });
  }
}

async function getTableStructure() {
  console.log('\n🔍 Table Structure Details\n');
  
  // Get one record to see all columns
  const { data: sample } = await supabase
    .from('skin_analyses')
    .select('*')
    .limit(1)
    .single();
  
  if (sample) {
    console.log('skin_analyses columns:');
    Object.keys(sample).forEach(col => {
      const value = sample[col];
      const type = typeof value;
      console.log(`  - ${col}: ${type} ${value === null ? '(null)' : ''}`);
    });
  }
}

async function main() {
  await listTables();
  await getSampleData();
  await getTableStructure();
  
  console.log('\n✅ Done!\n');
}

main().catch(console.error);
