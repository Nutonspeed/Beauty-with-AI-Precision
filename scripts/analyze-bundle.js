#!/usr/bin/env node

/**
 * Bundle Size Analyzer
 * 
 * Analyzes and optimizes bundle size for better performance
 */

const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const gzipSize = require('gzip-size')

console.log('📦 Analyzing Bundle Size...\n')

// Check if next-bundle-analyzer is available
function checkBundleAnalyzer() {
  return new Promise((resolve) => {
    exec('pnpm list @next/bundle-analyzer', (error, stdout) => {
      if (error) {
        console.log('📥 Installing @next/bundle-analyzer...')
        exec('pnpm add -D @next/bundle-analyzer', (installError) => {
          if (installError) {
            console.log('❌ Failed to install bundle analyzer')
            resolve(false)
          } else {
            console.log('✅ Bundle analyzer installed')
            resolve(true)
          }
        })
      } else {
        console.log('✅ Bundle analyzer available')
        resolve(true)
      }
    })
  })
}

// Analyze bundle size
function analyzeBundle() {
  return new Promise((resolve) => {
    console.log('\n🔍 Building and analyzing bundle...')
    
    const build = exec('pnpm run build:analyze', {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    build.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Bundle analysis complete')
        console.log('🌐 Check analyzer at: http://localhost:8888')
        resolve(true)
      } else {
        console.log('❌ Bundle analysis failed')
        resolve(false)
      }
    })
  })
}

// Check bundle sizes
function checkBundleSizes() {
  return new Promise((resolve) => {
    console.log('\n📊 Checking bundle sizes...')
    
    const buildPath = path.join(process.cwd(), '.next')
    
    if (!fs.existsSync(buildPath)) {
      console.log('⚠️  Build directory not found. Run pnpm run build first.')
      resolve(false)
      return
    }
    
    const staticPath = path.join(buildPath, 'static')
    const chunksPath = path.join(staticPath, 'chunks')
    
    if (!fs.existsSync(chunksPath)) {
      console.log('⚠️  Chunks directory not found.')
      resolve(false)
      return
    }
    
    const files = fs.readdirSync(chunksPath)
    const jsFiles = files.filter(f => f.endsWith('.js'))
    
    let totalSize = 0
    let totalGzipped = 0
    
    const analysis = jsFiles.map(file => {
      const filePath = path.join(chunksPath, file)
      const stats = fs.statSync(filePath)
      const size = stats.size
      
      // Calculate gzipped size
      const content = fs.readFileSync(filePath)
      const gzipped = gzipSize.sync(content)
      
      totalSize += size
      totalGzipped += gzipped
      
      return {
        file,
        size: formatBytes(size),
        gzipped: formatBytes(gzipped),
        percentage: ((gzipped / totalGzipped) * 100).toFixed(1)
      }
    }).sort((a, b) => b.gzippedSize - a.gzippedSize)
    
    console.log('\n📈 Bundle Analysis:')
    console.log('┌─────────────────────────────────────┬──────────────┬──────────────┬─────────────┐')
    console.log('│ File                                    │ Size         │ Gzipped      │ % Total     │')
    console.log('├─────────────────────────────────────┼──────────────┼──────────────┼─────────────┤')
    
    analysis.slice(0, 10).forEach(item => {
      console.log(`│ ${item.file.padEnd(39)} │ ${item.size.padEnd(12)} │ ${item.gzipped.padEnd(12)} │ ${item.percentage.padEnd(11)} │`)
    })
    
    console.log('└─────────────────────────────────────┴──────────────┴──────────────┴─────────────┘')
    console.log(`\n💾 Total Size: ${formatBytes(totalSize)} (${formatBytes(totalGzipped)} gzipped)`)
    
    // Performance recommendations
    console.log('\n💡 Performance Recommendations:')
    
    if (totalGzipped > 500 * 1024) {
      console.log('⚠️  Bundle size is large (>500KB gzipped)')
      console.log('   - Consider code splitting')
      console.log('   - Remove unused dependencies')
      console.log('   - Use dynamic imports for heavy libraries')
    }
    
    if (totalGzipped > 250 * 1024) {
      console.log('⚠️  Bundle size is moderate (>250KB gzipped)')
      console.log('   - Optimize imports')
      console.log('   - Use tree shaking')
    }
    
    if (totalGzipped <= 250 * 1024) {
      console.log('✅ Bundle size is optimal (<250KB gzipped)')
    }
    
    // Check for large chunks
    const largeChunks = analysis.filter(item => item.gzippedSize > 100 * 1024)
    if (largeChunks.length > 0) {
      console.log('\n🔍 Large chunks detected:')
      largeChunks.forEach(chunk => {
        console.log(`   - ${chunk.file}: ${chunk.gzipped}`)
      })
    }
    
    resolve(true)
  })
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Generate optimization report
function generateOptimizationReport() {
  console.log('\n📝 Generating optimization report...')
  
  const report = {
    timestamp: new Date().toISOString(),
    recommendations: [
      'Use dynamic imports for heavy components',
      'Implement lazy loading for images',
      'Optimize third-party library usage',
      'Remove unused code and dependencies',
      'Enable compression in production',
      'Use CDN for static assets',
      'Implement service worker for caching'
    ],
    nextSteps: [
      'Run pnpm run build:analyze for detailed analysis',
      'Check webpack-bundle-analyzer report',
      'Identify and optimize large chunks',
      'Test performance with Lighthouse',
      'Monitor Core Web Vitals in production'
    ]
  }
  
  fs.writeFileSync(
    path.join(process.cwd(), 'bundle-optimization-report.json'),
    JSON.stringify(report, null, 2)
  )
  
  console.log('✅ Optimization report saved to bundle-optimization-report.json')
}

// Main analysis function
async function analyze() {
  try {
    console.log('🚀 Starting Bundle Analysis\n')
    
    const analyzerAvailable = await checkBundleAnalyzer()
    if (!analyzerAvailable) return
    
    const analyzed = await analyzeBundle()
    if (!analyzed) return
    
    await checkBundleSizes()
    generateOptimizationReport()
    
    console.log('\n🎉 Bundle analysis complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Review bundle analyzer at http://localhost:8888')
    console.log('2. Check bundle-optimization-report.json')
    console.log('3. Implement optimization recommendations')
    console.log('4. Test performance improvements')
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message)
  }
}

// Run analysis
analyze()
