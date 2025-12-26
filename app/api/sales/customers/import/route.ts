import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface BulkCustomerData {
  email: string;
  name: string;
  phone?: string;
}

export async function POST(request: NextRequest) {
  try {
    await cookies();
    const supabase = await createClient();

    // Verify user is sales staff
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single();

    if (!profile || !['sales_staff', 'clinic_admin', 'clinic_owner', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden - Only sales staff can import customers' }, { status: 403 });
    }

    const clinicId = profile.clinic_id;
    if (!clinicId) {
      return NextResponse.json({ error: 'No clinic associated with user' }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { customers } = body as { customers: BulkCustomerData[] };

    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Provide customers array.' },
        { status: 400 }
      );
    }

    // Validate max bulk size
    if (customers.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 customers per bulk request' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      failed: [] as { email: string; reason: string }[],
      duplicate: [] as string[],
    };

    // Process each customer
    for (const customer of customers) {
      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customer.email)) {
          results.failed.push({ 
            email: customer.email, 
            reason: 'Invalid email format' 
          });
          continue;
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', customer.email.toLowerCase())
          .single();

        if (existingUser) {
          results.duplicate.push(customer.email);
          continue;
        }

        // Check if invitation already exists
        const { data: existingInvite } = await supabase
          .from('invitations')
          .select('id, email, status')
          .eq('email', customer.email.toLowerCase())
          .eq('clinic_id', clinicId)
          .eq('status', 'pending')
          .single();

        if (existingInvite) {
          results.duplicate.push(customer.email);
          continue;
        }

        // Create invitation for customer
        const { data: invitation, error: inviteError } = await supabase
          .from('invitations')
          .insert({
            email: customer.email.toLowerCase(),
            invited_role: 'customer',
            clinic_id: clinicId,
            invited_by: user.id,
            status: 'pending',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days for customers
            metadata: {
              name: customer.name,
              phone: customer.phone,
              bulkImport: true,
              importedAt: new Date().toISOString(),
              salesStaffId: user.id, // Track which sales staff imported
            },
          })
          .select()
          .single();

        if (inviteError) {
          results.failed.push({ 
            email: customer.email, 
            reason: inviteError.message 
          });
          continue;
        }

        // TODO: Send invitation email
        // await sendCustomerInvitationEmail(invitation);

        results.success.push(customer.email);
      } catch (error: any) {
        results.failed.push({ 
          email: customer.email, 
          reason: error.message || 'Unknown error' 
        });
      }
    }

    // Create audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'bulk_customer_import',
      resource_type: 'invitation',
      resource_id: clinicId,
      metadata: {
        total: customers.length,
        success: results.success.length,
        failed: results.failed.length,
        duplicate: results.duplicate.length,
      },
    });

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: customers.length,
        successful: results.success.length,
        failed: results.failed.length,
        duplicate: results.duplicate.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Bulk customer import error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
