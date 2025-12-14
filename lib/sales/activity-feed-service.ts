import { createServerClient } from "@/lib/supabase/server"

const RANGE_WINDOWS: Record<string, { hours?: number; days?: number }> = {
  "24h": { hours: 24 },
  "7d": { days: 7 },
  "30d": { days: 30 },
  "90d": { days: 90 },
}

function resolveRange(value: string | null) {
  const key = value && RANGE_WINDOWS[value] ? value : "7d"
  const now = new Date()
  const start = new Date(now)
  const config = RANGE_WINDOWS[key]

  if (config.hours) {
    start.setHours(start.getHours() - config.hours)
  } else if (config.days) {
    start.setDate(start.getDate() - config.days)
  }

  return {
    key,
    start,
    end: now,
  }
}

export type ActivityFeedQuery = {
  userId: string
  clinicId: string | null
  limit: number
  offset: number
  leadId: string | null
  type: string | null
  rangeInput: string | null
}

export async function fetchActivityFeed(query: ActivityFeedQuery) {
  const supabase = await createServerClient()
  const { key: range, start } = resolveRange(query.rangeInput)

  let activitiesQuery = supabase
    .from("sales_activities")
    .select(
      `
        id,
        type,
        subject,
        description,
        contact_method,
        duration_minutes,
        is_task,
        due_date,
        completed_at,
        metadata,
        created_at,
        lead:sales_leads!sales_activities_lead_id_fkey (
          id,
          clinic_id,
          name,
          status,
          score,
          estimated_value,
          primary_concern,
          last_contact_at
        ),
        proposal:sales_proposals!sales_activities_proposal_id_fkey (
          id,
          title,
          status,
          total_value
        )
      `,
      { count: "exact" },
    )
    .eq("sales_user_id", query.userId)
    .gte("created_at", start.toISOString())
    .order("created_at", { ascending: false })
    .range(query.offset, query.offset + query.limit - 1)

  if (query.leadId) {
    activitiesQuery = activitiesQuery.eq("lead_id", query.leadId)
  }

  if (query.type) {
    activitiesQuery = activitiesQuery.eq("type", query.type)
  }

  if (query.clinicId) {
    activitiesQuery = activitiesQuery.eq("lead.clinic_id", query.clinicId)
  }

  const { data: activities, error, count } = await activitiesQuery

  if (error) {
    throw error
  }

  const mappedActivities = (activities ?? []).map((item: any) => {
    const metadata =
      item.metadata && typeof item.metadata === "string"
        ? (() => {
            try {
              return JSON.parse(item.metadata)
            } catch {
              return {}
            }
          })()
        : item.metadata ?? {}

    return {
      id: item.id,
      type: item.type,
      subject: item.subject,
      description: item.description,
      contactMethod: item.contact_method,
      durationMinutes: item.duration_minutes,
      isTask: item.is_task,
      dueDate: item.due_date,
      completedAt: item.completed_at,
      metadata,
      createdAt: item.created_at,
      lead: item.lead
        ? {
            id: item.lead.id,
            name: item.lead.name,
            status: item.lead.status,
            score: item.lead.score,
            estimatedValue: item.lead.estimated_value,
            primaryConcern: item.lead.primary_concern,
            lastContactAt: item.lead.last_contact_at,
          }
        : null,
      proposal: item.proposal
        ? {
            id: item.proposal.id,
            title: item.proposal.title,
            status: item.proposal.status,
            totalValue: item.proposal.total_value,
          }
        : null,
    }
  })

  const byType = new Map<string, number>()
  const leadSet = new Set<string>()

  for (const row of mappedActivities) {
    const activityType = row.type ?? "unknown"
    byType.set(activityType, (byType.get(activityType) ?? 0) + 1)

    if (row.lead?.id) {
      leadSet.add(row.lead.id)
    }
  }

  const latestActivityAt = mappedActivities[0]?.createdAt ?? null
  const oldestActivityAt = mappedActivities[mappedActivities.length - 1]?.createdAt ?? null

  const total = typeof count === "number" ? count : mappedActivities.length

  return {
    range,
    pagination: {
      total,
      limit: query.limit,
      offset: query.offset,
      hasMore: typeof count === "number" ? query.offset + query.limit < count : mappedActivities.length === query.limit,
    },
    summary: {
      totalActivities: mappedActivities.length,
      byType: Array.from(byType.entries()).map(([activityType, total]) => ({ type: activityType, total })),
      uniqueLeads: leadSet.size,
      latestActivityAt,
      oldestActivityAt,
    },
    data: mappedActivities,
  }
}
