import { config } from 'dotenv'
import { createTransport } from 'nodemailer'

config({ path: '.env.production.local' })

console.log('📧 Testing Email Configuration...\n')

console.log('Configuration:')
console.log('  SMTP_HOST:', process.env.SMTP_HOST)
console.log('  SMTP_PORT:', process.env.SMTP_PORT)
console.log('  SMTP_USER:', process.env.SMTP_USER)
console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET')
console.log('  EMAIL_FROM:', process.env.EMAIL_FROM)
console.log('')

if (!process.env.SMTP_PASS) {
  console.error('❌ SMTP_PASS not set')
  process.exit(1)
}

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const testEmail = {
  from: process.env.EMAIL_FROM,
  to: process.env.SMTP_USER,
  subject: '✅ Test Email from Beauty AI Production',
  html: `
    <h2>🎉 Email Configuration Successful!</h2>
    <p>If you're reading this, your Gmail SMTP is working correctly.</p>
    <p><strong>Configuration:</strong></p>
    <ul>
      <li>Host: ${process.env.SMTP_HOST}</li>
      <li>Port: ${process.env.SMTP_PORT}</li>
      <li>From: ${process.env.EMAIL_FROM}</li>
    </ul>
    <p><strong>You can now send invitation emails!</strong> 🚀</p>
    <hr>
    <p><small>This is an automated test from Beauty AI Precision</small></p>
  `,
}

console.log('Sending test email to:', testEmail.to)
console.log('')

try {
  const info = await transporter.sendMail(testEmail)
  console.log('✅ Email sent successfully!')
  console.log('')
  console.log('Message ID:', info.messageId)
  console.log('Response:', info.response)
  console.log('')
  console.log('🎉 Check your inbox:', testEmail.to)
  console.log('')
  console.log('Next steps:')
  console.log('1. ✅ Verify email arrived (check spam folder if not in inbox)')
  console.log('2. ✅ Email service is ready for production!')
  console.log('3. 🚀 Test invitation flow by creating a user')
} catch (error) {
  console.error('❌ Failed to send email:')
  console.error('')
  console.error(error.message)
  console.error('')
  console.error('Common issues:')
  console.error('1. App Password incorrect (must be exactly: ifni hidu tywk eury)')
  console.error('2. 2-Step Verification not enabled')
  console.error('3. Gmail account locked or flagged')
  process.exit(1)
}
