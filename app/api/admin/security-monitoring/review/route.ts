import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { id, reviewed = true } = body as { id?: string; reviewed?: boolean }
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error: updateError } = await supabase
      .from('suspicious_activities')
      .update({ reviewed, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update activity', details: updateError.message }, { status: 500 })
    }

    // Audit log (best-effort)
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: reviewed ? 'suspicious_activity_reviewed' : 'suspicious_activity_unreviewed',
        resource_type: 'suspicious_activity',
        resource_id: id,
        details: { activity_id: id, reviewed, reviewed_by: user.email },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      })
    } catch (e) {
      console.warn('Audit log failed:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Review suspicious activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
