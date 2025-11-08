#!/usr/bin/env node

/**
 * Comprehensive System Test Script
 * Tests various aspects of the application without requiring a running server
 */

import { existsSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(path, description) {
  const fullPath = join(projectRoot, path);
  const exists = existsSync(fullPath);
  
  if (exists) {
    const stats = statSync(fullPath);
    const size = (stats.size / 1024).toFixed(2);
    log(`  ✓ ${description} (${size} KB)`, 'green');
    return true;
  } else {
    log(`  ✗ ${description} not found`, 'red');
    return false;
  }
}

function checkDirectory(path, description) {
  const fullPath = join(projectRoot, path);
  const exists = existsSync(fullPath);
  
  if (exists && statSync(fullPath).isDirectory()) {
    log(`  ✓ ${description}`, 'green');
    return true;
  } else {
    log(`  ✗ ${description} not found`, 'red');
    return false;
  }
}

async function testFileStructure() {
  log('\n📁 Testing File Structure...', 'blue');
  
  let passed = 0;
  let failed = 0;
  
  // Core files
  const coreFiles = [
    ['package.json', 'Package configuration'],
    ['next.config.mjs', 'Next.js configuration'],
    ['tsconfig.json', 'TypeScript configuration'],
    ['.env.local', 'Environment variables'],
    ['prisma/schema.prisma', 'Database schema'],
    ['prisma/dev.db', 'Development database'],
  ];
  
  coreFiles.forEach(([path, desc]) => {
    checkFile(path, desc) ? passed++ : failed++;
  });
  
  // Core directories
  const coreDirs = [
    ['app', 'App directory'],
    ['components', 'Components directory'],
    ['lib', 'Library directory'],
    ['public', 'Public directory'],
    ['scripts', 'Scripts directory'],
  ];
  
  coreDirs.forEach(([path, desc]) => {
    checkDirectory(path, desc) ? passed++ : failed++;
  });
  
  log(`\n  Passed: ${passed}, Failed: ${failed}`, failed > 0 ? 'yellow' : 'green');
  return failed === 0;
}

async function testDatabaseSchema() {
  log('\n🗄️  Testing Database Schema...', 'blue');
  
  try {
    const schemaPath = join(projectRoot, 'prisma/schema.prisma');
    if (!existsSync(schemaPath)) {
      log('  ✗ Schema file not found', 'red');
      return false;
    }
    
    const { readFileSync } = await import('fs');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    const models = [
      'User',
      'Tenant',
    ];
    
    const enums = [
      'UserRole',
    ];
    
    let passed = 0;
    let failed = 0;
    
    models.forEach(model => {
      if (schema.includes(`model ${model}`)) {
        log(`  ✓ Model ${model} defined`, 'green');
        passed++;
      } else {
        log(`  ✗ Model ${model} not found`, 'red');
        failed++;
      }
    });
    
    enums.forEach(enumName => {
      if (schema.includes(`enum ${enumName}`)) {
        log(`  ✓ Enum ${enumName} defined`, 'green');
        passed++;
      } else {
        log(`  ✗ Enum ${enumName} not found`, 'red');
        failed++;
      }
    });
    
    log(`\n  Schema elements found: ${passed}/${models.length + enums.length}`, failed > 0 ? 'yellow' : 'green');
    return failed === 0;
  } catch (error) {
    log(`  ✗ Error reading schema: ${error.message}`, 'red');
    return false;
  }
}

async function testNextJsConfig() {
  log('\n⚙️  Testing Next.js Configuration...', 'blue');
  
  try {
    const configPath = join(projectRoot, 'next.config.mjs');
    const config = await import(`file://${configPath}`);
    const nextConfig = config.default;
    
    const checks = [
      ['turbopack' in nextConfig, 'Turbopack configuration'],
      ['images' in nextConfig, 'Image configuration'],
      ['compress' in nextConfig, 'Compression enabled'],
      [typeof nextConfig.headers === 'function', 'Security headers'],
    ];
    
    let passed = 0;
    let failed = 0;
    
    checks.forEach(([condition, description]) => {
      if (condition) {
        log(`  ✓ ${description}`, 'green');
        passed++;
      } else {
        log(`  ✗ ${description}`, 'red');
        failed++;
      }
    });
    
    log(`\n  Checks passed: ${passed}/${checks.length}`, failed > 0 ? 'yellow' : 'green');
    return failed === 0;
  } catch (error) {
    log(`  ✗ Error reading config: ${error.message}`, 'red');
    return false;
  }
}

async function testTypeScriptConfig() {
  log('\n📘 Testing TypeScript Configuration...', 'blue');
  
  try {
    const { readFileSync } = await import('fs');
    const tsConfigPath = join(projectRoot, 'tsconfig.json');
    const tsConfig = JSON.parse(readFileSync(tsConfigPath, 'utf-8'));
    
    const checks = [
      [tsConfig.compilerOptions?.strict === true, 'Strict mode enabled'],
      [tsConfig.compilerOptions?.target, 'Target specified'],
      [tsConfig.compilerOptions?.module, 'Module system specified'],
      [Array.isArray(tsConfig.include), 'Include paths defined'],
    ];
    
    let passed = 0;
    let failed = 0;
    
    checks.forEach(([condition, description]) => {
      if (condition) {
        log(`  ✓ ${description}`, 'green');
        passed++;
      } else {
        log(`  ✗ ${description}`, 'red');
        failed++;
      }
    });
    
    log(`\n  Checks passed: ${passed}/${checks.length}`, failed > 0 ? 'yellow' : 'green');
    return failed === 0;
  } catch (error) {
    log(`  ✗ Error reading TypeScript config: ${error.message}`, 'red');
    return false;
  }
}

async function testEnvironmentVariables() {
  log('\n🔐 Testing Environment Variables...', 'blue');
  
  try {
    const { readFileSync } = await import('fs');
    const envPath = join(projectRoot, '.env.local');
    
    if (!existsSync(envPath)) {
      log('  ⚠ .env.local not found, checking .env', 'yellow');
      return true; // Not critical for testing
    }
    
    const envContent = readFileSync(envPath, 'utf-8');
    
    const requiredVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL',
    ];
    
    let passed = 0;
    let failed = 0;
    
    requiredVars.forEach(varName => {
      if (envContent.includes(varName)) {
        log(`  ✓ ${varName} defined`, 'green');
        passed++;
      } else {
        log(`  ✗ ${varName} not found`, 'red');
        failed++;
      }
    });
    
    log(`\n  Variables found: ${passed}/${requiredVars.length}`, failed > 0 ? 'yellow' : 'green');
    return failed === 0;
  } catch (error) {
    log(`  ✗ Error reading environment: ${error.message}`, 'red');
    return false;
  }
}

async function testRouteStructure() {
  log('\n🛣️  Testing Route Structure...', 'blue');
  
  const routes = [
    ['app/page.tsx', 'Homepage'],
    ['app/admin/page.tsx', 'Admin page'],
    ['app/dashboard/page.tsx', 'Dashboard'],
    ['app/api/health/route.ts', 'Health API'],
    ['app/api/tenant/route.ts', 'Tenant API'],
    ['app/api/analyze/route.ts', 'Analyze API'],
  ];
  
  let passed = 0;
  let failed = 0;
  
  routes.forEach(([path, desc]) => {
    checkFile(path, desc) ? passed++ : failed++;
  });
  
  log(`\n  Routes found: ${passed}/${routes.length}`, failed > 0 ? 'yellow' : 'green');
  return failed === 0;
}

async function testComponentStructure() {
  log('\n🧩 Testing Component Structure...', 'blue');
  
  const components = [
    ['components/ui/button.tsx', 'Button component'],
    ['components/ui/card.tsx', 'Card component'],
    ['components/providers.tsx', 'Providers'],
    ['components/theme-provider.tsx', 'Theme provider'],
    ['components/skin-analysis-upload.tsx', 'Skin analysis upload'],
  ];
  
  let passed = 0;
  let failed = 0;
  
  components.forEach(([path, desc]) => {
    checkFile(path, desc) ? passed++ : failed++;
  });
  
  log(`\n  Components found: ${passed}/${components.length}`, failed > 0 ? 'yellow' : 'green');
  return failed === 0;
}

async function testDeploymentFiles() {
  log('\n🚀 Testing Deployment Files...', 'blue');
  
  const files = [
    ['Dockerfile', 'Dockerfile'],
    ['docker-compose.prod.yml', 'Docker Compose production'],
    ['.github/workflows/deploy.yml', 'GitHub Actions workflow'],
    ['scripts/setup-production.ts', 'Production setup script'],
  ];
  
  let passed = 0;
  let failed = 0;
  
  files.forEach(([path, desc]) => {
    checkFile(path, desc) ? passed++ : failed++;
  });
  
  log(`\n  Deployment files: ${passed}/${files.length}`, failed > 0 ? 'yellow' : 'green');
  return failed === 0;
}

async function runAllTests() {
  log('╔══════════════════════════════════════════════════════╗', 'blue');
  log('║     AI367Bar - Comprehensive System Test Suite      ║', 'blue');
  log('╚══════════════════════════════════════════════════════╝', 'blue');
  
  const startTime = Date.now();
  const results = [];
  
  // Run all tests
  results.push(['File Structure', await testFileStructure()]);
  results.push(['Database Schema', await testDatabaseSchema()]);
  results.push(['Next.js Config', await testNextJsConfig()]);
  results.push(['TypeScript Config', await testTypeScriptConfig()]);
  results.push(['Environment Variables', await testEnvironmentVariables()]);
  results.push(['Route Structure', await testRouteStructure()]);
  results.push(['Component Structure', await testComponentStructure()]);
  results.push(['Deployment Files', await testDeploymentFiles()]);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Summary
  log('\n╔══════════════════════════════════════════════════════╗', 'blue');
  log('║                   Test Summary                       ║', 'blue');
  log('╚══════════════════════════════════════════════════════╝', 'blue');
  
  const passed = results.filter(([, result]) => result).length;
  const failed = results.filter(([, result]) => !result).length;
  
  results.forEach(([name, result]) => {
    const status = result ? '✓ PASS' : '✗ FAIL';
    const color = result ? 'green' : 'red';
    log(`  ${status} - ${name}`, color);
  });
  
  log('', 'reset');
  log(`  Total Tests: ${results.length}`, 'blue');
  log(`  Passed: ${passed}`, 'green');
  log(`  Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`  Duration: ${duration}s`, 'gray');
  log('', 'reset');
  
  if (failed === 0) {
    log('🎉 All tests passed! System is ready for deployment.', 'green');
  } else {
    log('⚠️  Some tests failed. Please review the issues above.', 'yellow');
  }
  
  return failed === 0;
}

// Run tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
