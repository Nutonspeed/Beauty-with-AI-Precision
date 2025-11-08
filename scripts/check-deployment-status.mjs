#!/usr/bin/env node

/**
 * Deployment Status Checker
 * ตรวจสอบความพร้อมก่อน Deploy
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'OPENAI_API_KEY',
];

const OPTIONAL_ENV_VARS = [];

console.log('🔍 === DEPLOYMENT STATUS CHECKER ===\n');

// Check 1: Environment Variables
console.log('📋 Step 1: Environment Variables\n');

let missingVars = [];
let optionalMissingVars = [];

for (const varName of REQUIRED_ENV_VARS) {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`  ❌ ${varName}: MISSING (REQUIRED)`);
    missingVars.push(varName);
  } else {
    // Show first 20 chars for security
    const preview = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`  ✅ ${varName}: ${preview}`);
  }
}

for (const varName of OPTIONAL_ENV_VARS) {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`  ⚠️  ${varName}: MISSING (OPTIONAL)`);
    optionalMissingVars.push(varName);
  } else {
    const preview = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`  ✅ ${varName}: ${preview}`);
  }
}

console.log();

// Check 2: Google Credentials File
console.log('📋 Step 2: Google Cloud Credentials\n');

const googleCredsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (googleCredsPath && fs.existsSync(googleCredsPath)) {
  try {
    const creds = JSON.parse(fs.readFileSync(googleCredsPath, 'utf8'));
    console.log(`  ✅ File exists: ${googleCredsPath}`);
    console.log(`  ✅ Project ID: ${creds.project_id}`);
    console.log(`  ✅ Client Email: ${creds.client_email}`);
  } catch (error) {
    console.log(`  ❌ File exists but invalid JSON: ${error.message}`);
    missingVars.push('GOOGLE_APPLICATION_CREDENTIALS (invalid)');
  }
} else {
  console.log(`  ❌ File not found: ${googleCredsPath || 'not set'}`);
  missingVars.push('GOOGLE_APPLICATION_CREDENTIALS (file)');
}

console.log();

// Check 3: Supabase Connection & Database
console.log('📋 Step 3: Supabase Database\n');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('  ❌ Cannot check database (missing Supabase credentials)\n');
} else {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Test connection
    console.log('  🔌 Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('skin_analyses')
      .select('count')
      .limit(1);

    if (testError) {
      if (testError.message.includes('relation "skin_analyses" does not exist')) {
        console.log('  ❌ Table "skin_analyses" does not exist');
        console.log('  ⚠️  Migration NOT run yet!\n');
        console.log('  👉 Run migration SQL in Supabase Dashboard:');
        console.log('     https://supabase.com/dashboard\n');
        missingVars.push('DATABASE MIGRATION');
      } else {
        console.log(`  ❌ Database error: ${testError.message}\n`);
        missingVars.push('DATABASE CONNECTION');
      }
    } else {
      console.log('  ✅ Database connection: OK');
      console.log('  ✅ Table "skin_analyses": EXISTS');

      // Check storage bucket
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();

      if (bucketError) {
        console.log(`  ❌ Storage error: ${bucketError.message}`);
      } else {
        const skinBucket = buckets.find(b => b.name === 'skin-analysis-images');
        if (skinBucket) {
          console.log('  ✅ Storage bucket "skin-analysis-images": EXISTS');
        } else {
          console.log('  ❌ Storage bucket "skin-analysis-images": NOT FOUND');
          console.log('  ⚠️  Migration may be incomplete!\n');
          missingVars.push('STORAGE BUCKET');
        }
      }
    }
  } catch (error) {
    console.log(`  ❌ Supabase error: ${error.message}\n`);
    missingVars.push('SUPABASE CONNECTION');
  }
}

console.log();

// Check 4: Required Files
console.log('📋 Step 4: Required Files\n');

const requiredFiles = [
  'lib/ai/hybrid-skin-analyzer.ts',
  'lib/ai/google-vision.ts',
  'lib/ai/openai-vision.ts',
  'app/api/skin-analysis/analyze/route.ts',
  'app/analysis/detail/[id]/page.tsx',
  'components/skin-analysis-upload.tsx',
  'supabase/migrations/20250101_skin_analyses.sql',
];

for (const filePath of requiredFiles) {
  const fullPath = join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ ${filePath}`);
  } else {
    console.log(`  ❌ ${filePath} (MISSING)`);
    missingVars.push(`FILE: ${filePath}`);
  }
}

console.log();

// Final Summary
console.log('=' .repeat(60));
console.log('📊 DEPLOYMENT STATUS SUMMARY\n');

if (missingVars.length === 0) {
  console.log('✅ ALL CHECKS PASSED! System is ready to deploy.\n');
  console.log('Next steps:');
  console.log('  1. Run: pnpm dev');
  console.log('  2. Test: http://localhost:3000/analysis');
  console.log('  3. Upload image and analyze');
  console.log('  4. Verify VISIA report displays');
  console.log('  5. Deploy: vercel --prod\n');
} else {
  console.log(`❌ ${missingVars.length} ISSUE(S) FOUND:\n`);
  
  for (const item of missingVars) {
    console.log(`  ❌ ${item}`);
  }
  
  console.log('\n🔧 HOW TO FIX:\n');
  
  if (missingVars.includes('OPENAI_API_KEY')) {
    console.log('  1️⃣  Add OpenAI API Key:');
    console.log('      - Go to: https://platform.openai.com/api-keys');
    console.log('      - Create new key');
    console.log('      - Add to .env.local: OPENAI_API_KEY=sk-proj-xxx\n');
  }
  
  if (missingVars.includes('DATABASE MIGRATION')) {
    console.log('  2️⃣  Run Database Migration:');
    console.log('      - Open: https://supabase.com/dashboard');
    console.log('      - SQL Editor → New Query');
    console.log('      - Copy: supabase/migrations/20250101_skin_analyses.sql');
    console.log('      - Paste and Run\n');
  }
  
  if (missingVars.includes('STORAGE BUCKET')) {
    console.log('  3️⃣  Create Storage Bucket:');
    console.log('      - Included in migration SQL');
    console.log('      - Re-run migration if missing\n');
  }
  
  console.log('📖 See DEPLOYMENT_FINAL_CHECKLIST.md for detailed instructions.\n');
}

if (optionalMissingVars.length > 0) {
  console.log('⚠️  OPTIONAL FEATURES (not critical):\n');
  for (const item of optionalMissingVars) {
    console.log(`  ⚠️  ${item}`);
  }
  console.log();
}

console.log('=' .repeat(60));

// Exit with appropriate code
process.exit(missingVars.length === 0 ? 0 : 1);
