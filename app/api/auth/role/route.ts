import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API route to get current user's role
 * Used by client-side components
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { role: null, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user data from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, tier, email, full_name')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { role: 'free_user', error: 'User data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      role: userData.role,
      tier: userData.tier,
      email: userData.email,
      fullName: userData.full_name,
      userId: session.user.id,
    });
  } catch (error) {
    console.error('Error in /api/auth/role:', error);
    return NextResponse.json(
      { role: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
