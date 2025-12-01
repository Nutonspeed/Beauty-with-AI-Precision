#!/usr/bin/env node

/**
 * Node.js Upgrade Script
 * 
 * Upgrades Node.js to v20.19+ for Prisma compatibility
 * 
 * Usage: node scripts/upgrade-node.js
 */

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔄 Node.js Upgrade Script\n')

// Check current Node.js version
function checkCurrentVersion() {
  return new Promise((resolve) => {
    exec('node -v', (error, stdout) => {
      if (error) {
        console.log('❌ Node.js not found')
        resolve(null)
        return
      }
      
      const version = stdout.trim()
      console.log(`📌 Current Node.js version: ${version}`)
      
      // Parse version number
      const match = version.match(/v(\d+)\.(\d+)\.(\d+)/)
      if (match) {
        const major = parseInt(match[1])
        const minor = parseInt(match[2])
        
        if (major > 20 || (major === 20 && minor >= 19)) {
          console.log('✅ Node.js version meets Prisma requirements (v20.19+)')
          resolve({ version, compatible: true })
        } else {
          console.log('⚠️  Node.js version below Prisma requirements (v20.19+)')
          resolve({ version, compatible: false })
        }
      } else {
        console.log('❌ Unable to parse Node.js version')
        resolve({ version, compatible: false })
      }
    })
  })
}

// Check package manager
function checkPackageManager() {
  return new Promise((resolve) => {
    exec('pnpm -v', (error, stdout) => {
      if (error) {
        console.log('❌ PNPM not found. Installing PNPM...')
        exec('npm install -g pnpm', (installError) => {
          if (installError) {
            console.log('❌ Failed to install PNPM')
            resolve(false)
          } else {
            console.log('✅ PNPM installed')
            resolve(true)
          }
        })
      } else {
        console.log(`✅ PNPM version: ${stdout.trim()}`)
        resolve(true)
      }
    })
  })
}

// Upgrade Node.js instructions
function showUpgradeInstructions(currentVersion) {
  console.log('\n📋 Node.js Upgrade Instructions:')
  
  if (process.platform === 'win32') {
    console.log('\n🪟 Windows:')
    console.log('1. Download Node.js v20.19+ from: https://nodejs.org/')
    console.log('2. Run the installer (it will upgrade automatically)')
    console.log('3. Restart your terminal/command prompt')
    console.log('4. Verify: node -v')
  } else if (process.platform === 'darwin') {
    console.log('\n🍎 macOS:')
    console.log('Option 1 - Homebrew:')
    console.log('  brew install node@20')
    console.log('  brew unlink node && brew link --overwrite node@20')
    console.log('')
    console.log('Option 2 - NVM:')
    console.log('  nvm install 20')
    console.log('  nvm use 20')
    console.log('  nvm alias default 20')
  } else {
    console.log('\n🐧 Linux:')
    console.log('Option 1 - NVM:')
    console.log('  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash')
    console.log('  source ~/.bashrc')
    console.log('  nvm install 20')
    console.log('  nvm use 20')
    console.log('')
    console.log('Option 2 - Package Manager:')
    console.log('  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -')
    console.log('  sudo apt-get install -y nodejs')
  }
  
  console.log('\n⚠️  After upgrade:')
  console.log('1. Restart this terminal')
  console.log('2. Reinstall dependencies: pnpm install')
  console.log('3. Test build: pnpm run build')
}

// Update package.json engines
function updatePackageJson() {
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    
    if (!packageJson.engines) {
      packageJson.engines = {}
    }
    
    packageJson.engines.node = '>=20.19.0'
    packageJson.engines.pnpm = '>=8.0.0'
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    console.log('✅ Updated package.json engines')
    
  } catch (error) {
    console.log('⚠️  Could not update package.json:', error.message)
  }
}

// Create .nvmrc file
function createNvmrc() {
  const nvmrcPath = path.join(process.cwd(), '.nvmrc')
  
  try {
    fs.writeFileSync(nvmrcPath, '20\n')
    console.log('✅ Created .nvmrc file (Node.js v20)')
  } catch (error) {
    console.log('⚠️  Could not create .nvmrc:', error.message)
  }
}

// Test Prisma compatibility
function testPrismaCompatibility() {
  return new Promise((resolve) => {
    console.log('\n🧪 Testing Prisma compatibility...')
    
    exec('pnpm run db:generate', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Prisma test failed:', error.message)
        resolve(false)
      } else {
        console.log('✅ Prisma compatibility test passed')
        resolve(true)
      }
    })
  })
}

// Main upgrade function
async function upgrade() {
  try {
    console.log('🚀 Starting Node.js upgrade process...\n')
    
    // Check current version
    const versionInfo = await checkCurrentVersion()
    
    if (!versionInfo) {
      console.log('\n❌ Please install Node.js first')
      return
    }
    
    if (versionInfo.compatible) {
      console.log('\n✅ Node.js is already compatible!')
      
      // Test Prisma anyway
      const prismaCompatible = await testPrismaCompatibility()
      if (prismaCompatible) {
        console.log('\n🎉 Everything is ready!')
      } else {
        console.log('\n⚠️  Node.js version is OK but Prisma test failed')
      }
      return
    }
    
    // Check package manager
    const pnpmAvailable = await checkPackageManager()
    if (!pnpmAvailable) return
    
    // Show upgrade instructions
    showUpgradeInstructions(versionInfo.version)
    
    // Update configuration files
    updatePackageJson()
    createNvmrc()
    
    console.log('\n📝 Configuration updated:')
    console.log('- package.json engines field')
    console.log('- .nvmrc file for NVM users')
    
    console.log('\n🔄 After upgrading Node.js:')
    console.log('1. Restart terminal')
    console.log('2. Run: pnpm install')
    console.log('3. Run: pnpm run build')
    console.log('4. Run: pnpm run db:generate')
    
    console.log('\n📖 For detailed upgrade instructions, see: docs/NODE_UPGRADE.md')
    
  } catch (error) {
    console.error('❌ Upgrade process failed:', error.message)
  }
}

// Run upgrade
upgrade()
