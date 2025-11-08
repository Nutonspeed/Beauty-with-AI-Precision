/**
 * Auth Callback API Route
 * 
 * Purpose: Handle Supabase auth callback after sign in
 * Used for: Email login, OAuth redirects, Magic links
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      // Exchange code for session
      await supabase.auth.exchangeCodeForSession(code);
      
      // Get user and update last_login_at
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update last login timestamp
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      // Redirect to login on error
      return NextResponse.redirect(new URL('/auth/login?error=callback_failed', request.url));
    }
  }

  // Redirect to next URL
  return NextResponse.redirect(new URL(next, request.url));
}
