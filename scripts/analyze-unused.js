#!/usr/bin/env node

/**
 * Script to analyze unused pages and components
 * Helps identify legacy/deprecated code that can be removed
 */

const fs = require('fs');
const path = require('path');

const APP_DIR = path.join(__dirname, '..', 'app');
const COMPONENTS_DIR = path.join(__dirname, '..', 'components');
const LIB_DIR = path.join(__dirname, '..', 'lib');

// Known active pages (exclude these from unused check)
const ACTIVE_PAGES = [
  'page.tsx', // root
  'layout.tsx',
  'loading.tsx',
  'not-found.tsx',
  'global-error.tsx',
  'globals.css',

  // Auth
  'auth',

  // Main dashboards
  'sales',
  'clinic',
  'super-admin',
  'dashboard', // redirect page

  // Core features
  'analysis',
  'ar-simulator',
  'booking',
  'customer',

  // Active pages
  'profile',
  'settings',
  'unauthorized',
  'api',
  'queue',
  'treatment-plans',
  'reports',
  'branches',
  'inventory',
  'loyalty',
  'marketing',
  'users',
  'campaign-automation',
  'leads',
  'chat',
  'schedule',
  'recommendations',
  'progress',
  'security',
  'share',
  'payment',
  'offline',
  'performance-init.tsx',
  'sitemap.ts',

  // Internationalization
  '[locale]'
];

// Suspected unused/legacy pages
const POTENTIALLY_UNUSED = [
  'advanced-ai',
  'advanced-sphere',
  'ar-3d',
  'ar-advanced',
  'ar-live',
  'beta-signup',
  'clinic-admin',
  'interactive-sphere',
  'phase1-validation',
  'premium-scroll',
  'product-viewer',
  'robot-3d',
  'robot-showcase',
  'sales-narrative',
  'training',
  'onboarding',
  'beta-signup',
  'advanced-ai',
  'advanced-sphere',
  'ar-3d',
  'ar-advanced',
  'ar-live',
  'clinic-admin',
  'interactive-sphere',
  'phase1-validation',
  'premium-scroll',
  'product-viewer',
  'robot-3d',
  'robot-showcase',
  'sales-narrative',
  'training'
];

function analyzeDirectory(dir, prefix = '') {
  const items = fs.readdirSync(dir);
  const result = { pages: [], components: [], other: [] };

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (item.startsWith('.') || item === 'node_modules') continue;

      const subResult = analyzeDirectory(fullPath, prefix + item + '/');
      result.pages.push(...subResult.pages);
      result.components.push(...subResult.components);
      result.other.push(...subResult.other);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js')) {
      const relativePath = prefix + item;

      if (dir.includes('/app/')) {
        result.pages.push(relativePath);
      } else if (dir.includes('/components/')) {
        result.components.push(relativePath);
      } else {
        result.other.push(relativePath);
      }
    }
  }

  return result;
}

function findReferences(searchPaths, targetNames) {
  const references = {};

  for (const target of targetNames) {
    references[target] = { found: false, locations: [] };
  }

  function searchInFiles(dir) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);

      if (fs.statSync(fullPath).isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules') {
          searchInFiles(fullPath);
        }
        continue;
      }

      if (!item.endsWith('.tsx') && !item.endsWith('.ts') && !item.endsWith('.jsx') && !item.endsWith('.js')) {
        continue;
      }

      try {
        const content = fs.readFileSync(fullPath, 'utf8');

        for (const target of targetNames) {
          if (content.includes(target)) {
            references[target].found = true;
            references[target].locations.push(fullPath.replace(__dirname, '').substring(1));
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  for (const searchPath of searchPaths) {
    searchInFiles(searchPath);
  }

  return references;
}

async function main() {
  console.log('🔍 Analyzing unused pages and components...\n');

  // Analyze app directory
  console.log('📂 Scanning app directory...');
  const appAnalysis = analyzeDirectory(APP_DIR);

  console.log(`Found ${appAnalysis.pages.length} pages in app/`);

  // Check potentially unused pages
  console.log('\n⚠️  Checking potentially unused pages:');
  const references = findReferences([APP_DIR, COMPONENTS_DIR, LIB_DIR], POTENTIALLY_UNUSED);

  const unusedPages = [];
  const usedPages = [];

  for (const page of POTENTIALLY_UNUSED) {
    if (references[page].found) {
      usedPages.push(page);
      console.log(`✅ ${page} - USED in:`);
      references[page].locations.forEach(loc => console.log(`   - ${loc}`));
    } else {
      unusedPages.push(page);
      console.log(`❌ ${page} - UNUSED`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`- Total potentially unused pages: ${POTENTIALLY_UNUSED.length}`);
  console.log(`- Actually unused: ${unusedPages.length}`);
  console.log(`- Still used: ${usedPages.length}`);

  if (unusedPages.length > 0) {
    console.log('\n🗑️  Recommended for removal:');
    unusedPages.forEach(page => console.log(`   - app/${page}/`));
  }

  console.log('\n✅ Analysis complete!');
}

main().catch(console.error);
