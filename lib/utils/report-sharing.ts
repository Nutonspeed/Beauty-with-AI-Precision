/**
 * Report Sharing Utilities
 * Handles analysis sharing with center branding, token generation, and view tracking
 */

// Using Web Crypto API for Edge Runtime compatibility
const crypto = globalThis.crypto || (globalThis as any).msCrypto;

// ============================================================================
// Types
// ============================================================================

export interface ShareOptions {
  expiryDays?: 7 | 30 | 90 | null // null = never expires
  includeRecommendations?: boolean
  includeCustomerInfo?: boolean
}

export interface ShareResult {
  share_token: string
  share_url: string
  expires_at: string | null
}

export interface ShareView {
  share_token: string
  viewed_at: string
  ip_address?: string
  user_agent?: string
  referrer?: string
}

export interface EmailShareData {
  recipientEmail: string
  recipientName?: string
  senderName: string
  centerName: string
  centerLogoUrl?: string
  shareUrl: string
  expiresAt?: string
  message?: string
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate a cryptographically secure random token
 * Format: 32 characters (base64url encoding of 24 random bytes)
 * Example: "a7B9cD2eF4gH6iJ8kL0mN1oP3qR5sT7u"
 */
export function generateShareToken(): string {
  // 24 bytes = 192 bits of entropy
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  
  // Convert to base64url format (URL-safe)
  return Buffer.from(array)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, 32); // Ensure exactly 32 characters
}

/**
 * Validate share token format
 */
export function isValidShareToken(token: string): boolean {
  // Check length (should be 32 characters)
  if (token.length !== 32) return false
  
  // Check characters (base64url: alphanumeric, -, _)
  const validPattern = /^[A-Za-z0-9_-]{32}$/
  return validPattern.test(token)
}

// ============================================================================
// Expiry Calculation
// ============================================================================

/**
 * Calculate expiry date from days
 */
export function calculateExpiryDate(days: number | null): Date | null {
  if (days === null) return null
  
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + days)
  return expiryDate
}

/**
 * Check if share link has expired
 */
export function isShareExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false // Never expires
  
  const expiryDate = new Date(expiresAt)
  const now = new Date()
  
  return now > expiryDate
}

/**
 * Get remaining days until expiry
 */
export function getRemainingDays(expiresAt: string | null): number | null {
  if (!expiresAt) return null // Never expires
  
  const expiryDate = new Date(expiresAt)
  const now = new Date()
  
  const diffMs = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}

// ============================================================================
// URL Generation
// ============================================================================

/**
 * Generate share URL from token
 */
export function generateShareUrl(token: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base}/share/${token}`
}

/**
 * Generate QR code URL for share link (using public QR code API)
 */
export function generateQRCodeUrl(shareUrl: string, size: number = 200): string {
  const encodedUrl = encodeURIComponent(shareUrl)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}`
}

// ============================================================================
// View Tracking
// ============================================================================

/**
 * Extract view metadata from request
 */
export function extractViewMetadata(request: Request): Omit<ShareView, 'share_token' | 'viewed_at'> {
  const headers = request.headers
  
  return {
    ip_address: headers.get('x-forwarded-for') || headers.get('x-real-ip') || undefined,
    user_agent: headers.get('user-agent') || undefined,
    referrer: headers.get('referer') || undefined,
  }
}

/**
 * Create share view record
 */
export function createShareView(token: string, metadata: Partial<ShareView> = {}): ShareView {
  return {
    share_token: token,
    viewed_at: new Date().toISOString(),
    ip_address: metadata.ip_address,
    user_agent: metadata.user_agent,
    referrer: metadata.referrer,
  }
}

// ============================================================================
// Email Template Generation
// ============================================================================

/**
 * Generate HTML email template for sharing analysis
 */
export function generateShareEmail(data: EmailShareData): string {
  const {
    recipientName,
    senderName,
    centerName,
    centerLogoUrl,
    shareUrl,
    expiresAt,
    message,
  } = data

  const expiryText = expiresAt 
    ? `<p style="color: #666; font-size: 14px;">Link expires: ${new Date(expiresAt).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}</p>`
    : ''

  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skin Analysis Report - ${centerName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              ${centerLogoUrl ? `<img src="${centerLogoUrl}" alt="${centerName}" style="max-width: 150px; max-height: 60px; margin-bottom: 20px;">` : ''}
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                Skin Analysis Report
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
                รายงานการวิเคราะห์ผิวหน้า
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${recipientName ? `<p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">สวัสดีค่ะคุณ ${recipientName}</p>` : ''}
              
              <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px 0;">
                ${senderName} from <strong>${centerName}</strong> has shared a skin analysis report with you.
                <br>
                <span style="color: #666;">
                  ${senderName} จาก <strong>${centerName}</strong> ได้แชร์รายงานการวิเคราะห์ผิวหน้าให้คุณ
                </span>
              </p>
              
              ${message ? `
                <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 16px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">
                    <strong>Message:</strong><br>
                    ${message}
                  </p>
                </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${shareUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                  View Report / ดูรายงาน
                </a>
              </div>
              
              ${expiryText}
              
              <p style="font-size: 14px; color: #999; margin: 20px 0 0 0; line-height: 1.6;">
                Or copy this link:<br>
                <a href="${shareUrl}" style="color: #667eea; word-break: break-all;">${shareUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Features -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" style="text-align: center; padding: 20px 10px;">
                    <div style="width: 48px; height: 48px; background-color: #e0e7ff; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                      🔬
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #666;">AI Analysis</p>
                  </td>
                  <td width="33%" style="text-align: center; padding: 20px 10px;">
                    <div style="width: 48px; height: 48px; background-color: #e0e7ff; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                      💡
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #666;">Recommendations</p>
                  </td>
                  <td width="33%" style="text-align: center; padding: 20px 10px;">
                    <div style="width: 48px; height: 48px; background-color: #e0e7ff; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                      🔒
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #666;">Secure & Private</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #333;">
                ${centerName}
              </p>
              <p style="margin: 0; font-size: 14px; color: #666;">
                Powered by AI Beauty Platform
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Footer Note -->
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 20px; line-height: 1.6;">
          This report is confidential and intended only for the recipient.<br>
          If you received this in error, please delete it immediately.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text email (fallback)
 */
export function generateShareEmailText(data: EmailShareData): string {
  const {
    recipientName,
    senderName,
    centerName,
    shareUrl,
    expiresAt,
    message,
  } = data

  const greeting = recipientName ? `สวัสดีค่ะคุณ ${recipientName}\n\n` : ''
  const expiryText = expiresAt 
    ? `\nLink expires: ${new Date(expiresAt).toLocaleDateString('th-TH')}`
    : ''
  const messageText = message ? `\nMessage:\n${message}\n` : ''

  return `
${greeting}${senderName} from ${centerName} has shared a skin analysis report with you.
${senderName} จาก ${centerName} ได้แชร์รายงานการวิเคราะห์ผิวหน้าให้คุณ
${messageText}
View Report / ดูรายงาน:
${shareUrl}
${expiryText}

---
${centerName}
Powered by AI Beauty Platform

This report is confidential and intended only for the recipient.
If you received this in error, please delete it immediately.
  `.trim()
}

// ============================================================================
// SMS Template Generation (for Thailand)
// ============================================================================

/**
 * Generate SMS message for sharing analysis
 * Max 160 characters for single SMS
 */
export function generateShareSMS(data: {
  centerName: string
  shareUrl: string
  recipientName?: string
}): string {
  const { centerName, shareUrl, recipientName } = data
  
  const greeting = recipientName ? `${recipientName} ` : ''
  
  // Short URL for SMS (consider using URL shortener service)
  return `${greeting}${centerName}: รายงานการวิเคราะห์ผิวหน้าของคุณพร้อมแล้ว ${shareUrl}`.substring(0, 160)
}

// ============================================================================
// Line Message Template
// ============================================================================

/**
 * Generate Line Flex Message for sharing analysis
 */
export function generateLineFlexMessage(data: {
  centerName: string
  centerLogoUrl?: string
  shareUrl: string
  expiresAt?: string
}) {
  const { centerName, centerLogoUrl, shareUrl, expiresAt } = data
  
  const expiryText = expiresAt 
    ? `หมดอายุ: ${new Date(expiresAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}`
    : 'ไม่มีวันหมดอายุ'

  return {
    type: 'bubble',
    hero: centerLogoUrl ? {
      type: 'image',
      url: centerLogoUrl,
      size: 'full',
      aspectRatio: '20:13',
      aspectMode: 'cover',
    } : undefined,
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: 'รายงานการวิเคราะห์ผิว',
          weight: 'bold',
          size: 'xl',
          color: '#667eea',
        },
        {
          type: 'box',
          layout: 'vertical',
          margin: 'lg',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: 'คลินิก',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: centerName,
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 5,
                },
              ],
            },
            {
              type: 'box',
              layout: 'baseline',
              spacing: 'sm',
              contents: [
                {
                  type: 'text',
                  text: 'ระยะเวลา',
                  color: '#aaaaaa',
                  size: 'sm',
                  flex: 2,
                },
                {
                  type: 'text',
                  text: expiryText,
                  wrap: true,
                  color: '#666666',
                  size: 'sm',
                  flex: 5,
                },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'uri',
            label: 'ดูรายงาน',
            uri: shareUrl,
          },
          color: '#667eea',
        },
      ],
      flex: 0,
    },
  }
}

// ============================================================================
// Share Statistics
// ============================================================================

export interface ShareStats {
  total_views: number
  unique_ips: number
  last_viewed_at: string | null
  created_at: string
  expires_at: string | null
  is_expired: boolean
  days_remaining: number | null
}

/**
 * Calculate share statistics from views
 */
export function calculateShareStats(
  views: ShareView[],
  createdAt: string,
  expiresAt: string | null
): ShareStats {
  const uniqueIps = new Set(views.filter(v => v.ip_address).map(v => v.ip_address))
  const sortedViews = [...views].sort((a, b) => 
    new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime()
  )

  return {
    total_views: views.length,
    unique_ips: uniqueIps.size,
    last_viewed_at: sortedViews[0]?.viewed_at || null,
    created_at: createdAt,
    expires_at: expiresAt,
    is_expired: isShareExpired(expiresAt),
    days_remaining: getRemainingDays(expiresAt),
  }
}
