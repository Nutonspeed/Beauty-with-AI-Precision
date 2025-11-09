#!/usr/bin/env node

/**
 * Fix dependencies: Replace "latest" with specific versions
 * This script reads package.json, replaces "latest" with actual installed versions from node_modules
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔧 Fixing dependencies in package.json...\n');

// Read package.json
const packageJsonPath = join(rootDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

// Count "latest" occurrences
let latestCount = 0;
let fixedCount = 0;

// Helper function to get installed version from node_modules
function getInstalledVersion(packageName) {
  try {
    const pkgPath = join(rootDir, 'node_modules', packageName, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return pkg.version;
  } catch (err) {
    return null;
  }
}

// Fix dependencies
function fixDependencies(deps, section) {
  if (!deps) return;
  
  console.log(`\n📦 Fixing ${section}:`);
  
  for (const [name, version] of Object.entries(deps)) {
    if (version === 'latest') {
      latestCount++;
      const installedVersion = getInstalledVersion(name);
      
      if (installedVersion) {
        // Use caret (^) for flexibility
        deps[name] = `^${installedVersion}`;
        fixedCount++;
        console.log(`  ✅ ${name}: "latest" → "^${installedVersion}"`);
      } else {
        console.log(`  ⚠️  ${name}: Cannot find installed version (keeping "latest")`);
      }
    }
  }
}

// Fix TensorFlow conflicts manually
console.log('\n🔧 Fixing TensorFlow conflicts:');

if (packageJson.dependencies) {
  // Remove face-detection (conflicts with deeplab)
  if (packageJson.dependencies['@tensorflow-models/face-detection']) {
    console.log('  ⚠️  Removing @tensorflow-models/face-detection (conflicts with deeplab)');
    delete packageJson.dependencies['@tensorflow-models/face-detection'];
  }
  
  // Or keep face-detection and remove deeplab
  // Uncomment if you need face-detection instead:
  // if (packageJson.dependencies['@tensorflow-models/deeplab']) {
  //   console.log('  ⚠️  Removing @tensorflow-models/deeplab (conflicts with face-detection)');
  //   delete packageJson.dependencies['@tensorflow-models/deeplab'];
  // }
}

// Fix all sections
fixDependencies(packageJson.dependencies, 'dependencies');
fixDependencies(packageJson.devDependencies, 'devDependencies');
fixDependencies(packageJson.optionalDependencies, 'optionalDependencies');

// Write back to package.json
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log(`  Found "latest": ${latestCount}`);
console.log(`  Fixed: ${fixedCount}`);
console.log(`  Failed: ${latestCount - fixedCount}`);
console.log('='.repeat(60));

if (fixedCount > 0) {
  console.log('\n✅ Done! package.json has been updated.');
  console.log('\n📝 Next steps:');
  console.log('  1. Review changes: git diff package.json');
  console.log('  2. Clean install: Remove-Item -Recurse -Force node_modules; npm install');
  console.log('  3. Test dev: npm run dev');
  console.log('  4. Test build: npm run build');
  console.log('  5. Commit: git add package.json && git commit -m "chore: pin dependencies"');
} else {
  console.log('\n⚠️  No changes made. Check if node_modules exists.');
  console.log('Run: npm install (to populate node_modules first)');
}
