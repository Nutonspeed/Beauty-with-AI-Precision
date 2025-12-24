/**
 * GET /api/staff/schedule
 * Fetch staff member's appointment schedule
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's role and clinic
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, clinic_id, full_name')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Staff access check
    const staffRoles = ['clinic_owner', 'clinic_manager', 'clinic_staff', 'sales_staff', 'therapist', 'receptionist']
    if (!staffRoles.includes(userData.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const staffId = searchParams.get('staffId') || user.id

    // Can only view own schedule unless admin/manager
    if (staffId !== user.id && !['clinic_owner', 'clinic_manager'].includes(userData.role)) {
      return NextResponse.json({ error: 'Cannot view other staff schedules' }, { status: 403 })
    }

    // Fetch appointments for the staff member
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        appointment_time,
        duration_minutes,
        status,
        notes,
        service_type,
        customers!inner(
          id,
          full_name,
          phone
        ),
        branches(
          id,
          name,
          room_number
        )
      `)
      .eq('staff_id', staffId)
      .eq('appointment_date', date)
      .order('appointment_time', { ascending: true })

    if (apptError) {
      console.error('Schedule fetch error:', apptError)
      return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 })
    }

    // Group appointments by status
    const schedule = {
      today: date,
      staff: {
        id: staffId,
        name: userData.full_name,
        role: userData.role
      },
      summary: {
        total: appointments?.length || 0,
        completed: appointments?.filter(a => a.status === 'completed').length || 0,
        pending: appointments?.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length || 0,
        inProgress: appointments?.filter(a => a.status === 'in_progress').length || 0,
        cancelled: appointments?.filter(a => a.status === 'cancelled' || a.status === 'no_show').length || 0
      },
      appointments: appointments?.map(apt => ({
        id: apt.id,
        time: apt.appointment_time,
        duration: apt.duration_minutes || 60,
        status: apt.status,
        customer: apt.customers?.[0]?.full_name || 'Unknown Customer',
        customerPhone: apt.customers?.[0]?.phone || '',
        treatment: apt.service_type,
        room: apt.branches?.[0]?.room_number || 'Main',
        branch: apt.branches?.[0]?.name || 'Main Branch',
        notes: apt.notes
      })) || []
    }

    return NextResponse.json(schedule)

  } catch (error) {
    console.error('Schedule API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
