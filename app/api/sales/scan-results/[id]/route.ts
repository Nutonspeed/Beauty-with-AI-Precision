import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/sales/scan-results/[id] - Get single scan result
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: scanResult, error: queryError } = await supabase
      .from('skin_scan_results')
      .select('*')
      .eq('id', params.id)
      .single();

    if (queryError) {
      if (queryError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Scan result not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching scan result:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch scan result', details: queryError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: scanResult });
  } catch (error) {
    console.error('Unexpected error in GET /api/sales/scan-results/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/sales/scan-results/[id] - Update scan result
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      status,
      notes,
      lead_id,
      email_sent,
      email_sent_at,
      chat_sent,
      chat_sent_at,
      customer_email
    } = body;

    // Build update object
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (lead_id !== undefined) updateData.lead_id = lead_id;
    if (email_sent !== undefined) updateData.email_sent = email_sent;
    if (email_sent_at !== undefined) updateData.email_sent_at = email_sent_at;
    if (chat_sent !== undefined) updateData.chat_sent = chat_sent;
    if (chat_sent_at !== undefined) updateData.chat_sent_at = chat_sent_at;
    if (customer_email !== undefined) updateData.customer_email = customer_email;

    // Update scan result
    const { data: scanResult, error: updateError } = await supabase
      .from('skin_scan_results')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating scan result:', updateError);
      return NextResponse.json(
        { error: 'Failed to update scan result', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: scanResult });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/sales/scan-results/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/sales/scan-results/[id] - Delete scan result (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or manager
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || !['admin', 'manager'].includes(userRole.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins and managers can delete scan results' },
        { status: 403 }
      );
    }

    // Delete scan result
    const { error: deleteError } = await supabase
      .from('skin_scan_results')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting scan result:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete scan result', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Scan result deleted' });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/sales/scan-results/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
