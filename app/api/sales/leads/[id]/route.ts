import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { withClinicAuth } from '@/lib/auth/middleware'

export const GET = withClinicAuth(async (req, authenticatedUser) => {
  const id = req.nextUrl.pathname.split('/').pop() || '';
  const supabase = await createServerClient();

  const { data: lead, error } = await supabase
    .from('sales_leads')
    .select(`
      *,
      sales_user:users!sales_leads_sales_user_id_fkey(full_name, email),
      customer:users!sales_leads_customer_user_id_fkey(full_name, email)
    `)
    .eq('id', id)
    .eq('sales_user_id', authenticatedUser.id) // RLS will handle this, but double-check
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    console.error('Error fetching lead:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(lead);
});

export const PATCH = withClinicAuth(async (req, authenticatedUser) => {
  const id = req.nextUrl.pathname.split('/').pop() || '';
  const body = await req.json();
  const supabase = await createServerClient();

  // Validation
  if (body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
  }

  if (body.phone && !/^[0-9-+() ]+$/.test(body.phone)) {
    return NextResponse.json(
      { error: 'Invalid phone format' },
      { status: 400 }
    );
  }

  if (body.score !== undefined && (body.score < 0 || body.score > 100)) {
    return NextResponse.json(
      { error: 'Score must be between 0 and 100' },
      { status: 400 }
    );
  }

  // Prepare update data (only include fields that are provided)
  const updateData: any = {};
  const allowedFields = [
    'name', 'email', 'phone', 'status', 'source', 'concern',
    'budget_min', 'budget_max', 'preferred_date', 'score',
    'notes', 'tags', 'custom_fields', 'last_contact_date'
  ];

  allowedFields.forEach(field => {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  });

  // Update lead
  const { data: updatedLead, error } = await supabase
    .from('sales_leads')
    .update(updateData)
    .eq('id', id)
    .eq('sales_user_id', authenticatedUser.id) // Ensure user owns this lead
    .select(`
      *,
      sales_user:users!sales_leads_sales_user_id_fkey(full_name, email),
      customer:users!sales_leads_customer_user_id_fkey(full_name, email)
    `)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });
    }
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity if status changed
  if (body.status) {
    await supabase.from('sales_activities').insert([{
      lead_id: id,
      user_id: authenticatedUser.id,
      type: 'status_change',
      title: 'Status Updated',
      description: `Status changed to ${body.status}`,
      metadata: { new_status: body.status },
    }]);
  }

  return NextResponse.json({ data: updatedLead });
});

export const DELETE = withClinicAuth(async (req, authenticatedUser) => {
  const id = req.nextUrl.pathname.split('/').pop() || '';
  const supabase = await createServerClient();

  // Soft delete by updating status to 'lost'
  const { data: deletedLead, error } = await supabase
    .from('sales_leads')
    .update({ status: 'lost', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('sales_user_id', authenticatedUser.id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Lead not found or unauthorized' }, { status: 404 });
    }
    console.error('Error deleting lead:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.from('sales_activities').insert([{
    lead_id: id,
    user_id: authenticatedUser.id,
    type: 'note',
    title: 'Lead Archived',
    description: 'Lead marked as lost',
  }]);

  return NextResponse.json({ success: true });
});
