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
    const { action, centerIds } = body;

    if (!action || !centerIds || !Array.isArray(centerIds) || centerIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Provide action and centerIds array.' },
        { status: 400 }
      );
    }

    let result;

    if (action === 'activate') {
      // Activate centers
      const { error } = await supabase
        .from('centers')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .in('id', centerIds);

      if (error) {
        throw error;
      }

      result = { message: `Successfully activated ${centerIds.length} center(s)` };
    } else if (action === 'suspend') {
      // Suspend centers
      const { error } = await supabase
        .from('centers')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in('id', centerIds);

      if (error) {
        throw error;
      }

      result = { message: `Successfully suspended ${centerIds.length} center(s)` };
    } else if (action === 'delete') {
      // Soft delete centers (set is_active to false and add deleted flag if exists)
      const { error } = await supabase
        .from('centers')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .in('id', centerIds);

      if (error) {
        throw error;
      }

      result = { message: `Successfully deleted ${centerIds.length} center(s)` };
    } else if (action === 'export') {
      // Export center data
      const { data: centers, error } = await supabase
        .from('centers')
        .select('*')
        .in('id', centerIds);

      if (error) {
        throw error;
      }

      result = { centers, message: `Exported ${centerIds.length} center(s)` };
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
