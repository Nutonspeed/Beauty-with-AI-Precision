import { NextResponse } from 'next/server'
import { withSalesAuth } from '@/lib/auth/middleware'

export const GET = withSalesAuth(async (req, authenticatedUser) => {
  const id = req.nextUrl.pathname.split('/').pop() || '';
  try {
    const { getLeadById } = await import('@/lib/sales/leads-service')
    const lead = await getLeadById(authenticatedUser.id, authenticatedUser.clinic_id ?? null, id)
    return NextResponse.json(lead)
  } catch (error: any) {
    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }
    return NextResponse.json({ error: error?.message || 'Failed to fetch lead' }, { status: 500 })
  }
}, { rateLimitCategory: 'api' });

export const PATCH = withSalesAuth(async (req, authenticatedUser) => {
  const id = req.nextUrl.pathname.split('/').pop() || '';
  const body = await req.json();
  try {
    const { updateLead } = await import('@/lib/sales/leads-service')
    const { createLeadActivity } = await import('@/lib/sales/lead-activities-service')

    const updatedLead = await updateLead(authenticatedUser.id, authenticatedUser.clinic_id ?? null, id, body)

    if (body.status) {
      await createLeadActivity(authenticatedUser.id, authenticatedUser.clinic_id ?? null, id, {
        type: 'status_change',
        subject: 'Status Updated',
        description: `Status changed to ${body.status}`,
        metadata: { new_status: body.status },
      })
    }

    return NextResponse.json({ data: updatedLead })
  } catch (error: any) {
    const status = error?.status || (error?.code === 'PGRST116' ? 404 : 500)
    return NextResponse.json({ error: error?.message || 'Failed to update lead' }, { status })
  }
}, { rateLimitCategory: 'api' });

export const DELETE = withSalesAuth(async (req, authenticatedUser) => {
  const id = req.nextUrl.pathname.split('/').pop() || '';
  try {
    const { softDeleteLead } = await import('@/lib/sales/leads-service')
    const { logLeadSystemActivity } = await import('@/lib/sales/lead-activities-service')

    await softDeleteLead(authenticatedUser.id, authenticatedUser.clinic_id ?? null, id)

    await logLeadSystemActivity(authenticatedUser.id, authenticatedUser.clinic_id ?? null, id, 'Lead Archived', 'Lead marked as lost')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const status = error?.code === 'PGRST116' ? 404 : 500
    return NextResponse.json({ error: error?.message || 'Failed to delete lead' }, { status })
  }
}, { rateLimitCategory: 'api' });
