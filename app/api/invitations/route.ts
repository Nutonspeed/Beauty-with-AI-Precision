/**
 * POST /api/invitations - Create new invitation
 * GET /api/invitations - List invitations
 * 
 * Updated to use hardened database functions for security and consistency
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email, invited_role, clinic_id, metadata } = body

    // Validate required fields
    if (!email || !invited_role) {
      return NextResponse.json(
        { error: 'Email and invited_role are required' },
        { status: 400 }
      )
    }

    // Call the hardened database function
    const { data, error } = await supabase.rpc('api_create_invitation', {
      p_email: email,
      p_invited_role: invited_role,
      p_clinic_id: clinic_id || null,
      p_metadata: metadata || {}
    })

    if (error) {
      console.error('Error creating invitation:', error)
      return NextResponse.json(
        { error: 'Failed to create invitation', details: error.message },
        { status: 500 }
      )
    }

    // Check if the function returned success
    if (!data?.success) {
      return NextResponse.json(
        { error: data?.error || 'Failed to create invitation' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      invitation: data.data
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const clinic_id = searchParams.get('clinic_id') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Call the database function
    const { data, error } = await supabase.rpc('api_list_invitations', {
      p_status: status,
      p_clinic_id: clinic_id ? clinic_id : null,
      p_limit: limit,
      p_offset: offset
    })

    if (error) {
      console.error('Error listing invitations:', error)
      return NextResponse.json(
        { error: 'Failed to list invitations', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in GET /api/invitations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

    
    
