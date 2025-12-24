import { NextRequest, NextResponse } from 'next/server'
import { ReminderService } from '@/lib/booking/reminder-service'

// Security: Check for cron secret
const CRON_SECRET = process.env.CRON_SECRET || 'default-secret-key'

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type } = body

    let result

    switch (type) {
      case 'daily':
        // Send reminders for tomorrow's appointments
        result = await ReminderService.processDailyReminders()
        break

      case 'same_day':
        // Send same-day reminders (2 hours before)
        result = await ReminderService.processSameDayReminders()
        break

      default:
        return NextResponse.json(
          { error: 'Invalid reminder type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${type} reminders`,
      ...result
    })

  } catch (error) {
    console.error('Error in cron reminders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// For testing without auth (remove in production)
export async function GET() {
  try {
    const result = await ReminderService.processDailyReminders()
    return NextResponse.json({
      success: true,
      message: 'Test: Processed daily reminders',
      ...result
    })
  } catch (error) {
    console.error('Error in test reminders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
