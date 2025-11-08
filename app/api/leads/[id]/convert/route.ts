import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: {
    id: string
  }
}

/**
 * POST /api/leads/[id]/convert
 * Convert a lead to a customer
 * Creates a user account if needed and marks lead as converted
 */
export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = params
    const supabase = await createClient()

    // Verify authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get sales staff info
    const { data: salesStaff, error: staffError } = await supabase
      .from('sales_staff')
      .select('id, role, clinic_id')
      .eq('user_id', userId)
      .single()

    if (staffError || !salesStaff) {
      return NextResponse.json(
        { success: false, message: 'Sales staff profile not found' },
        { status: 403 }
      )
    }

    // Fetch lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      )
    }

    // Check permission
    const canConvert = 
      lead.sales_staff_id === salesStaff.id ||
      salesStaff.role === 'super_admin' ||
      (salesStaff.role === 'clinic_admin' && lead.clinic_id === salesStaff.clinic_id)

    if (!canConvert) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to convert this lead' },
        { status: 403 }
      )
    }

    // Check if already converted
    if (lead.converted_to_customer) {
      return NextResponse.json(
        { success: false, message: 'Lead is already converted' },
        { status: 400 }
      )
    }

    // Parse request body for additional customer data
    const body = await request.json()
    const {
      create_user_account = false,
      password,
      send_welcome_email = false,
    } = body

    let customerId = null

    // Option 1: Create a new user account
    if (create_user_account) {
      if (!lead.email) {
        return NextResponse.json(
          { success: false, message: 'Email is required to create user account' },
          { status: 400 }
        )
      }

      if (!password) {
        return NextResponse.json(
          { success: false, message: 'Password is required to create user account' },
          { status: 400 }
        )
      }

      // Create Supabase auth user
      const { data: authData, error: authCreateError } = await supabase.auth.admin.createUser({
        email: lead.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: lead.full_name,
          phone: lead.phone,
          line_id: lead.line_id,
          clinic_id: lead.clinic_id,
        },
      })

      if (authCreateError) {
        console.error('[LeadConvertAPI] Error creating user:', authCreateError)
        return NextResponse.json(
          { success: false, message: `Failed to create user account: ${authCreateError.message}` },
          { status: 400 }
        )
      }

      customerId = authData.user.id

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: customerId,
          email: lead.email,
          full_name: lead.full_name,
          phone: lead.phone,
          clinic_id: lead.clinic_id,
          role: 'customer',
        })

      if (profileError) {
        console.error('[LeadConvertAPI] Error creating user profile:', profileError)
        // Continue anyway, auth user is created
      }
    }

    // Update lead status to converted
    const convertedAt = new Date().toISOString()
    
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update({
        status: 'converted',
        converted_to_customer: true,
        converted_user_id: customerId,
        converted_at: convertedAt,
        interaction_history: [
          ...(lead.interaction_history || []),
          {
            date: convertedAt,
            type: 'converted',
            notes: create_user_account 
              ? 'Lead converted to customer with user account'
              : 'Lead converted to customer',
            sales_staff_id: salesStaff.id,
          },
        ],
        updated_at: convertedAt,
      })
      .eq('id', id)
      .select(`
        *,
        clinic:clinics!clinic_id (
          id,
          name
        ),
        sales_staff:users!sales_staff_id (
          id,
          full_name
        ),
        converted_user:users!converted_user_id (
          id,
          email,
          full_name
        )
      `)
      .single()

    if (updateError) {
      console.error('[LeadConvertAPI] Error updating lead:', updateError)
      throw updateError
    }

    // TODO: Send welcome email if requested
    if (send_welcome_email && lead.email) {
      // Implement email sending here
      console.log('[LeadConvertAPI] Would send welcome email to:', lead.email)
    }

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: 'Lead converted successfully',
      customer_id: customerId,
    })
  } catch (error) {
    console.error('[LeadConvertAPI] Error in POST:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to convert lead',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
