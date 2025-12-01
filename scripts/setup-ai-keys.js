#!/usr/bin/env node

/**
 * AI Keys Setup Script
 * 
 * สร้าง .env.local พร้อม AI keys สำหรับ development
 * 
 * Usage: node scripts/setup-ai-keys.js
 */

const fs = require('fs')
const path = require('path')

// สร้าง .env.local template
const envLocalContent = `# AI API Keys (Development)
# ใส่ API keys จริงเพื่อเปิดใช้งาน AI แบบเต็ม

# OpenAI GPT-4o (Best for skin analysis)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY="sk-proj-your-openai-key-here"

# Anthropic Claude 3.5 Sonnet (Structured reasoning)
# Get from: https://console.anthropic.com/
ANTHROPIC_API_KEY="sk-ant-your-anthropic-key-here"

# Google Gemini (FREE 1,500 requests/day)
# Get from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY="your-gemini-key-here"

# Hugging Face (FREE tier)
# Get from: https://huggingface.co/settings/tokens
HUGGINGFACE_TOKEN="hf-your-huggingface-token-here"

# DeepFace Service (Python)
DEEPFACE_API_URL="http://localhost:5000"
AI_SERVICE_URL="http://localhost:8000"

# Supabase (ใส่ของจริง)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3004"
`

const envLocalPath = path.join(process.cwd(), '.env.local')

if (!fs.existsSync(envLocalPath)) {
  fs.writeFileSync(envLocalPath, envLocalContent)
  console.log('✅ สร้าง .env.local สำเร็จ!')
  console.log('📝 แก้ไข API keys ใน .env.local:')
  console.log('   1. OPENAI_API_KEY - OpenAI GPT-4o')
  console.log('   2. ANTHROPIC_API_KEY - Claude 3.5')
  console.log('   3. GEMINI_API_KEY - Google Gemini (ฟรี)')
  console.log('   4. HUGGINGFACE_TOKEN - Hugging Face')
  console.log('   5. SUPABASE_* - Database credentials')
} else {
  console.log('⚠️  .env.local มีอยู่แล้ว')
  console.log('📝 ตรวจสอบว่ามี AI keys ครบหรือไม่')
}

// ตรวจสอบ AI status endpoint
console.log('\n🔍 ตรวจสอบ AI status:')
console.log('   GET http://localhost:3004/api/health/ai-status')
console.log('\n📖 ดูวิธีใส่ API keys ใน docs/AI_SETUP.md')
