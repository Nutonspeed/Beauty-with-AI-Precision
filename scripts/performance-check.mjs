#!/usr/bin/env node

/**
 * Performance Check Script
 * ตรวจสอบ performance metrics ของ ClinicIQ
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 ClinicIQ Performance Check\n');
console.log('='.repeat(50));

// Check bundle size
async function checkBundleSize() {
  console.log('\n📦 Bundle Size Analysis:\n');
  
  const nextDir = path.join(rootDir, '.next');
  
  if (!fs.existsSync(nextDir)) {
    console.log('❌ .next directory not found. Run `pnpm build` first.');
    return;
  }
  
  const staticDir = path.join(nextDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    console.log('⚠️ Static directory not found.');
    return;
  }
  
  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        totalSize += stat.size;
        if (file.endsWith('.js')) jsSize += stat.size;
        if (file.endsWith('.css')) cssSize += stat.size;
      }
    }
  }
  
  walkDir(staticDir);
  
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  console.log(`  Total Static Size: ${formatSize(totalSize)}`);
  console.log(`  JavaScript: ${formatSize(jsSize)}`);
  console.log(`  CSS: ${formatSize(cssSize)}`);
  
  // Thresholds
  const jsThreshold = 500 * 1024; // 500KB
  const cssThreshold = 100 * 1024; // 100KB
  
  if (jsSize > jsThreshold) {
    console.log(`\n  ⚠️ JavaScript bundle is large (>${formatSize(jsThreshold)})`);
    console.log('     Consider code splitting or lazy loading.');
  } else {
    console.log(`\n  ✅ JavaScript bundle size is acceptable`);
  }
  
  if (cssSize > cssThreshold) {
    console.log(`  ⚠️ CSS bundle is large (>${formatSize(cssThreshold)})`);
  } else {
    console.log(`  ✅ CSS bundle size is acceptable`);
  }
}

// Check image optimization
async function checkImages() {
  console.log('\n🖼️ Image Optimization Check:\n');
  
  const publicDir = path.join(rootDir, 'public');
  
  if (!fs.existsSync(publicDir)) {
    console.log('  ⚠️ Public directory not found.');
    return;
  }
  
  let largeImages = [];
  let unoptimizedFormats = [];
  
  function checkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        checkDir(filePath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(ext)) {
          if (stat.size > 500 * 1024) { // > 500KB
            largeImages.push({ path: filePath.replace(rootDir, ''), size: stat.size });
          }
          if (['.bmp', '.gif'].includes(ext) && stat.size > 100 * 1024) {
            unoptimizedFormats.push(filePath.replace(rootDir, ''));
          }
        }
      }
    }
  }
  
  checkDir(publicDir);
  
  if (largeImages.length > 0) {
    console.log(`  ⚠️ Found ${largeImages.length} large images (>500KB):`);
    largeImages.slice(0, 5).forEach(img => {
      console.log(`     - ${img.path} (${(img.size / 1024).toFixed(0)}KB)`);
    });
    if (largeImages.length > 5) {
      console.log(`     ... and ${largeImages.length - 5} more`);
    }
  } else {
    console.log('  ✅ No oversized images found');
  }
  
  if (unoptimizedFormats.length > 0) {
    console.log(`\n  ⚠️ Consider converting to WebP:`);
    unoptimizedFormats.slice(0, 3).forEach(img => {
      console.log(`     - ${img}`);
    });
  }
}

// Check dependencies
async function checkDependencies() {
  console.log('\n📚 Dependencies Check:\n');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  
  const deps = Object.keys(packageJson.dependencies || {}).length;
  const devDeps = Object.keys(packageJson.devDependencies || {}).length;
  
  console.log(`  Production dependencies: ${deps}`);
  console.log(`  Dev dependencies: ${devDeps}`);
  
  // Check for common heavy packages
  const heavyPackages = ['moment', 'lodash', 'jquery', 'bootstrap'];
  const foundHeavy = heavyPackages.filter(pkg => 
    packageJson.dependencies?.[pkg] || packageJson.devDependencies?.[pkg]
  );
  
  if (foundHeavy.length > 0) {
    console.log(`\n  ⚠️ Heavy packages found: ${foundHeavy.join(', ')}`);
    console.log('     Consider using lighter alternatives.');
  } else {
    console.log('  ✅ No common heavy packages detected');
  }
}

// Check pages count
async function checkPages() {
  console.log('\n📄 Pages Analysis:\n');
  
  const appDir = path.join(rootDir, 'app');
  let pageCount = 0;
  let apiCount = 0;
  
  function countPages(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (file === 'api') {
          // Count API routes
          countAPIs(filePath);
        } else {
          countPages(filePath);
        }
      } else if (file === 'page.tsx' || file === 'page.ts') {
        pageCount++;
      }
    }
  }
  
  function countAPIs(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        countAPIs(filePath);
      } else if (file === 'route.ts' || file === 'route.tsx') {
        apiCount++;
      }
    }
  }
  
  countPages(appDir);
  
  console.log(`  Total Pages: ${pageCount}`);
  console.log(`  API Routes: ${apiCount}`);
  
  if (pageCount > 100) {
    console.log('\n  ℹ️ Large number of pages - ensure code splitting is effective');
  }
}

// Run all checks
async function main() {
  await checkBundleSize();
  await checkImages();
  await checkDependencies();
  await checkPages();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Performance check complete!\n');
  
  console.log('📊 Next Steps:');
  console.log('   1. Run `npx lighthouse http://localhost:3000 --view`');
  console.log('   2. Check Core Web Vitals in Chrome DevTools');
  console.log('   3. Analyze bundle with `pnpm analyze` (if configured)');
  console.log('');
}

main().catch(console.error);
