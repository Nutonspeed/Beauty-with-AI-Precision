import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "active"

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's clinic_id and role
    const { data: userData } = await supabase.from("users").select("clinic_id, role").eq("id", user.id).single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch conversations with customer details and last message
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        *,
        customer:customers!conversations_customer_id_fkey(
          id,
          full_name,
          email,
          phone
        ),
        staff:users!conversations_staff_id_fkey(
          id,
          full_name
        ),
        messages(
          content,
          created_at,
          sender_type,
          is_read
        )
      `)
      .eq("clinic_id", userData.clinic_id)
      .eq("status", status)
      .order("last_message_at", { ascending: false })
      .limit(50)

    if (error) throw error

    // Format conversations with unread count
    const formattedConversations = conversations?.map((conv) => {
      const messages = conv.messages || []
      const lastMessage = messages[0]
      const unreadCount = messages.filter(
        (m: { is_read: boolean; sender_type: string }) => !m.is_read && m.sender_type === "customer",
      ).length

      return {
        ...conv,
        lastMessage: lastMessage?.content || "",
        lastMessageTime: lastMessage?.created_at || conv.last_message_at,
        unreadCount,
        messages: undefined, // Remove messages array from response
      }
    })

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error("[v0] Error fetching conversations:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { customer_id } = body

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's clinic_id
    const { data: userData } = await supabase.from("users").select("clinic_id").eq("id", user.id).single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("*")
      .eq("customer_id", customer_id)
      .eq("clinic_id", userData.clinic_id)
      .eq("status", "active")
      .single()

    if (existing) {
      return NextResponse.json({ conversation: existing })
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from("conversations")
      .insert({
        customer_id,
        clinic_id: userData.clinic_id,
        staff_id: user.id,
        status: "active",
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error("[v0] Error creating conversation:", error)
    return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
  }
}
