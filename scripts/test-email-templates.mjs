import { config } from 'dotenv'
config({ path: '.env.production.local' })

import { testAllEmailTemplates } from '../lib/email/gmail-templates.ts'

const testEmail = process.env.SMTP_USER || 'nuttapong161@gmail.com'

console.log('🎨 Testing Beautiful Email Templates')
console.log('====================================\n')
console.log(`📧 Sending test emails to: ${testEmail}\n`)

testAllEmailTemplates(testEmail)
  .then(() => {
    console.log('\n✅ All templates tested!')
    console.log('\n📬 Check your inbox for 3 emails:')
    console.log('  1. 🎉 User Invitation')
    console.log('  2. 🔐 Password Reset')
    console.log('  3. 🎊 Welcome')
    console.log('\n⚠️ Check spam folder if not in inbox')
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message)
    process.exit(1)
  })
