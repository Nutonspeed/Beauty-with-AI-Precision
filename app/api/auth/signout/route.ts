/**
 * Sign Out API Route
 * 
 * Purpose: Handle user sign out
 * Clears: Session cookies, auth state
 */

import { NextRequest, NextResponse } from 'next/server';
import { signOut } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    await signOut();
    
    return NextResponse.json(
      { success: true, message: 'Signed out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
}
