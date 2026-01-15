
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { leadId } = await req.json()
    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    // 1. Get lead and center details
    const { data: lead, error: leadError } = await supabase
      .from('sales_leads')
      .select('id, center_id, name, email')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    // 2. Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // 3. Store invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('customer_invitations')
      .insert({
        lead_id: leadId,
        token,
        expires_at: expiresAt.toISOString(),
        center_id: lead.center_id,
        created_by: user.id
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Invite generation error:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // 4. Construct invite URL
    // In production, this would use the real domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/auth/signup?invite=${token}&lead=${leadId}`

    return NextResponse.json({ 
      success: true, 
      inviteUrl,
      token,
      expiresAt: expiresAt.toISOString()
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
