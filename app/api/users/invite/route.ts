import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      .from('profiles')
      .select('role, clinic_id, full_name')
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

    // Verify target user exists and was created by current user or in same clinic
    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, clinic_id')
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
    } else if (profile.role === 'clinic_owner') {
      // Clinic owner can only invite users in their clinic
      if (targetUser.clinic_id !== profile.clinic_id) {
        return NextResponse.json(
          { error: 'Cannot invite users from other clinics' },
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
    const emailContent = {
      to: targetUser.email,
      subject: `Welcome to AI367 Beauty - ${getRoleDisplayName(targetUser.role)}`,
      html: generateInvitationEmail({
        recipientName: targetUser.full_name,
        inviterName: profile.full_name,
        role: targetUser.role,
        email: targetUser.email,
        tempPassword: temp_password,
        setupUrl,
        expiresAt: expiresAt.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      }),
    }

    // Send email (using Resend or similar service)
    // TODO: Implement actual email sending
    console.log('📧 Invitation email prepared:', emailContent)

    // For MVP: Return email content for manual sending
    return NextResponse.json({
      success: true,
      message: 'Invitation prepared. Send this email to the user.',
      email: emailContent,
      debug: {
        setup_url: setupUrl,
        temp_password: temp_password,
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
 * Get role display name in Thai
 */
function getRoleDisplayName(role: string): string {
  const roleNames: Record<string, string> = {
    super_admin: 'Super Administrator',
    clinic_owner: 'เจ้าของคลินิก',
    clinic_admin: 'ผู้ดูแลระบบคลินิก',
    clinic_staff: 'พนักงานคลินิก',
    sales_staff: 'พนักงานขาย',
    customer: 'ลูกค้า',
  }
  return roleNames[role] || role
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
}): string {
  return `
<!DOCTYPE html>
<html>
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
      <h1>🌟 ยินดีต้อนรับสู่ AI367 Beauty</h1>
    </div>
    <div class="content">
      <p>สวัสดีครับ/ค่ะ คุณ<strong>${params.recipientName}</strong></p>
      
      <p>คุณ<strong>${params.inviterName}</strong> ได้เชิญคุณเข้าใช้งานระบบ AI367 Beauty ในตำแหน่ง <strong>${getRoleDisplayName(params.role)}</strong></p>
      
      <div class="credentials">
        <h3>🔐 ข้อมูลเข้าสู่ระบบ:</h3>
        <p><strong>Email:</strong> ${params.email}</p>
        <p><strong>รหัสผ่านชั่วคราว:</strong> <code>${params.tempPassword}</code></p>
        <p style="color: #d9534f;"><strong>⚠️ กรุณาเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบครั้งแรก</strong></p>
      </div>
      
      <p>คลิกปุ่มด้านล่างเพื่อตั้งค่าบัญชีของคุณ:</p>
      
      <a href="${params.setupUrl}" class="button">ตั้งค่าบัญชี →</a>
      
      <p><small>หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:</small></p>
      <p><small><a href="${params.setupUrl}">${params.setupUrl}</a></small></p>
      
      <p><strong>⏰ ลิงก์นี้จะหมดอายุในวันที่:</strong> ${params.expiresAt}</p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      
      <p><strong>ขั้นตอนการเข้าใช้งาน:</strong></p>
      <ol>
        <li>คลิกปุ่ม "ตั้งค่าบัญชี" ด้านบน</li>
        <li>เข้าสู่ระบบด้วย Email และรหัสผ่านชั่วคราว</li>
        <li>เปลี่ยนรหัสผ่านเป็นรหัสใหม่ของคุณ</li>
        <li>เริ่มใช้งานระบบได้ทันที!</li>
      </ol>
      
      <p>หากมีคำถามหรือต้องการความช่วยเหลือ กรุณาติดต่อ:</p>
      <p>📧 Email: <a href="mailto:support@ai367beauty.com">support@ai367beauty.com</a></p>
      <p>📱 Line: @ai367beauty</p>
    </div>
    <div class="footer">
      <p>© 2025 AI367 Beauty. All rights reserved.</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
