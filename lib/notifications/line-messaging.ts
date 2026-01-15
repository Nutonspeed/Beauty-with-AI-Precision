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
 * LINE Templates
 */
const LINE_TEMPLATES = {
  th: {
    reminderTitle: '📅 แจ้งเตือนนัดหมาย',
    confirmLabel: 'ยืนยัน',
    rescheduleLabel: 'เลื่อนนัด',
    analysisTitle: 'ผลวิเคราะห์ผิวของคุณ',
    overallScore: 'คะแนนรวม',
    viewDetails: 'ดูรายละเอียด',
    altReminder: (program: string) => `นัดหมาย: ${program}`,
    altAnalysis: (score: number) => `ผลวิเคราะห์ผิว: ${score}/100`,
  },
  en: {
    reminderTitle: '📅 Appointment Reminder',
    confirmLabel: 'Confirm',
    rescheduleLabel: 'Reschedule',
    analysisTitle: 'Your Skin Analysis Result',
    overallScore: 'Overall Score',
    viewDetails: 'View Details',
    altReminder: (program: string) => `Appointment: ${program}`,
    altAnalysis: (score: number) => `Skin Analysis: ${score}/100`,
  },
};

/**
 * Send appointment reminder via LINE
 */
export async function sendAppointmentReminder(
  userId: string,
  appointment: {
    clientName: string
    date: Date
    time: string
    program: string
    centerName: string
  },
  locale: 'th' | 'en' = 'th'
): Promise<LineSendResult> {
  const t = LINE_TEMPLATES[locale] || LINE_TEMPLATES.th;
  const message: LineMessage = {
    type: 'flex',
    altText: t.altReminder(appointment.program),
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
            text: t.reminderTitle,
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
            text: appointment.program,
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
              { type: 'text', text: `📆 ${formatDate(appointment.date, locale)}`, size: 'sm' },
              { type: 'text', text: `⏰ ${appointment.time}`, size: 'sm' },
              { type: 'text', text: `🏥 ${appointment.centerName}`, size: 'sm' }
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
            action: { type: 'uri', label: t.confirmLabel, uri: 'https://centeriq.app/appointments' },
            style: 'primary',
            color: '#06b6d4'
          },
          {
            type: 'button',
            action: { type: 'uri', label: t.rescheduleLabel, uri: 'https://centeriq.app/reschedule' },
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
  },
  locale: 'th' | 'en' = 'th'
): Promise<LineSendResult> {
  const t = LINE_TEMPLATES[locale] || LINE_TEMPLATES.th;
  const scoreEmoji = analysis.overallScore >= 80 ? '🌟' : analysis.overallScore >= 60 ? '✨' : '💫'
  
  const message: LineMessage = {
    type: 'flex',
    altText: t.altAnalysis(analysis.overallScore),
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${scoreEmoji} ${t.analysisTitle}`,
            weight: 'bold',
            size: 'lg'
          },
          {
            type: 'text',
            text: `${t.overallScore}: ${analysis.overallScore}/100`,
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
            action: { type: 'uri', label: t.viewDetails, uri: 'https://centeriq.app/analysis' },
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

function formatDate(date: Date, locale: 'th' | 'en' = 'th'): string {
  return date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
