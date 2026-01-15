
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { intent, program_name, notes } = await req.json()

    if (!intent) {
      return NextResponse.json({ error: 'Intent is required' }, { status: 400 })
    }

    // 1. Find existing lead for this user or create a new one
    // We match by customer_user_id (the user is already a customer)
    const { data: existingLead } = await supabase
      .from('sales_leads')
      .select('id, interested_programs, score')
      .eq('customer_user_id', user.id)
      .single()

    if (existingLead) {
      // Update existing lead with new intent
      const currentPrograms = (existingLead as any).interested_programs || []
      const updatedPrograms = Array.from(new Set([...currentPrograms, program_name])).filter(Boolean)
      
      const { error: updateError } = await supabase
        .from('sales_leads')
        .update({
          interested_programs: updatedPrograms,
          score: Math.min(100, ((existingLead as any).score || 0) + 10), // Boost score for showing intent
          last_contact_at: new Date().toISOString(),
          notes: ((existingLead as any).notes || '') + `\n[AI Concierge] Detected intent for: ${program_name}. Notes: ${notes}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLead.id)

      if (updateError) throw updateError

      return NextResponse.json({ success: true, message: 'Intent captured and lead updated', lead_id: existingLead.id })
    } else {
      // If no lead record exists for this converted customer, we might want to create one 
      // or just skip if they are already a customer. Usually, a lead record is good for tracking upsells.
      // For now, let's create an upsell lead if center_id is available.
      const { data: userData } = await supabase.from('users').select('center_id, full_name, email, phone').eq('id', user.id).single()
      
      if (userData?.center_id) {
        const { data: newLead, error: createError } = await supabase
          .from('sales_leads')
          .insert({
            customer_user_id: user.id,
            center_id: userData.center_id,
            full_name: userData.full_name,
            email: userData.email,
            phone: userData.phone,
            status: 'new',
            source: 'ai_concierge',
            interested_programs: [program_name].filter(Boolean),
            score: 60,
            notes: `[AI Concierge] New upsell intent captured for: ${program_name}. Notes: ${notes}`
          })
          .select('id')
          .single()

        if (createError) throw createError
        return NextResponse.json({ success: true, message: 'New upsell lead created', lead_id: newLead.id })
      }
    }

    return NextResponse.json({ success: true, message: 'Intent logged' })

  } catch (error) {
    console.error('Lead Capture Intent Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
