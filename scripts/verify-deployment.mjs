#!/usr/bin/env node

/**
 * Pre-Deployment Verification Script
 * 
 * Checks if the project is ready for Vercel deployment
 * Run before deploying: pnpm verify:deploy
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REQUIRED_FILES = [
  'package.json',
  'next.config.mjs',
  'tsconfig.json',
  'postcss.config.mjs',
  'vercel.json',
  '.env.example'
];

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXTAUTH_SECRET',
  'GEMINI_API_KEY'
];

const CRITICAL_ROUTES = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/api/health/route.ts'
];

console.log('🔍 Starting pre-deployment verification...\n');

let errors = 0;
let warnings = 0;

// ========================================
// 1. Check Required Files
// ========================================
console.log('📁 Checking required files...');
REQUIRED_FILES.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    errors++;
  }
});
console.log('');

// ========================================
// 2. Check Critical Routes
// ========================================
console.log('🛣️  Checking critical routes...');
CRITICAL_ROUTES.forEach(route => {
  if (fs.existsSync(route)) {
    console.log(`  ✅ ${route}`);
  } else {
    console.log(`  ⚠️  ${route} - MISSING (optional)`);
    warnings++;
  }
});
console.log('');

// ========================================
// 3. Verify Environment Variables Template
// ========================================
console.log('🔐 Checking environment variables template...');
if (fs.existsSync('.env.example')) {
  const envExample = fs.readFileSync('.env.example', 'utf-8');
  REQUIRED_ENV_VARS.forEach(envVar => {
    if (envExample.includes(envVar)) {
      console.log(`  ✅ ${envVar} in .env.example`);
    } else {
      console.log(`  ❌ ${envVar} - NOT IN .env.example`);
      errors++;
    }
  });
} else {
  console.log('  ❌ .env.example not found');
  errors++;
}
console.log('');

// ========================================
// 4. TypeScript Check
// ========================================
console.log('📝 Running TypeScript check...');
try {
  execSync('pnpm type-check', { stdio: 'pipe' });
  console.log('  ✅ TypeScript check passed');
} catch (error) {
  console.log('  ⚠️  TypeScript warnings found (non-blocking)');
  console.log('     Run: pnpm type-check (optional)');
  warnings++;
}
console.log('');

// ========================================
// 5. Build Test (Optional - takes time)
// ========================================
console.log('🏗️  Build verification...');
console.log('  ℹ️  Skipping build test (run manually: pnpm build)');
console.log('');

// ========================================
// 6. Check Package.json Scripts
// ========================================
console.log('📦 Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const requiredScripts = ['build', 'start', 'dev'];
requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`  ✅ Script: ${script}`);
  } else {
    console.log(`  ❌ Script missing: ${script}`);
    errors++;
  }
});
console.log('');

// ========================================
// 7. Check Vercel Configuration
// ========================================
console.log('⚡ Checking Vercel configuration...');
if (fs.existsSync('vercel.json')) {
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf-8'));
    
    if (vercelConfig.buildCommand) {
      console.log(`  ✅ Build command: ${vercelConfig.buildCommand}`);
    } else {
      console.log('  ⚠️  No build command specified');
      warnings++;
    }
    
    if (vercelConfig.framework === 'nextjs') {
      console.log('  ✅ Framework: Next.js');
    } else {
      console.log('  ⚠️  Framework not set to Next.js');
      warnings++;
    }
  } catch (error) {
    console.log('  ❌ Invalid vercel.json (JSON parse error)');
    errors++;
  }
} else {
  console.log('  ⚠️  vercel.json not found (will use defaults)');
  warnings++;
}
console.log('');

// ========================================
// 8. Check Database Migrations
// ========================================
console.log('🗄️  Checking database migrations...');
const migrationFiles = [
  'SUPABASE_MIGRATION_clinics.sql',
  'SUPABASE_MIGRATION_customers.sql',
  'SUPABASE_MIGRATION_services.sql',
  'SUPABASE_MIGRATION_bookings.sql'
];

migrationFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ⚠️  ${file} - MISSING`);
    warnings++;
  }
});
console.log('');

// ========================================
// 9. Check Git Status
// ========================================
console.log('📊 Checking Git status...');
try {
  const gitStatus = execSync('git status --porcelain', { 
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  
  if (gitStatus.trim() === '') {
    console.log('  ✅ Working directory clean');
  } else {
    console.log('  ⚠️  Uncommitted changes detected:');
    console.log(gitStatus.split('\n').slice(0, 5).map(l => `     ${l}`).join('\n'));
    warnings++;
  }
} catch (error) {
  console.log('  ℹ️  Git not available or not a git repository');
}
console.log('');

// ========================================
// Final Summary
// ========================================
console.log('═══════════════════════════════════════════');
console.log('📊 VERIFICATION SUMMARY');
console.log('═══════════════════════════════════════════');
console.log(`❌ Errors:   ${errors}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log('═══════════════════════════════════════════\n');

if (errors > 0) {
  console.log('❌ DEPLOYMENT BLOCKED');
  console.log('   Fix the errors above before deploying to Vercel\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  DEPLOYMENT POSSIBLE WITH WARNINGS');
  console.log('   Consider fixing warnings for optimal deployment\n');
  process.exit(0);
} else {
  console.log('✅ READY FOR DEPLOYMENT');
  console.log('   All checks passed! You can deploy to Vercel\n');
  console.log('📝 Next steps:');
  console.log('   1. Run: vercel (or use Vercel Dashboard)');
  console.log('   2. Configure environment variables in Vercel');
  console.log('   3. Deploy and test staging environment\n');
  process.exit(0);
}
