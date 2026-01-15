import { createServerClient } from '@/lib/supabase/server'

export interface HotLead {
  id: string
  customer_user_id: string | null
  name: string
  age: number
  photo: string | null
  initials: string
  score: number
  status: string
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
  lastEngagementDuration?: number
  lastEngagementType?: string
  lastScrollDepth?: number
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

export async function fetchHotLeadsForUser(userId: string, centerId: string | null, limit = 20, offset = 0) {
  const safeLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 20
  const safeOffset = Number.isFinite(offset) ? Math.max(offset, 0) : 0
  const supabase = await createServerClient()
  let leadsQuery = supabase
    .from('sales_leads')
    .select('*')
    .eq('sales_user_id', userId)
    .in('status', ['new', 'contacted', 'qualified', 'active'])
    .order('score', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(safeOffset, safeOffset + safeLimit - 1)

  if (centerId) {
    leadsQuery = leadsQuery.eq('center_id', centerId)
  }

  const { data: leads, error } = await leadsQuery

  if (error) throw error

  return (leads || []).map((lead: any) => {
    const customerName = lead.name || 'Unknown Customer'
    const nameParts = String(customerName).trim().split(/\s+/).filter(Boolean)
    const initials = nameParts.length > 1
      ? `${(nameParts[0]?.[0] || 'U')}${(nameParts[nameParts.length - 1]?.[0] || 'N')}`
      : `${(nameParts[0]?.[0] || 'U')}${(nameParts[0]?.[1] || 'N')}`
    
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

    let metadata: any = {}
    if (lead.metadata) {
      if (typeof lead.metadata === 'string') {
        try {
          metadata = JSON.parse(lead.metadata)
        } catch {
          metadata = {}
        }
      } else {
        metadata = lead.metadata
      }
    }

    const isOnline = minutesAgo < 5
    const numericScore = lead.score || 50
    let priorityLevel: 'critical' | 'high' | 'medium' | 'low'
    let badge: string

    // Enhanced priority logic including engagement
    const hasHighEngagement = (metadata.last_engagement_duration || 0) > 60
    
    if (numericScore >= 90 || (numericScore >= 80 && hasHighEngagement)) {
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
      status: lead.status || 'new',
      priorityScore: {
        totalScore: numericScore,
        priorityLevel,
        badge,
        details: {
          skinCondition: Math.round(numericScore * 0.3),
          engagement: Math.round(numericScore * 0.25) + (hasHighEngagement ? 15 : 0),
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
      lastEngagementDuration: metadata.last_engagement_duration,
      lastEngagementType: metadata.last_engagement_type,
      lastScrollDepth: metadata.last_scroll_depth,
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
  }) as HotLead[]
}
