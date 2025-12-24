/**
 * Professional Email Templates for Gmail SMTP
 * Beautiful, responsive email designs for user invitations and notifications
 */

import { createTransport } from 'nodemailer'

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const emailFrom = process.env.EMAIL_FROM || 'noreply@yourdomain.com'
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'

// Base email template with consistent styling
const getBaseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Beauty AI Precision</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      text-align: center;
      color: white;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 8px;
    }
    .header p {
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box strong {
      color: #667eea;
      display: block;
      margin-bottom: 8px;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
      border-top: 1px solid #e0e0e0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content { padding: 30px 20px; }
      .header h1 { font-size: 24px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    ${content}
  </div>
</body>
</html>
`

/**
 * User Invitation Email - Most Important!
 */
export async function sendUserInvitationEmail(params: {
  to: string
  invitedBy: string
  role: string
  tempPassword: string
  clinicName?: string
  inviteUrl?: string
}) {
  const { to, invitedBy, role, tempPassword, clinicName, inviteUrl } = params
  
  const roleNames: Record<string, string> = {
    'clinic_owner': 'เจ้าของคลินิก',
    'clinic_admin': 'ผู้ดูแลระบบคลินิก',
    'sales_staff': 'พนักงานขาย',
    'customer': 'ลูกค้า',
    'super_admin': 'ผู้ดูแลระบบหลัก',
  }
  
  const roleName = roleNames[role] || role
  const loginUrl = inviteUrl || `${appUrl}/auth/login`
  
  const content = `
    <div class="header">
      <h1>🎉 ยินดีต้อนรับสู่ Beauty AI Precision</h1>
      <p>คุณได้รับเชิญเข้าใช้งานระบบ</p>
    </div>
    
    <div class="content">
      <p>สวัสดีครับ/ค่ะ,</p>
      
      <p><strong>${invitedBy}</strong> ได้เชิญคุณเข้าใช้งานระบบ Beauty AI Precision ในฐานะ <strong>${roleName}</strong></p>
      
      ${clinicName ? `<p>คลินิก: <strong>${clinicName}</strong></p>` : ''}
      
      <div class="info-box">
        <strong>📧 อีเมล:</strong>
        <p>${to}</p>
        
        <strong>🔑 รหัสผ่านชั่วคราว:</strong>
        <p style="font-family: monospace; font-size: 18px; color: #667eea; font-weight: bold;">${tempPassword}</p>
        
        <p style="margin-top: 12px; font-size: 14px; color: #666;">
          ⚠️ กรุณาเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบครั้งแรก
        </p>
      </div>
      
      <center>
        <a href="${loginUrl}" class="button">เข้าสู่ระบบ</a>
      </center>
      
      <p style="margin-top: 30px;"><strong>ขั้นตอนการเข้าใช้งาน:</strong></p>
      <ol style="padding-left: 20px;">
        <li>คลิกปุ่ม "เข้าสู่ระบบ" ด้านบน</li>
        <li>ใช้อีเมลและรหัสผ่านชั่วคราวที่แจ้งไว้</li>
        <li>ตั้งรหัสผ่านใหม่ของคุณเอง</li>
        <li>เริ่มใช้งานระบบได้เลย!</li>
      </ol>
      
      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        หากคุณมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อผู้ดูแลระบบ
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Beauty AI Precision</strong></p>
      <p>ระบบบริหารจัดการคลินิกความงามด้วย AI</p>
      <p style="margin-top: 15px;">
        © ${new Date().getFullYear()} Beauty AI Precision. All rights reserved.
      </p>
      <p style="margin-top: 10px; font-size: 12px; color: #999;">
        Email นี้ส่งถึง ${to}<br>
        ถ้าคุณไม่ได้ขอเข้าใช้งาน กรุณาลบ email นี้
      </p>
    </div>
  `
  
  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject: `🎉 คุณได้รับเชิญเข้าใช้งาน Beauty AI Precision - ${roleName}`,
      html: getBaseTemplate(content),
    })
    
    console.log('✅ Invitation email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send invitation email:', error)
    throw error
  }
}

/**
 * Password Reset Email
 */
export async function sendPasswordResetEmail(params: {
  to: string
  userName?: string
  resetUrl: string
}) {
  const { to, userName, resetUrl } = params
  
  const content = `
    <div class="content">
      <h2>🔐 รีเซ็ตรหัสผ่าน</h2>
      
      <p>สวัสดี${userName ? ` คุณ${userName}` : ''},</p>
      
      <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
      
      <center>
        <a href="${resetUrl}" class="button">รีเซ็ตรหัสผ่าน</a>
      </center>
      
      <div class="info-box">
        <strong>⏰ ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</strong>
        <p>กรุณาคลิกปุ่มด้านบนเพื่อตั้งรหัสผ่านใหม่</p>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        ⚠️ หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาละเว้น email นี้ 
        บัญชีของคุณยังคงปลอดภัย
      </p>
      
      <p style="margin-top: 20px; font-size: 14px; color: #999;">
        หากปุ่มไม่ทำงาน คัดลอกลิงก์นี้:<br>
        <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Beauty AI Precision</strong></p>
      <p>© ${new Date().getFullYear()} All rights reserved.</p>
    </div>
  `
  
  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject: '🔐 รีเซ็ตรหัสผ่าน - Beauty AI Precision',
      html: getBaseTemplate(content),
    })
    
    console.log('✅ Password reset email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error)
    throw error
  }
}

/**
 * Welcome Email (after first login)
 */
export async function sendWelcomeEmail(params: {
  to: string
  userName: string
  role: string
  clinicName?: string
}) {
  const { to, userName, role, clinicName } = params
  
  const roleNames: Record<string, string> = {
    'clinic_owner': 'เจ้าของคลินิก',
    'clinic_admin': 'ผู้ดูแลระบบคลินิก',
    'sales_staff': 'พนักงานขาย',
    'customer': 'ลูกค้า',
  }
  
  const roleName = roleNames[role] || role
  
  const content = `
    <div class="header">
      <h1>🎊 ยินดีต้อนรับ!</h1>
      <p>เริ่มต้นใช้งาน Beauty AI Precision</p>
    </div>
    
    <div class="content">
      <p>สวัสดีคุณ ${userName},</p>
      
      <p>ยินดีต้อนรับสู่ Beauty AI Precision! 🎉</p>
      
      ${clinicName ? `<p>คุณเข้าร่วมคลินิก: <strong>${clinicName}</strong></p>` : ''}
      <p>บทบาทของคุณ: <strong>${roleName}</strong></p>
      
      <div class="info-box">
        <strong>🚀 เริ่มต้นด้วย:</strong>
        ${role === 'sales_staff' ? `
          <ul style="margin-top: 12px; padding-left: 20px;">
            <li>สร้างและจัดการ Leads</li>
            <li>สร้าง Proposals ให้ลูกค้า</li>
            <li>ติดตามผลการขาย</li>
            <li>สร้างบัญชีลูกค้าใหม่</li>
          </ul>
        ` : role === 'clinic_owner' || role === 'clinic_admin' ? `
          <ul style="margin-top: 12px; padding-left: 20px;">
            <li>จัดการข้อมูลคลินิก</li>
            <li>เชิญพนักงานขายเข้าร่วม</li>
            <li>ดู Dashboard และรายงาน</li>
            <li>ตั้งค่าระบบตามต้องการ</li>
          </ul>
        ` : `
          <ul style="margin-top: 12px; padding-left: 20px;">
            <li>ดูประวัติการรักษา</li>
            <li>จองนัดหมาย</li>
            <li>ดูผลการวิเคราะห์ผิว</li>
          </ul>
        `}
      </div>
      
      <center>
        <a href="${appUrl}" class="button">เข้าสู่ระบบ</a>
      </center>
      
      <p style="margin-top: 30px; color: #666;">
        หากต้องการความช่วยเหลือ กรุณาติดต่อผู้ดูแลระบบของคุณ
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Beauty AI Precision</strong></p>
      <p>© ${new Date().getFullYear()} All rights reserved.</p>
    </div>
  `
  
  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject: `🎊 ยินดีต้อนรับสู่ Beauty AI Precision!`,
      html: getBaseTemplate(content),
    })
    
    console.log('✅ Welcome email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error)
    throw error
  }
}

/**
 * Invoice Email
 */
export async function sendInvoiceEmail(params: {
  to: string
  invoiceNumber: string
  customerName: string
  totalAmount: number
  dueDate: string
  downloadUrl: string
}) {
  const { to, invoiceNumber, customerName, totalAmount, dueDate, downloadUrl } = params
  
  const content = `
    <div class="header">
      <h1>📄 ใบแจ้งหนี้</h1>
      <p>ใบแจ้งหนี้ของคุณพร้อมแล้ว</p>
    </div>
    
    <div class="content">
      <p>สวัสดีครับ/ค่ะ <strong>${customerName}</strong>,</p>
      
      <p>ใบแจ้งหนี้ของคุณได้รับการสร้างเรียบร้อยแล้ว รายละเอียดดังนี้:</p>
      
      <div class="info-box">
        <strong>📄 เลขที่ใบแจ้งหนี้:</strong>
        <p>${invoiceNumber}</p>
        
        <strong>💰 จำนวนเงิน:</strong>
        <p style="font-size: 18px; color: #667eea; font-weight: bold;">฿${totalAmount.toFixed(2)}</p>
        
        <strong>📅 วันครบกำหนดชำระ:</strong>
        <p>${dueDate}</p>
      </div>
      
      <center>
        <a href="${downloadUrl}" class="button">ดาวน์โหลดใบแจ้งหนี้</a>
      </center>
      
      <p style="margin-top: 30px;"><strong>วิธีการชำระเงิน:</strong></p>
      <ul style="padding-left: 20px;">
        <li>โอนเงินผ่านธนาคาร</li>
        <li>ชำระผ่านบัตรเครดิต</li>
        <li>ชำระเงินสดที่คลินิก</li>
        <li>QR Code PromptPay</li>
      </ul>
      
      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        หากมีข้อสอบถามเกี่ยวกับใบแจ้งหนี้ กรุณาติดต่อเรา
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Beauty AI Precision</strong></p>
      <p>ขอบคุณสำหรับการใช้บริการ</p>
      <p style="margin-top: 15px;">
        © ${new Date().getFullYear()} All rights reserved.
      </p>
      <p style="margin-top: 10px; font-size: 12px; color: #999;">
        Email นี้เป็นการแจ้งเตือนใบแจ้งหนี้อัตโนมัติ<br>
        หากคุณไม่ได้มีนัดหมาย กรุณาติดต่อเรา
      </p>
    </div>
  `

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject: `📄 ใบแจ้งหนี้ ${invoiceNumber}`,
      html: getBaseTemplate(content),
    })
    console.log('✅ Invoice email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Failed to send invoice email:', error)
    throw error
  }
}

/**
 * Test all email templates
 */
export async function testAllEmailTemplates(testEmail: string) {
  console.log('🧪 Testing all email templates...\n')
  
  try {
    // Test 1: Invitation Email
    console.log('1️⃣ Testing invitation email...')
    await sendUserInvitationEmail({
      to: testEmail,
      invitedBy: 'Admin',
      role: 'sales_staff',
      tempPassword: 'Test1234!',
      clinicName: 'คลินิกทดสอบ',
    })
    console.log('✅ Invitation email sent\n')
    
    // Test 2: Password Reset Email
    console.log('2️⃣ Testing password reset email...')
    await sendPasswordResetEmail({
      to: testEmail,
      resetUrl: `${appUrl}/auth/reset-password?token=test-token`,
      userName: 'ทดสอบ',
    })
    console.log('✅ Password reset email sent\n')
    
    // Test 3: Welcome Email
    console.log('3️⃣ Testing welcome email...')
    await sendWelcomeEmail({
      to: testEmail,
      userName: 'คุณทดสอบ',
      role: 'sales_staff',
      clinicName: 'คลินิกทดสอบ',
    })
    console.log('✅ Welcome email sent\n')
    
    console.log('🎉 All email templates tested successfully!')
    console.log(`📧 Check inbox: ${testEmail}`)
    
  } catch (error) {
    console.error('❌ Email template test failed:', error)
    throw error
  }
}
