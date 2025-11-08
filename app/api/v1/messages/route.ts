import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 })
    }

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Messages fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { conversationId, content } = await request.json()

    if (!conversationId || !content) {
      return NextResponse.json({ error: "Conversation ID and content are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: data }, { status: 201 })
  } catch (error) {
    console.error("Message send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
