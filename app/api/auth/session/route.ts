/**
 * Session API Route
 * 
 * Purpose: Get current user session with clinic context
 * Returns: User profile, clinic data, permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session.isAuthenticated || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      user: session.user,
      permissionContext: session.permissionContext,
      isAuthenticated: session.isAuthenticated,
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
