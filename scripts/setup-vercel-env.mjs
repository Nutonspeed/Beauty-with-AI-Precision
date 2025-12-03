#!/usr/bin/env node

/**
 * Vercel Environment Setup Script
 *
 * Sets up production environment variables for Beauty-with-AI-Precision
 * Run with: node scripts/setup-vercel-env.mjs
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const ENV_VARS = {
  // Supabase
  'SUPABASE_URL': 'https://bgejeqqngzvuokdffadu.supabase.co',
  'SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnZWplcXFuZ3p2dW9rZGZmYWR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MzM3NTQsImV4cCI6MjA3NzIwOTc1NH0.gJxg9TikqhQ7oVN5GsIP4IOYyfH3R_CLz5S55VwMQEE',

  // NextAuth
  'NEXTAUTH_SECRET': 'oeQZ5kKzrilNOgGoAZeQKjqKILYWLoMPFB1bVr26jcY=',
  'NEXTAUTH_URL': 'https://beauty-with-ai-precision-b11a57.vercel.app',

  // AI Services
  'GEMINI_API_KEY': 'AIzaSyCFvZGW1Rfwe30JzvoBVGruyHQTdbJmIDw',
  'AI_GATEWAY_API_KEY': 'vck_21OTwoeeh20LtPP0R2aNrWJcF3XAE2H3hAzQuS9tTpdvEsXinR3l3m9I',

  // Email
  'RESEND_API_KEY': 're_LzAXFnRL_GJJ2sRDFAn6squw28xEX3YcM',
  'RESEND_FROM_EMAIL': 'Beauty Clinic <onboarding@resend.dev>',

  // App URLs
  'NEXT_PUBLIC_APP_URL': 'https://beauty-with-ai-precision-b11a57.vercel.app',
  'NEXT_PUBLIC_SITE_URL': 'https://beauty-with-ai-precision-b11a57.vercel.app',
  'NEXT_PUBLIC_API_URL': 'https://beauty-with-ai-precision-b11a57.vercel.app',

  // Feature Flags
  'NEXT_PUBLIC_ENABLE_AR_FEATURES': 'true',
  'NEXT_PUBLIC_ENABLE_VIDEO_CALLS': 'true',
  'NEXT_PUBLIC_ENABLE_LIVE_CHAT': 'true',
  'NEXT_PUBLIC_ENABLE_LOYALTY_PROGRAM': 'true',
  'NEXT_PUBLIC_ENABLE_MARKETING_CAMPAIGNS': 'true',
  'NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING': 'true',
  'NEXT_PUBLIC_ANALYTICS_ENABLED': 'true',
  'NEXT_PUBLIC_SHOW_DEMO_LOGINS': 'true',

  // Production Settings
  'NODE_ENV': 'production',
  'NEXT_PUBLIC_DEFAULT_LOCALE': 'th'
}

function setVercelEnv(key, value) {
  try {
    console.log(`Setting ${key}...`)
    execSync(`vercel env add ${key} production`, {
      input: value + '\n',
      stdio: 'pipe'
    })
    console.log(`✅ ${key} set successfully`)
  } catch (error) {
    console.log(`⚠️  ${key} may already exist or failed to set:`, error.message)
  }
}

async function setupEnvironment() {
  console.log('🚀 Setting up Vercel production environment...')
  console.log('=' .repeat(50))

  // Check if Vercel CLI is logged in
  try {
    execSync('vercel whoami', { stdio: 'pipe' })
    console.log('✅ Vercel CLI authenticated')
  } catch (error) {
    console.log('❌ Vercel CLI not authenticated. Please run: vercel login')
    process.exit(1)
  }

  // Link to Vercel project
  try {
    execSync('vercel link', { stdio: 'pipe' })
    console.log('✅ Project linked to Vercel')
  } catch (error) {
    console.log('⚠️  Project may already be linked or linking failed:', error.message)
  }

  // Set environment variables
  console.log('\n📝 Setting environment variables...')
  for (const [key, value] of Object.entries(ENV_VARS)) {
    setVercelEnv(key, value)
  }

  console.log('\n✅ Environment setup complete!')
  console.log('\n📋 Next steps:')
  console.log('1. Deploy to production: vercel --prod')
  console.log('2. Monitor deployment: vercel --prod --logs')
  console.log('3. Verify deployment: pnpm run monitor:production')
}

setupEnvironment().catch(console.error)
