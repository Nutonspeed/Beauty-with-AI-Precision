import { type NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

interface HotLead {
  id: string
  customer_user_id: string | null
  name: string
  age: number
  photo: string | null
  initials: string
  score: number
  priorityScore: {
    totalScore: number
    priorityLevel: 'critical' | 'high' | 'medium' | 'low'
    badge: string
    details: {
      skinCondition: number
      engagement: number
      intent: number
      urgency: number
    }
  }
  isOnline: boolean
  topConcern: string
  secondaryConcern: string | null
  estimatedValue: number
  lastActivity: string
  analysisTimestamp: Date
  engagementCount: number
  analysisData: {
    wrinkles?: number
    pigmentation?: number
    pores?: number
    hydration?: number
  }
  skinType: string | null
  email: string | null
  phone: string | null
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const offset = Number.parseInt(searchParams.get('offset') || '0')

    // Role guard: allow only sales_staff/admin
    const service = createServiceClient()
    const { data: userRow, error: userErr } = await service
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()

    if (userErr || !userRow || !['sales_staff', 'admin'].includes(userRow.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // ใช้ service ใหม่
    const { fetchHotLeadsForUser } = await import('@/lib/sales/hot-leads-service')
    const leads = await fetchHotLeadsForUser(user.id, userRow.clinic_id ?? null, limit, offset)

    return NextResponse.json({
      leads,
      total: leads.length,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[hot-leads] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  } finally {
    const duration = Date.now() - startedAt
    console.info('[sales/hot-leads][GET] done', { durationMs: duration })
  }
 }
