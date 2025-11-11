/**
 * Email Test API
 * Development only - test email configuration
 */

import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/notifications/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint not available in production' },
      { status: 403 }
    );
  }

  try {
    // Test email send
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'AI367 Beauty - Email System Test',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 8px 8px; }
              .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Email System Test</h1>
                <p>AI367 Beauty Platform</p>
              </div>
              <div class="content">
                <div class="success">
                  ✅ Email system is working correctly!
                </div>
                <h2>Test Details:</h2>
                <ul>
                  <li><strong>Date:</strong> ${new Date().toLocaleString('th-TH')}</li>
                  <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
                  <li><strong>API Key:</strong> ${process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Missing'}</li>
                  <li><strong>Email From:</strong> ${process.env.EMAIL_FROM || 'noreply@beautyplatform.com'}</li>
                </ul>
                <p>If you're seeing this email, your email integration is configured correctly! 🚀</p>
              </div>
              <div class="footer">
                <p>© 2025 AI367 Beauty. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: 'Email system test - If you see this, your email is working!',
    });

    return NextResponse.json({
      success: result.success,
      configured: !!process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || 'noreply@beautyplatform.com',
      message: result.success 
        ? 'Email sent successfully! Check your inbox.' 
        : 'Email API configured but could not send. Check your API key.',
      details: result,
    });
  } catch (error) {
    console.error('[Email Test] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        configured: !!process.env.RESEND_API_KEY,
      },
      { status: 500 }
    );
  }
}
