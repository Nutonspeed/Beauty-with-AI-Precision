/**
 * Resend Email Service
 * 
 * Handles sending invitation emails via Resend
 */

import { Resend } from 'resend'

interface SendInvitationEmailParams {
  to: string
  inviterName: string
  inviterEmail: string
  role: string
  centerName?: string | null
  invitationLink: string
  expiresAt: string
}

// Role name mapping (Thai)
const roleNames: Record<string, string> = {
  center_owner: 'เจ้าของศูนย์ความงาม',
  center_manager: 'ผู้จัดการศูนย์ความงาม',
  center_staff: 'พนักงานศูนย์ความงาม',
  sales_staff: 'พนักงานขาย',
  customer: 'ลูกค้า'
}

/**
 * Send invitation email
 */
export async function sendInvitationEmail({
  to,
  inviterName,
  inviterEmail,
  role,
  centerName,
  invitationLink,
  expiresAt
}: SendInvitationEmailParams) {
  // Initialize Resend only when needed
  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const roleName = roleNames[role] || role
    const expiryDate = new Date(expiresAt).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'CenterIQ AI <onboarding@resend.dev>',
      to: [to],
      subject: `คำเชิญเข้าใช้งานระบบ CenterIQ AI - ${roleName}`,
      html: getInvitationEmailHTML({
        inviterName,
        inviterEmail,
        role: roleName,
        centerName,
        invitationLink,
        expiryDate
      }),
      text: getInvitationEmailText({
        inviterName,
        role: roleName,
        centerName,
        invitationLink,
        expiryDate
      })
    })

    if (error) {
      console.error('Error sending email via Resend:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    console.log('✅ Email sent successfully:', data?.id)
    return { success: true, id: data?.id }

  } catch (error: any) {
    console.error('Error in sendInvitationEmail:', error)
    throw error
  }
}

/**
 * Generate HTML email template
 */
function getInvitationEmailHTML({
  inviterName,
  inviterEmail,
  role,
  centerName,
  invitationLink,
  expiryDate
}: {
  inviterName: string
  inviterEmail?: string
  role: string
  centerName?: string | null
  invitationLink: string
  expiryDate: string
}) {
  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>คำเชิญเข้าใช้งานระบบ</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Sarabun', 'Helvetica', Arial, sans-serif; background-color: #f7fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">
                🎉 คุณได้รับคำเชิญ!
              </h1>
              <p style="color: #e9d8fd; margin: 10px 0 0; font-size: 16px;">
                CenterIQ AI Management System
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                สวัสดีครับ/ค่ะ,
              </p>

              <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                <strong>${inviterName}</strong>${inviterEmail ? ` (${inviterEmail})` : ''} ได้เชิญคุณเข้าร่วมระบบ CenterIQ AI Management System
              </p>

              ${centerName ? `
              <div style="background-color: #edf2f7; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="color: #4a5568; font-size: 14px; margin: 0 0 8px;">
                  <strong>ศูนย์ความงาม:</strong>
                </p>
                <p style="color: #2d3748; font-size: 16px; margin: 0; font-weight: 600;">
                  ${centerName}
                </p>
              </div>
              ` : ''}

              <div style="background-color: #f0fff4; padding: 20px; border-radius: 6px; border-left: 4px solid #48bb78; margin: 20px 0;">
                <p style="color: #2f855a; font-size: 14px; margin: 0 0 8px;">
                  <strong>บทบาทของคุณ:</strong>
                </p>
                <p style="color: #22543d; font-size: 18px; margin: 0; font-weight: 600;">
                  ${role}
                </p>
              </div>

              <p style="color: #2d3748; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                คลิกปุ่มด้านล่างเพื่อสร้างบัญชีและเริ่มใช้งาน:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationLink}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                  รับคำเชิญและสร้างบัญชี
                </a>
              </div>

              <!-- Expiry Notice -->
              <div style="background-color: #fff5f5; padding: 16px; border-radius: 6px; border-left: 4px solid #fc8181; margin: 20px 0;">
                <p style="color: #c53030; font-size: 14px; margin: 0;">
                  ⏰ <strong>หมดอายุ:</strong> ${expiryDate}
                </p>
              </div>

              <!-- Alternative Link -->
              <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:
              </p>
              <div style="background-color: #edf2f7; padding: 12px; border-radius: 4px; word-break: break-all;">
                <a href="${invitationLink}" style="color: #3182ce; font-size: 13px; text-decoration: none;">
                  ${invitationLink}
                </a>
              </div>

              <!-- Help Text -->
              <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 30px 0 0;">
                หากคุณไม่ได้คาดหวังอีเมลนี้ สามารถเพิกเฉยได้เลย
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f7fafc; padding: 30px 40px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #a0aec0; font-size: 13px; margin: 0 0 10px;">
                ส่งจาก CenterIQ AI Management System
              </p>
              <p style="color: #cbd5e0; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} CenterIQ AI. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

/**
 * Generate plain text email (fallback)
 */
function getInvitationEmailText({
  inviterName,
  role,
  centerName,
  invitationLink,
  expiryDate
}: {
  inviterName: string
  role: string
  centerName?: string | null
  invitationLink: string
  expiryDate: string
}) {
  return `
คุณได้รับคำเชิญเข้าใช้งานระบบ CenterIQ AI!

${inviterName} ได้เชิญคุณเข้าร่วมระบบ CenterIQ AI Management System

${centerName ? `ศูนย์ความงาม: ${centerName}\n` : ''}
บทบาทของคุณ: ${role}

คลิกลิงก์ด้านล่างเพื่อสร้างบัญชีและเริ่มใช้งาน:
${invitationLink}

⏰ หมดอายุ: ${expiryDate}

หากคุณไม่ได้คาดหวังอีเมลนี้ สามารถเพิกเฉยได้เลย

---
ส่งจาก Beauty Clinic Management System
© ${new Date().getFullYear()} Beauty Clinic. All rights reserved.
  `
}
