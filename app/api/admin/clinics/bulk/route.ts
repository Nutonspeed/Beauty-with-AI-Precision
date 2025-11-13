import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await cookies();
    const supabase = await createClient();

    // Verify user is super admin
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, clinicIds } = body;

    if (!action || !clinicIds || !Array.isArray(clinicIds) || clinicIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Provide action and clinicIds array.' },
        { status: 400 }
      );
    }

    let result;

    if (action === 'activate') {
      // Activate clinics
      const { error } = await supabase
        .from('clinics')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .in('id', clinicIds);

      if (error) {
        throw error;
      }

      result = { message: `Successfully activated ${clinicIds.length} clinic(s)` };
    } else if (action === 'suspend') {
      // Suspend clinics
      const { error } = await supabase
        .from('clinics')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('id', clinicIds);

      if (error) {
        throw error;
      }

      result = { message: `Successfully suspended ${clinicIds.length} clinic(s)` };
    } else if (action === 'delete') {
      // Soft delete clinics (set is_active to false and add deleted flag if exists)
      const { error } = await supabase
        .from('clinics')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .in('id', clinicIds);

      if (error) {
        throw error;
      }

      result = { message: `Successfully deleted ${clinicIds.length} clinic(s)` };
    } else if (action === 'export') {
      // Export clinic data
      const { data: clinics, error } = await supabase
        .from('clinics')
        .select('*')
        .in('id', clinicIds);

      if (error) {
        throw error;
      }

      result = { clinics, message: `Exported ${clinicIds.length} clinic(s)` };
    } else {
      return NextResponse.json(
        { error: `Unknown action: ${action}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
