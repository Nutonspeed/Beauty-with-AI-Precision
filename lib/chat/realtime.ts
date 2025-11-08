import { createBrowserClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: "customer" | "staff"
  content: string
  message_type: "text" | "image" | "file"
  metadata?: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  created_at: string
}

export interface Conversation {
  id: string
  customer_id: string
  clinic_id: string
  staff_id: string | null
  status: "active" | "closed" | "pending"
  last_message_at: string
  created_at: string
  updated_at: string
}

export class ChatRealtimeManager {
  private supabase = createBrowserClient()
  private channels: Map<string, RealtimeChannel> = new Map()

  subscribeToConversation(
    conversationId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: (error: Error) => void,
  ): () => void {
    const channelName = `conversation:${conversationId}`

    // Remove existing channel if any
    this.unsubscribeFromConversation(conversationId)

    const channel = this.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new as ChatMessage)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new as ChatMessage)
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[v0] Subscribed to conversation:", conversationId)
        } else if (status === "CHANNEL_ERROR") {
          onError?.(new Error("Failed to subscribe to conversation"))
        }
      })

    this.channels.set(conversationId, channel)

    // Return unsubscribe function
    return () => this.unsubscribeFromConversation(conversationId)
  }

  unsubscribeFromConversation(conversationId: string): void {
    const channel = this.channels.get(conversationId)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(conversationId)
      console.log("[v0] Unsubscribed from conversation:", conversationId)
    }
  }

  subscribeToUserConversations(userId: string, onConversationUpdate: (conversation: Conversation) => void): () => void {
    const channelName = `user-conversations:${userId}`

    const channel = this.supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
          filter: `staff_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            onConversationUpdate(payload.new as Conversation)
          }
        },
      )
      .subscribe()

    this.channels.set(channelName, channel)

    return () => {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  cleanup(): void {
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
  }
}

// Singleton instance
export const chatRealtimeManager = new ChatRealtimeManager()
