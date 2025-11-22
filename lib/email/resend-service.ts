/**
 * Resend Email Service
 * 
 * Handles email sending via Resend API
 * Free tier: 3,000 emails/month
 * https://resend.com/docs
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  id?: string;
  error?: any;
}

/**
 * Send email via Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM || 'noreply@yourdomain.com',
  cc,
  bcc,
  replyTo
}: SendEmailOptions): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[Email] RESEND_API_KEY not configured - email not sent');
      return {
        success: false,
        error: 'RESEND_API_KEY not configured'
      };
    }

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
      replyTo: replyTo
    });

    if (error) {
      console.error('[Email] Failed to send:', error);
      return { success: false, error };
    }

    console.log('[Email] Sent successfully:', data?.id);
    return { success: true, id: data?.id };

  } catch (error) {
    console.error('[Email] Exception:', error);
    return { success: false, error };
  }
}

/**
 * Send email with template variables
 */
export async function sendTemplateEmail({
  to,
  subject,
  templateContent,
  variables = {},
  from,
  cc,
  bcc,
  replyTo
}: SendEmailOptions & {
  templateContent: string;
  variables?: Record<string, string>;
}): Promise<EmailResult> {
  // Replace template variables
  let processedContent = templateContent;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedContent = processedContent.replace(regex, value);
  }

  return sendEmail({
    to,
    subject,
    html: processedContent,
    from,
    cc,
    bcc,
    replyTo
  });
}

/**
 * Validate email configuration
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}
