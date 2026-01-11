import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/clinic/staff/[id] - Get single staff member
export async function GET(
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

    const { data: staff, error } = await supabase
      .from('clinic_staff')
      .select(`
        *,
        user:users(id, email, full_name)
      `)
      .eq('id', id)
      .single()

    if (error || !staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error in GET /api/clinic/staff/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/clinic/staff/[id] - Update staff member
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

    // Allowed fields for update
    const allowedFields = [
      'role',
      'specialty',
      'status',
      'full_name',
      'email',
      'phone',
      'avatar_url',
      'working_hours',
      'days_off',
      'hired_date',
      'terminated_date',
      'bio',
      'certifications',
      'languages',
      'metadata'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Handle license info in metadata
    if (body.license_number !== undefined || body.license_expiry !== undefined) {
      const { data: currentStaff } = await supabase
        .from('clinic_staff')
        .select('metadata')
        .eq('id', id)
        .single()

      updateData.metadata = {
        ...(currentStaff?.metadata || {}),
        license_number: body.license_number,
        license_expiry: body.license_expiry
      }
    }

    updateData.updated_at = new Date().toISOString()

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
      console.error('Error updating staff:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updatedStaff)
  } catch (error) {
    console.error('Error in PUT /api/clinic/staff/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/clinic/staff/[id] - Soft delete (terminate) staff member
export async function DELETE(
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

    // Soft delete: set status to offline and terminated_date
    const { data: terminatedStaff, error } = await supabase
      .from('clinic_staff')
      .update({
        status: 'offline',
        terminated_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error terminating staff:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Staff member terminated successfully',
      data: terminatedStaff
    })
  } catch (error) {
    console.error('Error in DELETE /api/clinic/staff/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
