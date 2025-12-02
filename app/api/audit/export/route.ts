// Audit Export API
import { NextRequest, NextResponse } from 'next/server'
import { auditLogger } from '@/lib/audit/audit-logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filter = {
      userId: searchParams.get('userId') || undefined,
      clinicId: searchParams.get('clinicId') || undefined,
      action: searchParams.get('action') || undefined,
      resource: searchParams.get('resource') || undefined,
      severity: searchParams.get('severity')?.split(',') || undefined,
      category: searchParams.get('category')?.split(',') || undefined,
      dateRange: searchParams.get('startDate') && searchParams.get('endDate') 
        ? [searchParams.get('startDate'), searchParams.get('endDate')] as [string, string]
        : undefined
    }

    const format = (searchParams.get('format') as 'json' | 'csv') || 'json'

    // Export audit logs
    const exportData = await auditLogger.export(filter, format)

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', format === 'csv' ? 'text/csv' : 'application/json')
    headers.set(
      'Content-Disposition',
      `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.${format}"`
    )

    return new NextResponse(exportData, { headers })

  } catch (error) {
    console.error('Audit export API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
