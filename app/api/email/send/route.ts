/**
 * Email Send API
 * Phase 1: Email Integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/notifications/email';
import { withClinicAuth } from '@/lib/auth/middleware';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const POST = withClinicAuth(async (request: NextRequest) => {
  try {
    const body: EmailRequest = await request.json();
    
    // Validate input
    if (!body.to || !body.subject || !body.html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send email
    const result = await sendEmail({
      to: body.to,
      subject: body.subject,
      html: body.html,
      text: body.text,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        id: result.id,
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Email API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
})
