
import { createServerClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

export type LeadsListParams = {
  userId: string
  clinicId: string | null
  status: string | null
  search: string | null
  remoteConsultOnly: boolean
  limit: number
  offset: number
}

function safeParseJson(value: unknown) {
  if (!value) return {}
  if (typeof value === 'object') return value as Record<string, unknown>
  if (typeof value !== 'string') return {}
  try {
    return JSON.parse(value) as Record<string, unknown>
  } catch {
    return {}
  }
}

function normalizeLeadStatus(inputStatus: unknown) {
  const s = String(inputStatus || '').trim().toLowerCase()
  if (s === 'converted') return 'won'
  const allowed = new Set([
    'new',
    'contacted',
    'qualified',
    'proposal_sent',
    'negotiation',
    'won',
    'lost',
    'cold',
    'warm',
    'hot',
  ])
  return allowed.has(s) ? s : 'new'
}

function normalizeLeadSource(inputSource: unknown) {
  const s = String(inputSource || '').trim().toLowerCase()
  const allowed = new Set([
    'website',
    'facebook',
    'instagram',
    'google_ads',
    'referral',
    'walk_in',
    'phone',
    'email',
    'other',
    'ai_scan',
    'quick_scan',
  ])
  if (!s) return 'website'
  return allowed.has(s) ? s : 'website'
}

function clampScore(score: number) {
  return Math.max(0, Math.min(score, 100))
}

function computeScoreFromInput(input: any) {
  const direct = Number(input?.score)
  if (Number.isFinite(direct) && direct > 0) return clampScore(direct)

  const meta = safeParseJson(input?.metadata)
  const estimatedValue = Number(input?.estimated_value ?? (meta as any).estimated_value ?? 0)
  const concerns = (meta as any).concerns

  const maxSeverity = Array.isArray(concerns) && concerns.length
    ? Math.max(...concerns.map((c: any) => Number(c?.severity) || 0))
    : 0

  let score = 0
  score += Math.min(maxSeverity * 8, 40)
  score += Math.min(Math.floor(estimatedValue / 1000), 40)
  score += 20

  return clampScore(score)
}

export async function listLeads(params: LeadsListParams) {
  const supabase = await createServerClient()

  let query = supabase
    .from('sales_leads')
    .select(
      `
        *,
        sales_user:users!sales_leads_sales_user_id_fkey(full_name, email),
        customer:users!sales_leads_customer_user_id_fkey(full_name, email)
      `,
      { count: 'exact' },
    )
    .eq('sales_user_id', params.userId)
    .order('created_at', { ascending: false })
    .range(params.offset, params.offset + params.limit - 1)

  if (params.clinicId) {
    query = query.eq('clinic_id', params.clinicId)
  }

  if (params.status && params.status !== 'all') {
    query = query.eq('status', normalizeLeadStatus(params.status))
  }

  if (params.search) {
    const s = String(params.search).trim().slice(0, 120).replace(/[(),]/g, ' ')
    query = query.or(`name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`)
  }

  if (params.remoteConsultOnly) {
    query = query.contains('metadata', { remote_consult_request: true })
  }

  const { data, error, count } = await query
  if (error) throw error

  return {
    data: data || [],
    pagination: {
      total: count || 0,
      limit: params.limit,
      offset: params.offset,
      hasMore: (count || 0) > params.offset + params.limit,
    },
  }
}

function ensureEmail(input: any) {
  const email = input?.email ? String(input.email).trim() : ''
  if (email) return { email, emailPlaceholder: false }
  const generated = `noemail-${randomUUID()}@placeholder.invalid`
  return { email: generated, emailPlaceholder: true }
}

export async function createLead(userId: string, clinicId: string | null, body: any) {
  const supabase = await createServerClient()

  if (!body?.name) {
    const err: any = new Error('Name is required')
    err.status = 400
    throw err
  }

  const { email, emailPlaceholder } = ensureEmail(body)

  if (body?.phone && !/^[0-9-+() ]+$/.test(String(body.phone))) {
    const err: any = new Error('Invalid phone format')
    err.status = 400
    throw err
  }

  const source = normalizeLeadSource(body?.source)
  const score = computeScoreFromInput(body)

  const metadataInput = safeParseJson(body?.metadata)
  const metadata: any = {
    ...metadataInput,
    ...(emailPlaceholder ? { email_placeholder: true } : {}),
  }

  const leadData: any = {
    sales_user_id: userId,
    clinic_id: clinicId,
    customer_user_id: body?.customer_user_id ?? null,
    name: body.name,
    email,
    phone: body?.phone ?? null,
    line_id: body?.line_id ?? null,
    status: normalizeLeadStatus(body?.status),
    score,
    source,
    primary_concern: body?.primary_concern ?? body?.concern ?? null,
    secondary_concerns: body?.secondary_concerns ?? null,
    interested_treatments: body?.interested_treatments ?? null,
    estimated_value: body?.estimated_value ?? (metadata as any)?.estimated_value ?? 0,
    budget_range_min: body?.budget_range_min ?? body?.budget_min ?? null,
    budget_range_max: body?.budget_range_max ?? body?.budget_max ?? null,
    next_follow_up_at: body?.next_follow_up_at ?? body?.preferred_date ?? null,
    tags: body?.tags ?? [],
    notes: body?.notes ?? null,
    metadata,
  }

  const { data: newLead, error } = await supabase
    .from('sales_leads')
    .insert([leadData])
    .select(
      `
        *,
        sales_user:users!sales_leads_sales_user_id_fkey(full_name, email),
        customer:users!sales_leads_customer_user_id_fkey(full_name, email)
      `,
    )
    .single()

  if (error) throw error
  return newLead
}

export async function getLeadById(userId: string, clinicId: string | null, id: string) {
  const supabase = await createServerClient()

  let query = supabase
    .from('sales_leads')
    .select(
      `
        *,
        sales_user:users!sales_leads_sales_user_id_fkey(full_name, email),
        customer:users!sales_leads_customer_user_id_fkey(full_name, email)
      `,
    )
    .eq('id', id)
    .eq('sales_user_id', userId)

  if (clinicId) query = query.eq('clinic_id', clinicId)

  const { data, error } = await query.single()
  if (error) throw error
  return data
}

export async function updateLead(userId: string, clinicId: string | null, id: string, body: any) {
  const supabase = await createServerClient()

  if (body?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(body.email))) {
      const err: any = new Error('Invalid email format')
      err.status = 400
      throw err
    }
  }

  if (body?.phone && !/^[0-9-+() ]+$/.test(String(body.phone))) {
    const err: any = new Error('Invalid phone format')
    err.status = 400
    throw err
  }

  if (body?.score !== undefined) {
    const s = Number(body.score)
    if (!Number.isFinite(s) || s < 0 || s > 100) {
      const err: any = new Error('Score must be between 0 and 100')
      err.status = 400
      throw err
    }
  }

  const updateData: any = {}
  const fieldMap: Array<[string, string]> = [
    ['name', 'name'],
    ['email', 'email'],
    ['phone', 'phone'],
    ['status', 'status'],
    ['source', 'source'],
    ['primary_concern', 'primary_concern'],
    ['concern', 'primary_concern'],
    ['secondary_concerns', 'secondary_concerns'],
    ['interested_treatments', 'interested_treatments'],
    ['estimated_value', 'estimated_value'],
    ['budget_range_min', 'budget_range_min'],
    ['budget_min', 'budget_range_min'],
    ['budget_range_max', 'budget_range_max'],
    ['budget_max', 'budget_range_max'],
    ['next_follow_up_at', 'next_follow_up_at'],
    ['preferred_date', 'next_follow_up_at'],
    ['score', 'score'],
    ['notes', 'notes'],
    ['tags', 'tags'],
    ['metadata', 'metadata'],
    ['last_contact_at', 'last_contact_at'],
    ['last_contact_date', 'last_contact_at'],
  ]

  for (const [inputKey, dbKey] of fieldMap) {
    if (body?.[inputKey] !== undefined) {
      if (dbKey === 'status') {
        updateData[dbKey] = normalizeLeadStatus(body[inputKey])
      } else if (dbKey === 'source') {
        updateData[dbKey] = normalizeLeadSource(body[inputKey])
      } else if (dbKey === 'metadata') {
        updateData[dbKey] = safeParseJson(body[inputKey])
      } else {
        updateData[dbKey] = body[inputKey]
      }
    }
  }

  let query = supabase
    .from('sales_leads')
    .update(updateData)
    .eq('id', id)
    .eq('sales_user_id', userId)

  if (clinicId) query = query.eq('clinic_id', clinicId)

  const { data, error } = await query
    .select(
      `
        *,
        sales_user:users!sales_leads_sales_user_id_fkey(full_name, email),
        customer:users!sales_leads_customer_user_id_fkey(full_name, email)
      `,
    )
    .single()

  if (error) throw error
  return data
}

export async function softDeleteLead(userId: string, clinicId: string | null, id: string) {
  const supabase = await createServerClient()

  let query = supabase
    .from('sales_leads')
    .update({ status: 'lost', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('sales_user_id', userId)

  if (clinicId) query = query.eq('clinic_id', clinicId)

  const { error } = await query
  if (error) throw error
  return { success: true }
}
