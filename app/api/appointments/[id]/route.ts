import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { withClinicAuth } from "@/lib/auth/middleware"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET /api/appointments/[id] - Get single appointment
export const GET = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || ''

    const { data: appointment, error } = await supabaseAdmin
      .from('appointment_slots')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
      }
      console.error('[appointments/[id]] Error fetching appointment:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ appointment })

  } catch (error) {
    console.error('[appointments/[id]] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
})

// PATCH /api/appointments/[id] - Update appointment
export const PATCH = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || ''
    const body = await req.json()

    const {
      status,
      confirmation_status,
      payment_status,
      customer_notes,
      staff_notes,
      special_requirements
    } = body

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {}

    if (status !== undefined) updates.status = status
    if (confirmation_status !== undefined) updates.confirmation_status = confirmation_status
    if (payment_status !== undefined) updates.payment_status = payment_status
    if (customer_notes !== undefined) updates.customer_notes = customer_notes
    if (staff_notes !== undefined) updates.staff_notes = staff_notes
    if (special_requirements !== undefined) updates.special_requirements = special_requirements

    // Update timestamps based on status
    if (status === 'confirmed' && !updates.confirmed_at) {
      updates.confirmed_at = new Date().toISOString()
    }
    if (status === 'completed' && !updates.completed_at) {
      updates.completed_at = new Date().toISOString()
    }
    if (status === 'cancelled' && !updates.cancelled_at) {
      updates.cancelled_at = new Date().toISOString()
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data: appointment, error } = await supabaseAdmin
      .from('appointment_slots')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[appointments/[id]] Error updating appointment:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      appointment
    })

  } catch (error) {
    console.error('[appointments/[id]] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
})

// DELETE /api/appointments/[id] - Delete appointment
export const DELETE = withClinicAuth(async (req: NextRequest, user: any) => {
  try {
    const id = req.nextUrl.pathname.split('/').pop() || ''

    const { error } = await supabaseAdmin
      .from('appointment_slots')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[appointments/[id]] Error deleting appointment:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully'
    })

  } catch (error) {
    console.error('[appointments/[id]] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
})
