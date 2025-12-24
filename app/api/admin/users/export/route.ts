import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const clinicId = searchParams.get('clinicId')

    // Check if user is super admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build query
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        clinic_id,
        phone,
        status,
        created_at,
        updated_at,
        clinics(id, name)
      `)

    // Apply filters
    if (role) {
      query = query.eq('role', role)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (clinicId) {
      query = query.eq('clinic_id', clinicId)
    }

    const { data: users, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    if (format === 'csv') {
      // Convert to CSV
      const headers = [
        'ID',
        'Email',
        'Name',
        'Role',
        'Clinic ID',
        'Clinic Name',
        'Phone',
        'Status',
        'Created At',
        'Updated At'
      ]

      const csvRows = [
        headers.join(','),
        ...users.map(user => [
          user.id,
          user.email,
          user.name || '',
          user.role,
          user.clinic_id || '',
          user.clinics?.name || '',
          user.phone || '',
          user.status || '',
          user.created_at,
          user.updated_at
        ].map(field => `"${field}"`).join(','))
      ]

      const csv = csvRows.join('\n')

      // Return CSV file
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'json') {
      // Return JSON
      return NextResponse.json({
        users,
        exported_at: new Date().toISOString(),
        total: users.length
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use csv or json' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error exporting users:', error)
    return NextResponse.json(
      { error: 'Failed to export users' },
      { status: 500 }
    )
  }
}
