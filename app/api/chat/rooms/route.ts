import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/chat/rooms
 * List chat rooms for a clinic
 * 
 * Query parameters:
 * - clinic_id (required): Clinic ID
 * - customer_id (optional): Filter by customer
 * - assigned_staff_id (optional): Filter by assigned staff
 * - status (optional): Filter by status (active, assigned, resolved, closed)
 * - priority (optional): Filter by priority
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic_id = searchParams.get('clinic_id');
    const customer_id = searchParams.get('customer_id');
    const assigned_staff_id = searchParams.get('assigned_staff_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    if (!clinic_id) {
      return NextResponse.json(
        { error: 'clinic_id is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('chat_rooms')
      .select(`
        *,
        customer:users!chat_rooms_customer_id_fkey(id, email, full_name),
        assigned_staff:users!chat_rooms_assigned_staff_id_fkey(id, email, full_name)
      `)
      .eq('clinic_id', clinic_id);

    if (customer_id) {
      query = query.eq('customer_id', customer_id);
    }

    if (assigned_staff_id) {
      query = query.eq('assigned_staff_id', assigned_staff_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data, error } = await query.order('last_message_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat rooms' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat/rooms
 * Create a new chat room
 * 
 * IMPORTANT: This is for BEAUTY CLINIC customer support (ลูกค้า), NOT patients
 * 
 * Body:
 * - clinic_id (required): Clinic ID
 * - customer_id (required): Customer ID (beauty clinic client)
 * - subject (optional): Chat subject
 * - room_type (optional): Type of chat (support, consultation, etc.)
 * - priority (optional): Priority level
 * - auto_assign (optional): Auto-assign to staff
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clinic_id,
      customer_id,
      subject,
      room_type = 'support',
      priority = 'normal',
      auto_assign = true,
    } = body;

    if (!clinic_id || !customer_id) {
      return NextResponse.json(
        { error: 'clinic_id and customer_id are required' },
        { status: 400 }
      );
    }

    // Create the chat room
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        clinic_id,
        customer_id,
        subject,
        room_type,
        priority,
        status: 'active',
      })
      .select()
      .single();

    if (roomError) throw roomError;

    // Add customer as participant
    const { error: participantError } = await supabase
      .from('chat_participants')
      .insert({
        room_id: room.id,
        user_id: customer_id,
        role: 'customer',
      });

    if (participantError) throw participantError;

    // Auto-assign to staff if requested
    if (auto_assign) {
      const { error: assignError } = await supabase.rpc(
        'auto_assign_chat_to_staff',
        {
          p_room_id: room.id,
          p_clinic_id: clinic_id,
        }
      );

      if (assignError) {
        console.error('Error auto-assigning staff:', assignError);
      }
    }

    // Send system message
    const { error: messageError } = await supabase.from('chat_messages').insert({
      room_id: room.id,
      sender_id: customer_id,
      sender_type: 'system',
      message_type: 'system_notification',
      content: 'Chat started. A staff member will be with you shortly.',
      is_system_message: true,
    });

    if (messageError) {
      console.error('Error sending system message:', messageError);
    }

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to create chat room' },
      { status: 500 }
    );
  }
}
