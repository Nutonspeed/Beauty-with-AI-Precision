/**
 * Sales Chat Realtime Subscription
 * Provides real-time chat updates using Supabase Realtime
 */

import { createBrowserClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  sender_type: 'customer' | 'staff' | 'system'
  message_type: 'text' | 'image' | 'file' | 'system_notification'
  content: string
  attachments?: any[]
  is_system_message?: boolean
  is_edited?: boolean
  edited_at?: string
  sent_at: string
  delivered_at?: string
  read_by?: any[]
  reply_to_message_id?: string
  created_at: string
  sender?: {
    id: string
    email: string
    full_name?: string
  }
}

export interface TypingIndicator {
  room_id: string
  user_id: string
  user_name?: string
  is_typing: boolean
}

export class SalesChatSubscription {
  private supabase = createBrowserClient()
  private channel: RealtimeChannel | null = null
  private roomId: string

  constructor(roomId: string) {
    this.roomId = roomId
  }

  /**
   * Subscribe to new messages in the chat room
   */
  subscribeToMessages(
    onNewMessage: (message: ChatMessage) => void,
    onMessageUpdate?: (message: ChatMessage) => void,
    onMessageDelete?: (messageId: string) => void
  ) {
    this.channel = this.supabase
      .channel(`sales-chat:${this.roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${this.roomId}`
        },
        (payload) => {
          console.log('[Sales Chat] New message:', payload.new)
          onNewMessage(payload.new as ChatMessage)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${this.roomId}`
        },
        (payload) => {
          console.log('[Sales Chat] Message updated:', payload.new)
          onMessageUpdate?.(payload.new as ChatMessage)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${this.roomId}`
        },
        (payload) => {
          console.log('[Sales Chat] Message deleted:', payload.old.id)
          onMessageDelete?.(payload.old.id as string)
        }
      )
      .subscribe((status) => {
        console.log('[Sales Chat] Subscription status:', status)
      })

    return this.channel
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeToTyping(onTypingChange: (indicator: TypingIndicator) => void) {
    if (!this.channel) {
      this.channel = this.supabase.channel(`sales-chat:${this.roomId}`)
    }

    this.channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing_indicators',
          filter: `room_id=eq.${this.roomId}`
        },
        (payload) => {
          console.log('[Sales Chat] Typing indicator:', payload)
          if (payload.new) {
            onTypingChange(payload.new as TypingIndicator)
          }
        }
      )
      .subscribe()

    return this.channel
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(isTyping: boolean) {
    try {
      const {
        data: { user }
      } = await this.supabase.auth.getUser()

      if (!user) return

      if (isTyping) {
        // Insert or update typing indicator
        await this.supabase.from('chat_typing_indicators').upsert({
          room_id: this.roomId,
          user_id: user.id,
          updated_at: new Date().toISOString()
        })
      } else {
        // Remove typing indicator
        await this.supabase
          .from('chat_typing_indicators')
          .delete()
          .eq('room_id', this.roomId)
          .eq('user_id', user.id)
      }
    } catch (error) {
      console.error('[Sales Chat] Error sending typing indicator:', error)
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(messageIds: string[]) {
    try {
      const {
        data: { user }
      } = await this.supabase.auth.getUser()

      if (!user) return

      // Update read_by array for each message
      for (const messageId of messageIds) {
        const { data: message } = await this.supabase
          .from('chat_messages')
          .select('read_by')
          .eq('id', messageId)
          .single()

        if (message) {
          const readBy = message.read_by || []
          const alreadyRead = readBy.some((r: any) => r.user_id === user.id)

          if (!alreadyRead) {
            readBy.push({
              user_id: user.id,
              read_at: new Date().toISOString()
            })

            await this.supabase
              .from('chat_messages')
              .update({ read_by: readBy })
              .eq('id', messageId)
          }
        }
      }
    } catch (error) {
      console.error('[Sales Chat] Error marking messages as read:', error)
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribe() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel)
      this.channel = null
    }
  }
}

/**
 * Hook-friendly factory function
 */
export function createSalesChatSubscription(roomId: string) {
  return new SalesChatSubscription(roomId)
}
