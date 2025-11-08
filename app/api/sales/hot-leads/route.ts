import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

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

    // Query hot leads from sales_leads table
    console.log('[hot-leads] Querying for user:', user.id)
    const { data: leads, error } = await supabase
      .from('sales_leads')
      .select('*')
      .eq('sales_user_id', user.id)
      .in('status', ['new', 'contacted', 'qualified'])
      .order('score', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    console.log('[hot-leads] Query result:', {
      count: leads?.length || 0,
      hasError: !!error,
      errorCode: error?.code,
      errorMessage: error?.message,
      leadScores: leads?.map(l => ({ name: l.name, score: l.score, status: l.status }))
    })

    if (error) {
      console.error('[hot-leads] Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform data to match frontend interface
    const hotLeads: HotLead[] = (leads || []).map((lead: any) => {
      const customerName = lead.name || 'Unknown Customer'
      
      // Calculate initials
      const nameParts = customerName.split(' ')
      const initials = nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        : (nameParts[0][0] + (nameParts[0][1] || '') || 'UN')

      // Calculate last activity time ago
      const lastActivityDate = lead.last_contact_at 
        ? new Date(lead.last_contact_at)
        : new Date(lead.created_at)
      const minutesAgo = Math.floor((Date.now() - lastActivityDate.getTime()) / 1000 / 60)
      let lastActivity: string
      if (minutesAgo < 60) {
        lastActivity = `${minutesAgo} min ago`
      } else if (minutesAgo < 1440) {
        lastActivity = `${Math.floor(minutesAgo / 60)} hr ago`
      } else {
        lastActivity = `${Math.floor(minutesAgo / 1440)} day ago`
      }

      // Parse metadata (JSONB field - may contain analysis data)
      let metadata: any = {}
      if (lead.metadata) {
        metadata = typeof lead.metadata === 'string' 
          ? JSON.parse(lead.metadata)
          : lead.metadata
      }

      // Check if user is online (check last activity within 5 minutes)
      const isOnline = minutesAgo < 5

      // Calculate priority score based on lead score
      const numericScore = lead.score || 50
      let priorityLevel: 'critical' | 'high' | 'medium' | 'low'
      let badge: string
      if (numericScore >= 90) {
        priorityLevel = 'critical'
        badge = '🔥 Critical'
      } else if (numericScore >= 70) {
        priorityLevel = 'high'
        badge = '⚡ High'
      } else if (numericScore >= 50) {
        priorityLevel = 'medium'
        badge = '📊 Medium'
      } else {
        priorityLevel = 'low'
        badge = '📉 Low'
      }

      return {
        id: lead.id,
        customer_user_id: lead.customer_user_id,
        name: customerName,
        age: metadata.age || 0,
        photo: metadata.photo,
        initials: initials.toUpperCase(),
        score: numericScore,
        priorityScore: {
          totalScore: numericScore,
          priorityLevel,
          badge,
          details: {
            skinCondition: Math.round(numericScore * 0.3),
            engagement: Math.round(numericScore * 0.25),
            intent: Math.round(numericScore * 0.25),
            urgency: Math.round(numericScore * 0.2)
          }
        },
        isOnline,
  topConcern: lead.primary_concern || 'General consultation',
  secondaryConcern: lead.secondary_concerns?.[0] || null,
  estimatedValue: lead.estimated_value || 0,
  lastActivity,
  analysisTimestamp: lead.updated_at ? new Date(lead.updated_at) : new Date(lead.created_at),
        engagementCount: metadata.engagement_count || 0,
        analysisData: {
          wrinkles: metadata.wrinkles || 0,
          pigmentation: metadata.pigmentation || 0,
          pores: metadata.pores || 0,
          hydration: metadata.hydration || 0,
        },
        skinType: metadata.skin_type,
        email: lead.email,
        phone: lead.phone,
      }
    })

    return NextResponse.json({
      leads: hotLeads,
      total: hotLeads.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[hot-leads] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
