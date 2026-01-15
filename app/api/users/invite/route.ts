import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/notifications/email-service'

/**
 * POST /api/users/invite
 * Send invitation email to newly created user
 * 
 * Required: User must already be created via /api/users/create
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, center_id, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { user_id, email, temp_password } = body

    // Validation
    if (!user_id || !email || !temp_password) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, email, temp_password' },
        { status: 400 }
      )
    }

    // Verify target user exists and was created by current user or in same center
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('id, email, full_name, role, center_id')
      .eq('id', user_id)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Permission check
    if (profile.role === 'super_admin') {
      // Super admin can invite anyone
    } else if (profile.role === 'center_admin') {
      // Center admin can only invite users in their center
      if (targetUser.center_id !== profile.center_id) {
        return NextResponse.json(
          { error: 'Cannot invite users from other centers' },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Insufficient permissions to send invitations' },
        { status: 403 }
      )
    }

    // Generate setup link (valid for 7 days)
    const setupToken = generateSetupToken()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Store invitation record
    const { error: inviteError } = await supabase
      .from('invitations')
      .insert({
        user_id: targetUser.id,
        email: targetUser.email,
        invited_by: user.id,
        setup_token: setupToken,
        temp_password: temp_password, // Encrypted in production
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })

    if (inviteError) {
      console.error('Failed to create invitation:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invitation record' },
        { status: 500 }
      )
    }

    // Prepare email content
    const setupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/setup?token=${setupToken}`
    const locale = (body.locale as 'th' | 'en') || 'th'
    const isThai = locale === 'th'

    const emailContent = {
      to: targetUser.email,
      subject: isThai 
        ? `ยินดีต้อนรับสู่ AI367 Beauty - ${getRoleDisplayName(targetUser.role, 'th')}`
        : `Welcome to AI367 Beauty - ${getRoleDisplayName(targetUser.role, 'en')}`,
      html: generateInvitationEmail({
        recipientName: targetUser.full_name,
        inviterName: profile.full_name,
        role: targetUser.role,
        email: targetUser.email,
        tempPassword: temp_password,
        setupUrl,
        expiresAt: expiresAt.toLocaleDateString(isThai ? 'th-TH' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        locale
      }),
    }

    // Send email using Resend
    console.log('📧 Sending invitation email to:', email)
    
    const emailResult = await sendEmail({
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error)
      // Still return success but note email failed
      return NextResponse.json({
        success: true,
        message: 'User invited but email delivery failed. Please send manually.',
        emailSent: false,
        email: emailContent,
        debug: {
          setup_url: setupUrl,
          temp_password: temp_password,
          expires_at: expiresAt.toISOString(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation email sent successfully',
      emailSent: true,
      debug: {
        setup_url: setupUrl,
        expires_at: expiresAt.toISOString(),
      },
    })

  } catch (error) {
    console.error('Error in /api/users/invite:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Generate setup token (32 characters)
 */
function generateSetupToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}

/**
 * Get role display name
 */
function getRoleDisplayName(role: string, locale: 'th' | 'en' = 'th'): string {
  const isThai = locale === 'th'
  const roleNames: Record<string, { th: string, en: string }> = {
    super_admin: { th: 'Super Administrator', en: 'Super Administrator' },
    center_owner: { th: 'เจ้าของศูนย์ความงาม', en: 'Center Owner' },
    center_admin: { th: 'ผู้ดูแลระบบศูนย์ความงาม', en: 'Center Administrator' },
    center_staff: { th: 'พนักงานศูนย์ความงาม', en: 'Center Staff' },
    sales_staff: { th: 'พนักงานขาย', en: 'Sales Staff' },
    customer: { th: 'ลูกค้า', en: 'Customer' },
  }
  return roleNames[role]?.[isThai ? 'th' : 'en'] || role
}

/**
 * Generate invitation email HTML
 */
function generateInvitationEmail(params: {
  recipientName: string
  inviterName: string
  role: string
  email: string
  tempPassword: string
  setupUrl: string
  expiresAt: string
  locale?: 'th' | 'en'
}): string {
  const isThai = (params.locale || 'th') === 'th'
  return `
<!DOCTYPE html>
<html lang="${params.locale || 'th'}">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .credentials { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isThai ? '🌟 ยินดีต้อนรับสู่ AI367 Beauty' : '🌟 Welcome to AI367 Beauty'}</h1>
    </div>
    <div class="content">
      <p>${isThai ? `สวัสดีครับ/ค่ะ คุณ<strong>${params.recipientName}</strong>` : `Hello <strong>${params.recipientName}</strong>,`}</p>
      
      <p>${isThai 
        ? `คุณ<strong>${params.inviterName}</strong> ได้เชิญคุณเข้าใช้งานระบบ AI367 Beauty ในตำแหน่ง <strong>${getRoleDisplayName(params.role, 'th')}</strong>`
        : `<strong>${params.inviterName}</strong> has invited you to join AI367 Beauty as a <strong>${getRoleDisplayName(params.role, 'en')}</strong>`
      }</p>
      
      <div class="credentials">
        <h3>${isThai ? '🔐 ข้อมูลเข้าสู่ระบบ:' : '🔐 Login Credentials:'}</h3>
        <p><strong>Email:</strong> ${params.email}</p>
        <p><strong>${isThai ? 'รหัสผ่านชั่วคราว:' : 'Temporary Password:'}</strong> <code>${params.tempPassword}</code></p>
        <p style="color: #d9534f;"><strong>${isThai ? '⚠️ กรุณาเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบครั้งแรก' : '⚠️ Please change your password after your first login'}</strong></p>
      </div>
      
      <p>${isThai ? 'คลิกปุ่มด้านล่างเพื่อตั้งค่าบัญชีของคุณ:' : 'Click the button below to set up your account:'}</p>
      
      <a href="${params.setupUrl}" class="button">${isThai ? 'ตั้งค่าบัญชี →' : 'Set up Account →'}</a>
      
      <p><small>${isThai ? 'หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:' : 'Or copy and paste this link into your browser:'}</small></p>
      <p><small><a href="${params.setupUrl}">${params.setupUrl}</a></small></p>
      
      <p><strong>${isThai ? '⏰ ลิงก์นี้จะหมดอายุในวันที่:' : '⏰ This link will expire on:'}</strong> ${params.expiresAt}</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      
      <p><strong>${isThai ? 'ขั้นตอนการเข้าใช้งาน:' : 'How to get started:'}</strong></p>
      <ol>
        <li>${isThai ? 'คลิกปุ่ม "ตั้งค่าบัญชี" ด้านบน' : 'Click the "Set up Account" button above'}</li>
        <li>${isThai ? 'เข้าสู่ระบบด้วย Email และรหัสผ่านชั่วคราว' : 'Log in with your Email and temporary password'}</li>
        <li>${isThai ? 'เปลี่ยนรหัสผ่านเป็นรหัสใหม่ของคุณ' : 'Change the password to your new one'}</li>
        <li>${isThai ? 'เริ่มใช้งานระบบได้ทันที!' : 'Start using the system immediately!'}</li>
      </ol>
      
      <p>${isThai ? 'หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อ:' : 'If you have any questions or need assistance, please contact:'}</p>
      <p>📧 Email: <a href="mailto:support@ai367beauty.com">support@ai367beauty.com</a></p>
      <p>📱 Line: @ai367beauty</p>
    </div>
    <div class="footer">
      <p>© 2025 AI367 Beauty. All rights reserved.</p>
      <p>${isThai ? 'Email นี้ส่งอัตโนมัติ กรุณาอย่าตอบกลับ' : 'This is an automated email. Please do not reply.'}</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
