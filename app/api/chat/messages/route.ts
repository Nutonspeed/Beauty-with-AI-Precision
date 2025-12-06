import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { withClinicAuth } from "@/lib/auth/middleware"

export const GET = withClinicAuth(async (request: NextRequest, user: any) => {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversation_id")

    if (!conversationId) {
      return NextResponse.json({ error: "conversation_id is required" }, { status: 400 })
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("[v0] Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
});

export const POST = withClinicAuth(async (request: NextRequest, user: any) => {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { conversation_id, content, message_type = "text", metadata } = body

    if (!conversation_id || !content) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user role
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    const senderType = userData?.role === "customer" ? "customer" : "staff"

    // Insert message
    const { data: message, error } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        sender_id: user.id,
        sender_type: senderType,
        content,
        message_type,
        metadata,
        is_read: false,
      })
      .select()
      .single()

    if (error) throw error

    // Update conversation last_message_at
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversation_id)

    return NextResponse.json({ message })
  } catch (error) {
    console.error("[v0] Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
});

export const PATCH = withClinicAuth(async (request: NextRequest, user: any) => {
  try {
    const supabase = await createServerClient()
    const body = await request.json()
    const { message_ids } = body

    // Mark messages as read
    const { error } = await supabase
      .from("messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .in("id", message_ids)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error marking messages as read:", error)
    return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 })
  }
});
