import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PUT /api/clinic/staff/[id]/schedule - Update staff working hours and days off
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createServerClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { working_hours, days_off } = body

    // Validate working_hours format (if provided)
    if (working_hours && typeof working_hours !== 'object') {
      return NextResponse.json(
        { error: 'Invalid working_hours format. Expected object with day keys.' },
        { status: 400 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (working_hours !== undefined) {
      updateData.working_hours = working_hours
    }
    if (days_off !== undefined) {
      updateData.days_off = days_off
    }

    const { data: updatedStaff, error } = await supabase
      .from('clinic_staff')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .single()

    if (error) {
      console.error('Error updating schedule:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Schedule updated successfully',
      data: updatedStaff
    })
  } catch (error) {
    console.error('Error in PUT /api/clinic/staff/[id]/schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
