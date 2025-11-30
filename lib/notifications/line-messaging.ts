/**
 * LINE Messaging API Integration
 * 
 * Sends notifications via LINE Official Account
 * Documentation: https://developers.line.biz/en/docs/messaging-api/
 */

const LINE_CHANNEL_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN
const LINE_API_URL = 'https://api.line.me/v2/bot/message'

export interface LineMessage {
  type: 'text' | 'flex' | 'image'
  text?: string
  altText?: string
  contents?: object
  originalContentUrl?: string
  previewImageUrl?: string
}

export interface LineSendResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Check if LINE is configured
 */
export function isLineConfigured(): boolean {
  return !!LINE_CHANNEL_TOKEN && !LINE_CHANNEL_TOKEN.includes('your-')
}

/**
 * Send LINE message to user
 */
export async function sendLineMessage(
  userId: string,
  messages: LineMessage[]
): Promise<LineSendResult> {
  if (!isLineConfigured()) {
    console.log('📱 LINE: Not configured, skipping send')
    return { success: false, error: 'LINE not configured' }
  }

  try {
    const response = await fetch(`${LINE_API_URL}/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LINE_CHANNEL_TOKEN}`
      },
      body: JSON.stringify({
        to: userId,
        messages: messages.map(formatMessage)
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'LINE API error')
    }

    return { success: true }
  } catch (error) {
    console.error('❌ LINE send error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Send appointment reminder via LINE
 */
export async function sendAppointmentReminder(
  userId: string,
  appointment: {
    patientName: string
    date: Date
    time: string
    treatment: string
    clinicName: string
  }
): Promise<LineSendResult> {
  const message: LineMessage = {
    type: 'flex',
    altText: `นัดหมาย: ${appointment.treatment}`,
    contents: {
      type: 'bubble',
      hero: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#06b6d4',
        paddingAll: '20px',
        contents: [
          {
            type: 'text',
            text: '📅 แจ้งเตือนนัดหมาย',
            color: '#ffffff',
            weight: 'bold',
            size: 'lg'
          }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: appointment.treatment,
            weight: 'bold',
            size: 'xl'
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'box',
            layout: 'vertical',
            margin: 'md',
            contents: [
              { type: 'text', text: `📆 ${formatDate(appointment.date)}`, size: 'sm' },
              { type: 'text', text: `⏰ ${appointment.time}`, size: 'sm' },
              { type: 'text', text: `🏥 ${appointment.clinicName}`, size: 'sm' }
            ]
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'button',
            action: { type: 'uri', label: 'ยืนยัน', uri: 'https://cliniciq.app/appointments' },
            style: 'primary',
            color: '#06b6d4'
          },
          {
            type: 'button',
            action: { type: 'uri', label: 'เลื่อนนัด', uri: 'https://cliniciq.app/reschedule' },
            style: 'secondary'
          }
        ]
      }
    }
  }

  return sendLineMessage(userId, [message])
}

/**
 * Send analysis result via LINE
 */
export async function sendAnalysisResult(
  userId: string,
  analysis: {
    overallScore: number
    topConcern: string
    recommendation: string
  }
): Promise<LineSendResult> {
  const scoreEmoji = analysis.overallScore >= 80 ? '🌟' : analysis.overallScore >= 60 ? '✨' : '💫'
  
  const message: LineMessage = {
    type: 'flex',
    altText: `ผลวิเคราะห์ผิว: ${analysis.overallScore}/100`,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${scoreEmoji} ผลวิเคราะห์ผิวของคุณ`,
            weight: 'bold',
            size: 'lg'
          },
          {
            type: 'text',
            text: `คะแนนรวม: ${analysis.overallScore}/100`,
            size: 'xxl',
            weight: 'bold',
            color: '#06b6d4',
            margin: 'md'
          },
          {
            type: 'separator',
            margin: 'md'
          },
          {
            type: 'text',
            text: `⚠️ ${analysis.topConcern}`,
            margin: 'md',
            wrap: true
          },
          {
            type: 'text',
            text: `💡 ${analysis.recommendation}`,
            margin: 'sm',
            wrap: true,
            color: '#888888'
          }
        ]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            action: { type: 'uri', label: 'ดูรายละเอียด', uri: 'https://cliniciq.app/analysis' },
            style: 'primary',
            color: '#06b6d4'
          }
        ]
      }
    }
  }

  return sendLineMessage(userId, [message])
}

// Helper functions
function formatMessage(msg: LineMessage): object {
  if (msg.type === 'text') {
    return { type: 'text', text: msg.text }
  }
  if (msg.type === 'flex') {
    return { type: 'flex', altText: msg.altText, contents: msg.contents }
  }
  if (msg.type === 'image') {
    return { 
      type: 'image', 
      originalContentUrl: msg.originalContentUrl,
      previewImageUrl: msg.previewImageUrl 
    }
  }
  return { type: 'text', text: 'Message' }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
