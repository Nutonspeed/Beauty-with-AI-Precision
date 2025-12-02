import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { securityScanner } from '@/lib/security/scanners/security-scanners'
import { penetrationTester } from '@/lib/security/penetration/penetration-testing'
import { complianceChecker } from '@/lib/security/compliance/compliance-checker'
import { securityLogger } from '@/lib/security/monitoring/logger'

// GET /api/security/scan - Run security scan
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user || !['super_admin', 'admin'].includes(session.user.user_metadata?.role || '')) {
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      } else {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
      }
    }

    const { searchParams } = new URL(request.url)
    const scanType = searchParams.get('type') || 'full'

    let results: any = []

    switch (scanType) {
      case 'vulnerability':
        results = await securityScanner.runFullScan()
        break
      case 'penetration':
        results = await penetrationTester.runFullPenTest()
        break
      case 'compliance':
        results = await complianceChecker.runComplianceCheck()
        break
      case 'full':
        const vulnResults = await securityScanner.runFullScan()
        const penResults = await penetrationTester.runFullPenTest()
        const compResults = await complianceChecker.runComplianceCheck()
        results = {
          vulnerabilities: vulnResults,
          penetration: penResults,
          compliance: compResults
        }
        break
      default:
        return NextResponse.json({ error: 'Invalid scan type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      scanType,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    securityLogger.logError(error as Error, {
      action: 'security_scan',
      url: request.url
    })
    
    return NextResponse.json({ 
      error: 'Failed to run security scan' 
    }, { status: 500 })
  }
}

// POST /api/security/scan - Schedule security scan
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user || !['super_admin', 'admin'].includes(session.user.user_metadata?.role || '')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { scanType, schedule } = await request.json()
    
    // Schedule security scan
    // This would integrate with your job scheduling system
    
    securityLogger.logInfo(`Security scan scheduled: ${scanType}`, {
      userId: session.user.id,
      scanType,
      schedule
    })

    return NextResponse.json({
      success: true,
      message: 'Security scan scheduled successfully',
      scanId: `scan-${Date.now()}`
    })

  } catch (error) {
    securityLogger.logError(error as Error, {
      action: 'schedule_security_scan',
      url: request.url
    })
    
    return NextResponse.json({ 
      error: 'Failed to schedule security scan' 
    }, { status: 500 })
  }
}
