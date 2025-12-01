#!/usr/bin/env node

/**
 * DeepFace Service Deployment Script
 * 
 * Deploy DeepFace API service for age/gender detection (97% accuracy)
 * 
 * Usage: node scripts/deploy-deepface.js
 */

const { spawn, exec } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 Deploying DeepFace Service...\n')

// Check if Docker is available
function checkDocker() {
  return new Promise((resolve) => {
    exec('docker --version', (error, stdout) => {
      if (error) {
        console.log('❌ Docker not found. Please install Docker first.')
        console.log('📖 Install from: https://www.docker.com/products/docker-desktop')
        resolve(false)
      } else {
        console.log('✅ Docker found:', stdout.trim())
        resolve(true)
      }
    })
  })
}

// Build Docker image
function buildDockerImage() {
  return new Promise((resolve) => {
    console.log('\n📦 Building DeepFace Docker image...')
    
    const docker = spawn('docker', ['build', '-f', 'docker/deepface.Dockerfile', '-t', 'beauty-deepface', '.'], {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    docker.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Docker image built successfully')
        resolve(true)
      } else {
        console.log('❌ Docker build failed')
        resolve(false)
      }
    })
  })
}

// Run Docker container
function runDockerContainer() {
  return new Promise((resolve) => {
    console.log('\n🏃 Running DeepFace container...')
    
    // Stop existing container if running
    exec('docker stop beauty-deepface-container 2>nul & docker rm beauty-deepface-container 2>nul', () => {
      const docker = spawn('docker', [
        'run', '-d',
        '--name', 'beauty-deepface-container',
        '-p', '5000:5000',
        '--restart', 'unless-stopped',
        'beauty-deepface'
      ], {
        stdio: 'inherit',
        cwd: process.cwd()
      })
      
      docker.on('close', (code) => {
        if (code === 0) {
          console.log('✅ DeepFace container started on port 5000')
          resolve(true)
        } else {
          console.log('❌ Failed to start DeepFace container')
          resolve(false)
        }
      })
    })
  })
}

// Test DeepFace service
function testDeepFaceService() {
  return new Promise((resolve) => {
    console.log('\n🧪 Testing DeepFace service...')
    
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:5000/health')
        if (response.ok) {
          console.log('✅ DeepFace service is running!')
          console.log('📍 Available at: http://localhost:5000')
          console.log('📖 API docs: http://localhost:5000/docs')
          resolve(true)
        } else {
          console.log('❌ DeepFace service not responding')
          resolve(false)
        }
      } catch (error) {
        console.log('❌ Cannot connect to DeepFace service:', error.message)
        resolve(false)
      }
    }, 5000) // Wait 5 seconds for service to start
  })
}

// Main deployment function
async function deploy() {
  try {
    // Check prerequisites
    const dockerAvailable = await checkDocker()
    if (!dockerAvailable) return
    
    // Check if DeepFace files exist
    if (!fs.existsSync('docker/deepface.Dockerfile')) {
      console.log('❌ DeepFace Dockerfile not found at docker/deepface.Dockerfile')
      return
    }
    
    if (!fs.existsSync('python/deepface_api.py')) {
      console.log('❌ DeepFace API not found at python/deepface_api.py')
      return
    }
    
    // Build and run
    const built = await buildDockerImage()
    if (!built) return
    
    const running = await runDockerContainer()
    if (!running) return
    
    const tested = await testDeepFaceService()
    if (!tested) return
    
    console.log('\n🎉 DeepFace deployment complete!')
    console.log('\n📋 Next steps:')
    console.log('1. Add DEEPFACE_API_URL="http://localhost:5000" to .env.local')
    console.log('2. Restart the main application: pnpm run dev')
    console.log('3. Test age/gender detection in the app')
    console.log('\n🔍 Commands:')
    console.log('- Check status: curl http://localhost:5000/health')
    console.log('- View logs: docker logs beauty-deepface-container')
    console.log('- Stop service: docker stop beauty-deepface-container')
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message)
  }
}

// Run deployment
deploy()
