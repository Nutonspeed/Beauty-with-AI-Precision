import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/marketing/messages/[id]/send
 * Send campaign message to beauty clinic customers
 * 
 * This is a simplified implementation that marks the message as sent.
 * In production, this would integrate with actual email/SMS/push notification services.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const supabaseClient = getSupabaseClient();
    // Get message details
    const { data: message, error: messageError } = await supabaseClient
      .from('campaign_messages')
      .select('*, target_segment:customer_segments(customer_count)')
      .eq('id', params.id)
      .single();

    if (messageError) throw messageError;

    if (message.status === 'sent') {
      return NextResponse.json(
        { error: 'Message already sent' },
        { status: 400 }
      );
    }

    // Get segment members if targeting a segment
    let recipientCount = 0;
    if (message.target_segment_id) {
      const { data: members, error: membersError } = await supabaseClient
        .from('customer_segment_members')
        .select('customer_id')
        .eq('segment_id', message.target_segment_id)
        .eq('is_active', true);

      if (membersError) throw membersError;

      recipientCount = members?.length || 0;

      // Create recipient records
      if (members && members.length > 0) {
        const recipients = members.map(member => ({
          clinic_id: message.clinic_id,
          message_id: params.id,
          customer_id: member.customer_id,
          delivery_status: 'pending',
        }));

        const { error: recipientsError } = await supabaseClient
          .from('campaign_message_recipients')
          .insert(recipients);

        if (recipientsError) throw recipientsError;
      }
    }

    // Update message status
    const { data: updatedMessage, error: updateError } = await supabaseClient
      .from('campaign_messages')
      .update({
        status: 'sending',
        sent_at: new Date().toISOString(),
        total_recipients: recipientCount,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // In a production system, here you would:
    // 1. Queue the message for actual delivery via email/SMS/push service
    // 2. Update delivery status as messages are sent
    // 3. Track opens, clicks, and conversions
    // 4. Update campaign metrics

    return NextResponse.json({
      success: true,
      message: 'Message queued for sending',
      recipients: recipientCount,
      data: updatedMessage,
    });
  } catch (error) {
    console.error('Error sending campaign message:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign message' },
      { status: 500 }
    );
  }
}
