import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// PUT /api/clinic/staff/[id]/status - Update staff status (active, on_leave, busy, available, offline)
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
    const { status } = body

    // Validate status
    const validStatuses = ['active', 'on_leave', 'busy', 'available', 'offline']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const { data: updatedStaff, error } = await supabase
      .from('clinic_staff')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .single()

    if (error) {
      console.error('Error updating status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Status updated successfully',
      data: updatedStaff
    })
  } catch (error) {
    console.error('Error in PUT /api/clinic/staff/[id]/status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
