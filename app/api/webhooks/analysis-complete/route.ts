/**
 * Analysis Complete Webhook
 * Phase 2 Week 6-7 Task 6.1
 * 
 * POST /api/webhooks/analysis-complete
 * 
 * Triggered when analysis is completed, syncs to CRM and creates follow-up tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createCRMClient, MockCRMClient, AnalysisSyncData } from '@/lib/integrations/crm-client';

// =============================================
// Types
// =============================================

interface AnalysisCompletePayload {
  analysisId: string;
  customerId: string;
  type: 'analysis_complete' | 'analysis_updated';
  timestamp: string;
}

// =============================================
// POST Handler
// =============================================

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (if configured)
    const signature = request.headers.get('x-webhook-signature');
    const isValidSignature = await verifyWebhookSignature(
      signature,
      await request.text()
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload: AnalysisCompletePayload = await request.json();

    const { analysisId, customerId, type } = payload;

    // Validate payload
    if (!analysisId || !customerId) {
      return NextResponse.json(
        { error: 'Missing required fields: analysisId, customerId' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Get analysis data
    const { data: analysis, error: analysisError } = await supabase
      .from('skin_analyses')
      .select(
        `
        id,
        user_id,
        overall_score,
        ai_analysis,
        created_at,
        users (
          email,
          full_name
        )
      `
      )
      .eq('id', analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Extract concerns and recommendations from AI analysis
    const concerns: string[] = [];
    const recommendations: string[] = [];

    if (analysis.ai_analysis) {
      // Extract concerns based on low scores
      if (analysis.ai_analysis.acne_score < 70) {
        concerns.push('Acne and blemishes');
      }
      if (analysis.ai_analysis.wrinkles_score < 70) {
        concerns.push('Fine lines and wrinkles');
      }
      if (analysis.ai_analysis.texture_score < 70) {
        concerns.push('Uneven texture');
      }
      if (analysis.ai_analysis.pores_score < 70) {
        concerns.push('Enlarged pores');
      }
      if (analysis.ai_analysis.hydration_score < 70) {
        concerns.push('Dehydration');
      }

      // Extract recommendations
      if (analysis.ai_analysis.recommendations) {
        recommendations.push(...analysis.ai_analysis.recommendations);
      }
    }

    // Prepare sync data
    const syncData: AnalysisSyncData = {
      analysisId: analysis.id,
      customerId: analysis.user_id,
      overallScore: analysis.overall_score || 0,
      concerns,
      recommendations,
      analysisDate: analysis.created_at,
      customerEmail: analysis.users?.[0]?.email || '',
    };

    // Create CRM client
    let crmClient = await createCRMClient();

    // Fallback to mock client if no real CRM configured (for testing)
    if (!crmClient) {
      console.log('[Webhook] No CRM configured, using mock client');
      crmClient = new MockCRMClient();
    }

    // Sync to CRM
    const syncResult = await crmClient.syncAnalysis(syncData);

    // Log sync operation
    await crmClient.logSync('analysis_complete', analysisId, syncResult);

    // Update analysis record with CRM sync status
    await supabase
      .from('skin_analyses')
      .update({
        crm_synced: syncResult.success,
        crm_synced_at: syncResult.timestamp,
      })
      .eq('id', analysisId);

    // Return response
    if (syncResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Analysis synced to CRM successfully',
        contactId: syncResult.contactId,
        taskId: syncResult.taskId,
        timestamp: syncResult.timestamp,
      });
    } else {
      // Return success status but log error (don't block the webhook)
      console.error('[Webhook] CRM sync failed:', syncResult.error);
      return NextResponse.json({
        success: true,
        message: 'Webhook received, but CRM sync failed',
        error: syncResult.error,
      });
    }
  } catch (error) {
    console.error('Unexpected error in analysis-complete webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// =============================================
// Webhook Signature Verification
// =============================================

async function verifyWebhookSignature(
  signature: string | null,
  body: string
): Promise<boolean> {
  // Skip verification in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  if (!signature) {
    return false;
  }

  try {
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) {
      console.warn('WEBHOOK_SECRET not configured');
      return true; // Allow in production if not configured yet
    }

    // Verify HMAC signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body)
    );

    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedHex;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

// =============================================
// OPTIONS Handler (CORS)
// =============================================

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-webhook-signature',
      },
    }
  );
}
