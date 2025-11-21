#!/usr/bin/env node

/**
 * Exclude Demo Pages from Production Build
 * 
 * This script identifies and excludes demo/test pages from production builds
 * to reduce bundle size significantly.
 * 
 * Usage:
 * - Set EXCLUDE_DEMOS=true in production environment
 * - Or run: node scripts/exclude-demo-pages.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.join(__dirname, '..', 'app');

// Demo/test directories to exclude in production
const DEMO_PATTERNS = [
  'robot-3d',
  'robot-showcase',
  'advanced-sphere',
  'premium-scroll',
  'scroll-demo',
  'action-plan-demo',
  'ai-chat-demo',
  'ai-recommender-demo',
  'ai-test',
  'analysis-progress-demo',
  'booking-demo',
  'concern-education-demo',
  'minitap-clone-v2',
  'minitap-demo',
  'mobile-optimization-demo',
  'mobile-test',
  'pdf-demo',
  'progress-tracking-demo',
  'shop-demo',
  'storage-demo',
  'test-ai',
  'test-ai-huggingface',
  'test-ai-performance',
  'video-consultation-demo',
  'worker-test',
];

function getDemoDirectories() {
  const demos = [];
  for (const pattern of DEMO_PATTERNS) {
    const demoPath = path.join(appDir, pattern);
    if (fs.existsSync(demoPath)) {
      demos.push({ name: pattern, path: demoPath });
    }
  }
  return demos;
}

function calculateSize(dirPath) {
  let totalSize = 0;
  const files = fs.readdirSync(dirPath, { recursive: true, withFileTypes: true });
  
  for (const file of files) {
    if (file.isFile()) {
      const filePath = path.join(file.path || dirPath, file.name);
      try {
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      } catch (err) {
        // Skip files we can't read
      }
    }
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

console.log('\n📊 Demo Pages Analysis\n');
console.log('=' .repeat(60));

const demos = getDemoDirectories();
let totalSize = 0;

console.log(`\nFound ${demos.length} demo/test directories:\n`);

demos.forEach(({ name, path: demoPath }) => {
  const size = calculateSize(demoPath);
  totalSize += size;
  console.log(`  ✓ ${name.padEnd(35)} ${formatBytes(size)}`);
});

console.log('\n' + '='.repeat(60));
console.log(`\n💾 Total size of demo pages: ${formatBytes(totalSize)}`);
console.log(`📦 Estimated bundle reduction: ~${formatBytes(totalSize * 0.3)} (after minification)\n`);

console.log('🔧 To exclude these from production build:');
console.log('   1. Set EXCLUDE_DEMOS=true in .env.production');
console.log('   2. Or add to Vercel environment variables');
console.log('   3. Build will skip these directories\n');

// Create .env.production.example if it doesn't exist
const envExample = path.join(__dirname, '..', '.env.production.example');
if (!fs.existsSync(envExample)) {
  fs.writeFileSync(envExample, `# Exclude demo pages from production build
EXCLUDE_DEMOS=true

# Other production settings
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
`);
  console.log('✓ Created .env.production.example\n');
}

export { DEMO_PATTERNS, getDemoDirectories };
