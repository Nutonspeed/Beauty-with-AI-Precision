require('dotenv').config({ path: '.env.production.local' })
const nodemailer = require('nodemailer').default || require('nodemailer')

console.log('📧 Testing Email Configuration...\n')

// Check environment variables
console.log('Configuration:')
console.log('  SMTP_HOST:', process.env.SMTP_HOST)
console.log('  SMTP_PORT:', process.env.SMTP_PORT)
console.log('  SMTP_USER:', process.env.SMTP_USER)
console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET')
console.log('  EMAIL_FROM:', process.env.EMAIL_FROM)
console.log('')

if (!process.env.SMTP_PASS) {
  console.error('❌ SMTP_PASS not set in .env.production.local')
  process.exit(1)
}

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Test email
const testEmail = {
  from: process.env.EMAIL_FROM,
  to: process.env.SMTP_USER, // Send to yourself
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
    <p>You can now send invitation emails! 🚀</p>
  `,
  text: 'Email configuration test successful. Gmail SMTP is working!',
}

console.log('Sending test email...')
console.log('To:', testEmail.to)
console.log('')

transporter.sendMail(testEmail, (error, info) => {
  if (error) {
    console.error('❌ Failed to send email:')
    console.error('')
    console.error(error)
    console.error('')
    console.error('Common issues:')
    console.error('1. Check App Password is correct (no spaces)')
    console.error('2. Check 2-Step Verification is ON')
    console.error('3. Check SMTP_USER matches the Gmail account')
    process.exit(1)
  } else {
    console.log('✅ Email sent successfully!')
    console.log('')
    console.log('Message ID:', info.messageId)
    console.log('Response:', info.response)
    console.log('')
    console.log('🎉 Check your inbox:', testEmail.to)
    console.log('')
    console.log('Next steps:')
    console.log('1. Verify email arrived in inbox (check spam folder)')
    console.log('2. If successful, email service is ready for production!')
    console.log('3. Test invitation flow: Create a user and check they receive invitation')
  }
})
