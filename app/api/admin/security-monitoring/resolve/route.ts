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
    const { id } = body as { id?: string }
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    const { error: updateError } = await supabase
      .from('security_events')
      .update({ resolved: true, resolved_by: user.id, resolved_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to resolve event', details: updateError.message }, { status: 500 })
    }

    // Audit log (best-effort)
    try {
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'security_event_resolved',
        resource_type: 'security_event',
        resource_id: id,
        details: { event_id: id, resolved_by: user.email },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      })
    } catch (e) {
      console.warn('Audit log failed:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resolve security event error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
