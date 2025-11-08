import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const leadId = searchParams.get('lead_id')
    const customerId = searchParams.get('customer_id')
    const limit = Number.parseInt(searchParams.get('limit') || '50')

    // TODO: Implement chat messages table
    // For now, return empty array until chat system is fully implemented
    // Expected table structure:
    // - id (uuid)
    // - lead_id (uuid, nullable)
    // - customer_id (uuid, nullable)
    // - sales_user_id (uuid)
    // - message_text (text)
    // - sender_type (enum: 'customer', 'sales')
    // - is_read (boolean)
    // - created_at (timestamp)

    console.log('[chat-messages] Chat system not yet implemented. Returning empty array.')
    console.log('[chat-messages] Requested lead_id:', leadId, 'customer_id:', customerId)

    return NextResponse.json({
      messages: [],
      total: 0,
      note: 'Chat system not yet fully implemented. Please implement chat_messages table.',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[chat-messages] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Send new message
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { lead_id, customer_id, message_text } = body

    // TODO: Implement message sending
    console.log('[chat-messages] Send message not yet implemented')
    console.log('[chat-messages] Message:', message_text)

    return NextResponse.json({
      success: false,
      message: 'Chat system not yet fully implemented',
      timestamp: new Date().toISOString()
    }, { status: 501 }) // Not Implemented

  } catch (error) {
    console.error('[chat-messages] Error sending message:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
