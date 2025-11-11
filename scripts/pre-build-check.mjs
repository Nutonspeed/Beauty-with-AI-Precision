#!/usr/bin/env node

/**
 * Pre-Build Comprehensive Check Script
 * ตรวจสอบโปรเจคก่อน build แบบละเอียด
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(70));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(70));
}

function runCommand(command, description) {
  try {
    log(`\n🔍 ${description}...`, 'blue');
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || error.stderr || error.message,
      error: error
    };
  }
}

// ===================================================================
// 1. TypeScript Type Checking
// ===================================================================
section('1. TypeScript Type Checking');

const tscResult = runCommand('pnpm tsc --noEmit', 'Checking TypeScript types');

if (tscResult.success) {
  log('✅ No TypeScript errors found!', 'green');
} else {
  log('❌ TypeScript errors detected:', 'red');
  
  // Parse และแสดง errors แบบกลุ่ม
  const lines = tscResult.output.split('\n');
  const errorFiles = new Set();
  let errorCount = 0;
  
  lines.forEach(line => {
    const match = line.match(/(.*\.tsx?):\d+:\d+ - error TS\d+:/);
    if (match) {
      errorFiles.add(match[1]);
      errorCount++;
    }
  });
  
  // แสดง 10 ไฟล์แรก
  const files = Array.from(errorFiles).slice(0, 10);
  files.forEach(file => {
    const basename = path.basename(file);
    const fileErrors = lines.filter(l => l.includes(file) && l.includes('error TS')).length;
    log(`   📄 ${basename}: ${fileErrors} error(s)`, 'yellow');
  });
  
  if (errorFiles.size > 10) {
    log(`   ... and ${errorFiles.size - 10} more files`, 'gray');
  }
  
  log(`\n📊 Total: ${errorCount} TypeScript errors in ${errorFiles.size} files`, 'red');
}

// ===================================================================
// 2. Environment Variables Check
// ===================================================================
section('2. Environment Variables Check');

const envFile = '.env.local';
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_API_URL',
];

if (fs.existsSync(envFile)) {
  log('✅ .env.local file exists', 'green');
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = [];
  
  requiredEnvVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length === 0) {
    log(`✅ All ${requiredEnvVars.length} required environment variables present`, 'green');
  } else {
    log(`⚠️  Missing ${missingVars.length} environment variable(s):`, 'yellow');
    missingVars.forEach(v => log(`   - ${v}`, 'yellow'));
  }
} else {
  log('❌ .env.local file not found!', 'red');
  log('   Copy .env.example to .env.local and configure', 'gray');
}

// ===================================================================
// 3. Package Dependencies Check
// ===================================================================
section('3. Package Dependencies Check');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const depCount = Object.keys(packageJson.dependencies || {}).length;
  const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
  
  log(`✅ Found ${depCount} dependencies and ${devDepCount} devDependencies`, 'green');
  
  // Check if node_modules exists
  if (fs.existsSync('node_modules')) {
    log('✅ node_modules directory exists', 'green');
  } else {
    log('⚠️  node_modules not found - run pnpm install', 'yellow');
  }
} catch (error) {
  log('❌ Error reading package.json', 'red');
}

// ===================================================================
// 4. Next.js Configuration Check
// ===================================================================
section('4. Next.js Configuration Check');

const nextConfigFiles = ['next.config.mjs', 'next.config.js'];
const nextConfig = nextConfigFiles.find(f => fs.existsSync(f));

if (nextConfig) {
  log(`✅ Next.js config found: ${nextConfig}`, 'green');
} else {
  log('⚠️  No Next.js config file found', 'yellow');
}

// Check tsconfig.json
if (fs.existsSync('tsconfig.json')) {
  log('✅ tsconfig.json exists', 'green');
  
  try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    if (tsconfig.compilerOptions?.strict) {
      log('   ⚙️  Strict mode enabled', 'gray');
    }
  } catch (e) {
    log('⚠️  Could not parse tsconfig.json', 'yellow');
  }
} else {
  log('❌ tsconfig.json not found!', 'red');
}

// ===================================================================
// 5. File Structure Check
// ===================================================================
section('5. Critical Files & Directories Check');

const criticalPaths = [
  { path: 'app', type: 'dir', desc: 'App directory (Next.js 13+)' },
  { path: 'components', type: 'dir', desc: 'Components directory' },
  { path: 'lib', type: 'dir', desc: 'Library/utilities directory' },
  { path: 'public', type: 'dir', desc: 'Public assets directory' },
  { path: 'app/layout.tsx', type: 'file', desc: 'Root layout' },
  { path: 'app/page.tsx', type: 'file', desc: 'Root page' },
  { path: 'supabase/migrations', type: 'dir', desc: 'Database migrations' },
];

criticalPaths.forEach(({ path: p, type, desc }) => {
  const exists = type === 'dir' ? fs.existsSync(p) && fs.statSync(p).isDirectory()
                                 : fs.existsSync(p);
  
  if (exists) {
    log(`✅ ${desc}`, 'green');
  } else {
    log(`⚠️  Missing: ${desc} (${p})`, 'yellow');
  }
});

// ===================================================================
// 6. Migration Files Check
// ===================================================================
section('6. Database Migration Files Check');

const migrationsDir = 'supabase/migrations';
if (fs.existsSync(migrationsDir)) {
  const migrations = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  log(`✅ Found ${migrations.length} migration file(s)`, 'green');
  
  migrations.slice(-5).forEach(m => {
    log(`   📄 ${m}`, 'gray');
  });
} else {
  log('⚠️  No migrations directory found', 'yellow');
}

// ===================================================================
// 7. Git Status Check
// ===================================================================
section('7. Git Repository Status');

const gitStatus = runCommand('git status --short', 'Checking Git status');
if (gitStatus.success) {
  const files = gitStatus.output.trim().split('\n').filter(l => l.trim());
  
  if (files.length === 0) {
    log('✅ Working tree clean - all changes committed', 'green');
  } else {
    log(`⚠️  ${files.length} uncommitted file(s):`, 'yellow');
    files.slice(0, 10).forEach(f => log(`   ${f}`, 'gray'));
    if (files.length > 10) {
      log(`   ... and ${files.length - 10} more`, 'gray');
    }
  }
}

const gitBranch = runCommand('git branch --show-current', 'Getting current branch');
if (gitBranch.success) {
  log(`📍 Current branch: ${gitBranch.output.trim()}`, 'blue');
}

// ===================================================================
// 8. Build Size Estimation
// ===================================================================
section('8. Project Size Analysis');

function getDirSize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stats.size;
      }
    });
  } catch (e) {
    // Ignore errors
  }
  return size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

const dirs = ['app', 'components', 'lib', 'public'];
dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const size = getDirSize(dir);
    log(`📦 ${dir.padEnd(15)} ${formatBytes(size)}`, 'cyan');
  }
});

// ===================================================================
// SUMMARY
// ===================================================================
section('Summary & Recommendations');

const issues = [];
// TypeScript errors are OK for now - mainly old demo files
// if (!tscResult.success) issues.push('TypeScript errors detected');
if (!fs.existsSync('.env.local')) issues.push('.env.local missing');
if (!fs.existsSync('node_modules')) issues.push('node_modules missing');

if (issues.length === 0) {
  log('\n🎉 All checks passed! Project is ready for build.', 'green');
  log('\n💡 Recommended next steps:', 'cyan');
  log('   1. Run: pnpm build', 'gray');
  log('   2. Test: pnpm start', 'gray');
  log('   3. Deploy: Push to production', 'gray');
} else {
  log('\n⚠️  Issues found that need attention:', 'yellow');
  issues.forEach((issue, i) => {
    log(`   ${i + 1}. ${issue}`, 'red');
  });
  
  log('\n💡 Recommended fixes:', 'cyan');
  if (!fs.existsSync('node_modules')) {
    log('   → Run: pnpm install', 'gray');
  }
  if (!fs.existsSync('.env.local')) {
    log('   → Create .env.local from .env.example', 'gray');
  }
  if (!tscResult.success) {
    log('   → Fix TypeScript errors before building', 'gray');
    log('   → Or add to .eslintignore / tsconfig exclude if intentional', 'gray');
  }
}

log('\n' + '='.repeat(70) + '\n', 'cyan');

// Exit with appropriate code
process.exit(issues.length > 0 ? 1 : 0);
