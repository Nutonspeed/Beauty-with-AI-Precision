import { NextResponse } from 'next/server'
import { withSalesAuth } from '@/lib/auth/middleware'

// GET - Get all activities for a lead
export const GET = withSalesAuth(async (req, authenticatedUser) => {
  const id = req.nextUrl.pathname.split('/').slice(-2, -1)[0] || ''
  try {
    const { listLeadActivities } = await import('@/lib/sales/lead-activities-service')
    const payload = await listLeadActivities(authenticatedUser.id, authenticatedUser.clinic_id ?? null, id)
    return NextResponse.json(payload)
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json({ error: error?.message || 'Failed to load activities' }, { status })
  }
}, { rateLimitCategory: 'api' })

// POST - Add new activity to lead
export const POST = withSalesAuth(async (req, authenticatedUser) => {
  const id = req.nextUrl.pathname.split('/').slice(-2, -1)[0] || ''
  try {
    const body = await req.json()
    const { createLeadActivity } = await import('@/lib/sales/lead-activities-service')

    // Backward compatibility: allow title -> subject
    const normalized = {
      ...body,
      subject: body?.subject ?? body?.title,
    }

    const payload = await createLeadActivity(authenticatedUser.id, authenticatedUser.clinic_id ?? null, id, normalized)
    return NextResponse.json(payload, { status: 201 })
  } catch (error: any) {
    const status = error?.status || 500
    return NextResponse.json({ error: error?.message || 'Failed to create activity' }, { status })
  }
}, { rateLimitCategory: 'api' })
