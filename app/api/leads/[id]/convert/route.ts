import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeRole } from '@/lib/auth/role-normalize'
import { getSubscriptionStatus } from '@/lib/subscriptions/check-subscription'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/leads/[id]/convert
 * Convert a lead to a customer
 * Creates a user account if needed and marks lead as converted
 */
// --- Helper functions to reduce cognitive complexity of POST ---
async function requireSession(supabase: any) {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    return { response: NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 }) }
  }
  return { session }
}

async function fetchSalesStaff(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('sales_staff')
    .select('id, role, clinic_id')
    .eq('user_id', userId)
    .single()
  if (error || !data) {
    return { response: NextResponse.json({ success: false, message: 'Sales staff profile not found' }, { status: 403 }) }
  }
  return { salesStaff: data }
}

async function fetchLead(supabase: any, id: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) {
    return { response: NextResponse.json({ success: false, message: 'Lead not found' }, { status: 404 }) }
  }
  return { lead: data }
}

function verifyConvertible(lead: any, salesStaff: any) {
  const staffRole = normalizeRole(salesStaff.role)
  const permitted =
    lead.sales_staff_id === salesStaff.id ||
    staffRole === 'super_admin' ||
    (staffRole === 'clinic_admin' && lead.clinic_id === salesStaff.clinic_id)
  if (!permitted) {
    return { response: NextResponse.json({ success: false, message: 'You do not have permission to convert this lead' }, { status: 403 }) }
  }
  if (lead.converted_to_customer) {
    return { response: NextResponse.json({ success: false, message: 'Lead is already converted' }, { status: 400 }) }
  }
  return { staffRole }
}

async function createCustomerAccountIfNeeded(supabase: any, lead: any, opts: { create_user_account: boolean, password?: string }) {
  if (!opts.create_user_account) return { customerId: null }
  if (!lead.email) {
    return { response: NextResponse.json({ success: false, message: 'Email is required to create user account' }, { status: 400 }) }
  }
  if (!opts.password) {
    return { response: NextResponse.json({ success: false, message: 'Password is required to create user account' }, { status: 400 }) }
  }
  const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
    email: lead.email,
    password: opts.password,
    email_confirm: true,
    user_metadata: {
      full_name: lead.full_name,
      phone: lead.phone,
      line_id: lead.line_id,
      clinic_id: lead.clinic_id,
    },
  })
  if (authCreateError) {
    console.error('[LeadConvertAPI] Error creating user:', authCreateError)
    return { response: NextResponse.json({ success: false, message: `Failed to create user account: ${authCreateError.message}` }, { status: 400 }) }
  }
  const customerId = authData.user.id
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: customerId,
      email: lead.email,
      full_name: lead.full_name,
      phone: lead.phone,
      clinic_id: lead.clinic_id,
      role: 'customer',
    })
  if (profileError) {
    console.error('[LeadConvertAPI] Error creating user profile:', profileError)
  }
  return { customerId }
}

async function markLeadConverted(supabase: any, lead: any, id: string, customerId: string | null, createdAccount: boolean, salesStaff: any) {
  const convertedAt = new Date().toISOString()
  const { data, error } = await supabase
    .from('leads')
    .update({
      status: 'converted',
      converted_to_customer: true,
      converted_user_id: customerId,
      converted_at: convertedAt,
      interaction_history: [
        ...(lead.interaction_history || []),
        {
          date: convertedAt,
          type: 'converted',
          notes: createdAccount
            ? 'Lead converted to customer with user account'
            : 'Lead converted to customer',
          sales_staff_id: salesStaff.id,
        },
      ],
      updated_at: convertedAt,
    })
    .eq('id', id)
    .select(`
      *,
      clinic:clinics!clinic_id (
        id,
        name
      ),
      sales_staff:users!sales_staff_id (
        id,
        full_name
      ),
      converted_user:users!converted_user_id (
        id,
        email,
        full_name
      )
    `)
    .single()
  if (error) {
    console.error('[LeadConvertAPI] Error updating lead:', error)
    throw error
  }
  return { updatedLead: data }
}

function sendWelcomeEmailIfRequested(email: string | null, send_welcome_email: boolean) {
  if (!send_welcome_email || !email) return
  try {
    console.log('[LeadConvertAPI] Sending welcome email to:', email)
    // Future: invoke email microservice/provider
  } catch (error_) {
    console.warn('[LeadConvertAPI] Failed sending welcome email:', error_)
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const sessionRes = await requireSession(supabase)
    if ('response' in sessionRes) return sessionRes.response
    const userId = sessionRes.session.user.id

    const staffRes = await fetchSalesStaff(supabase, userId)
    if ('response' in staffRes) return staffRes.response
    const salesStaff = staffRes.salesStaff

    const leadRes = await fetchLead(supabase, id)
    if ('response' in leadRes) return leadRes.response
    const lead = leadRes.lead

    const convertibleRes = verifyConvertible(lead, salesStaff)
    if ('response' in convertibleRes) return convertibleRes.response

    const staffRole = convertibleRes.staffRole
    const isGlobalAdmin = ['super_admin', 'admin'].includes(staffRole)
    if (!isGlobalAdmin) {
      const subStatus = await getSubscriptionStatus(lead.clinic_id)
      if (!subStatus.isActive || subStatus.isTrialExpired) {
        const statusCode = subStatus.subscriptionStatus === 'past_due' || subStatus.isTrialExpired ? 402 : 403
        return NextResponse.json(
          {
            success: false,
            message: subStatus.message,
            subscription: {
              status: subStatus.subscriptionStatus,
              plan: subStatus.plan,
              isTrial: subStatus.isTrial,
              isTrialExpired: subStatus.isTrialExpired,
            },
          },
          { status: statusCode },
        )
      }
    }

    const body = await request.json()
    const { create_user_account = false, password, send_welcome_email = false } = body

    const accountRes = await createCustomerAccountIfNeeded(supabase, lead, { create_user_account, password })
    if ('response' in accountRes) return accountRes.response
    const customerId = accountRes.customerId

    const { updatedLead } = await markLeadConverted(supabase, lead, id, customerId, create_user_account, salesStaff)

    sendWelcomeEmailIfRequested(lead.email, send_welcome_email)

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: 'Lead converted successfully',
      customer_id: customerId,
    })
  } catch (error_) {
    console.error('[LeadConvertAPI] Error in POST:', error_)
    return NextResponse.json({
      success: false,
      message: 'Failed to convert lead',
      error: error_ instanceof Error ? error_.message : 'Unknown error',
    }, { status: 500 })
  }
}
