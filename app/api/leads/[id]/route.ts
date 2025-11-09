import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { normalizeRole } from '@/lib/auth/role-normalize'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/leads/[id]
 * Fetch a single lead by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
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

    // Fetch lead with relations
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select(`
        *,
        clinic:clinics!clinic_id (
          id,
          name,
          logo_url,
          contact_phone,
          contact_email
        ),
        branch:branches!branch_id (
          id,
          name,
          address
        ),
        sales_staff:users!sales_staff_id (
          id,
          full_name,
          email
        ),
        analysis:skin_analyses!analysis_id (
          id,
          overall_score,
          image_url,
          ai_skin_type,
          ai_concerns,
          created_at
        )
      `)
      .eq('id', id)
      .single()

    if (leadError || !lead) {
      console.error('[LeadDetailAPI] Lead not found:', id)
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      )
    }

    // Check permission: owner, clinic admin, or super admin
    const staffRole = normalizeRole(salesStaff.role)
    const canView = 
      lead.sales_staff_id === salesStaff.id ||
      staffRole === 'super_admin' ||
      (staffRole === 'clinic_admin' && lead.clinic_id === salesStaff.clinic_id)

    if (!canView) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to view this lead' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: lead,
    })
  } catch (error) {
    console.error('[LeadDetailAPI] Error in GET:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch lead',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/leads/[id]
 * Update a lead
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
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

    // Fetch existing lead
    const { data: existingLead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingLead) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      )
    }

    // Check permission
    const staffRole2 = normalizeRole(salesStaff.role)
    const canEdit = 
      existingLead.sales_staff_id === salesStaff.id ||
      staffRole2 === 'super_admin' ||
      (staffRole2 === 'clinic_admin' && existingLead.clinic_id === salesStaff.clinic_id)

    if (!canEdit) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to edit this lead' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      full_name,
      phone,
      email,
      line_id,
      status,
      follow_up_date,
      next_action,
      interested_treatments,
      budget_range,
      notes,
      lead_score,
      add_interaction,
    } = body

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (full_name !== undefined) updates.full_name = full_name
    if (phone !== undefined) updates.phone = phone
    if (email !== undefined) updates.email = email
    if (line_id !== undefined) updates.line_id = line_id
    if (status !== undefined) updates.status = status
    if (follow_up_date !== undefined) updates.follow_up_date = follow_up_date
    if (next_action !== undefined) updates.next_action = next_action
    if (interested_treatments !== undefined) updates.interested_treatments = interested_treatments
    if (budget_range !== undefined) updates.budget_range = budget_range
    if (notes !== undefined) updates.notes = notes
    if (lead_score !== undefined) updates.lead_score = Math.max(0, Math.min(100, lead_score))

    // Update last contact date if status changed
    if (status && status !== existingLead.status) {
      updates.last_contact_date = new Date().toISOString().split('T')[0]
    }

    // Add interaction to history if provided
    if (add_interaction) {
      const newInteraction = {
        date: new Date().toISOString(),
        type: add_interaction.type || 'follow_up',
        notes: add_interaction.notes,
        sales_staff_id: salesStaff.id,
      }

      const interactionHistory = existingLead.interaction_history || []
      updates.interaction_history = [...interactionHistory, newInteraction]
    }

    // Update lead
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update(updates)
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
        )
      `)
      .single()

    if (updateError) {
      console.error('[LeadDetailAPI] Error updating lead:', updateError)
      throw updateError
    }

    return NextResponse.json({
      success: true,
      data: updatedLead,
      message: 'Lead updated successfully',
    })
  } catch (error) {
    console.error('[LeadDetailAPI] Error in PATCH:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update lead',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/leads/[id]
 * Delete a lead (soft delete by setting status to 'lost')
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params
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

    // Fetch existing lead
    const { data: existingLead, error: fetchError } = await supabase
      .from('leads')
      .select('sales_staff_id, clinic_id')
      .eq('id', id)
      .single()

    if (fetchError || !existingLead) {
      return NextResponse.json(
        { success: false, message: 'Lead not found' },
        { status: 404 }
      )
    }

    // Check permission (only super admin can hard delete)
    const staffRole3 = normalizeRole(salesStaff.role)
    const canDelete = 
      staffRole3 === 'super_admin' ||
      (staffRole3 === 'clinic_admin' && existingLead.clinic_id === salesStaff.clinic_id)

    if (!canDelete) {
      return NextResponse.json(
        { success: false, message: 'You do not have permission to delete this lead' },
        { status: 403 }
      )
    }

    // Hard delete (only for admins)
    const { error: deleteError } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('[LeadDetailAPI] Error deleting lead:', deleteError)
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    })
  } catch (error) {
    console.error('[LeadDetailAPI] Error in DELETE:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete lead',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
