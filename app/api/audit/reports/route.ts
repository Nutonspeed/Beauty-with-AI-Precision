// Audit Reports API
import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '@/lib/audit/audit-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse filter parameters
    const filter = {
      userId: searchParams.get('userId') || undefined,
      clinicId: searchParams.get('clinicId') || undefined,
      dateRange: searchParams.get('startDate') && searchParams.get('endDate') 
        ? [searchParams.get('startDate'), searchParams.get('endDate')] as [string, string]
        : undefined
    }

    // Get statistics
    const statistics = await auditLogger.getStatistics(filter)

    return NextResponse.json({
      success: true,
      data: statistics,
      filter
    })

  } catch (error) {
    console.error('Audit reports API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
