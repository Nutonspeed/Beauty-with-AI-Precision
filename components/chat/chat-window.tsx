"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Phone, Mail } from "lucide-react"
import { chatRealtimeManager, type ChatMessage } from "@/lib/chat/realtime"
import { format } from "date-fns"

interface ChatWindowProps {
  conversation: {
    id: string
    customer: {
      id: string
      full_name: string
      email: string
      phone: string
    }
  }
  onConversationUpdate: () => void
}

export function ChatWindow({ conversation, onConversationUpdate }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch initial messages
    fetchMessages()

    // Subscribe to real-time updates
    const unsubscribe = chatRealtimeManager.subscribeToConversation(
      conversation.id,
      (message) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) {
            return prev.map((m) => (m.id === message.id ? message : m))
          }
          return [...prev, message]
        })
        scrollToBottom()
      },
      (error) => {
        console.error("[v0] Realtime error:", error)
      },
    )

    return () => {
      unsubscribe()
    }
  }, [conversation.id])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/messages?conversation_id=${conversation.id}`)
      const data = await response.json()
      setMessages(data.messages || [])
      scrollToBottom()

      // Mark messages as read
      const unreadIds = data.messages
        ?.filter((m: ChatMessage) => !m.is_read && m.sender_type === "customer")
        .map((m: ChatMessage) => m.id)

      if (unreadIds?.length > 0) {
        await fetch("/api/chat/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message_ids: unreadIds }),
        })
        onConversationUpdate()
      }
    } catch (error) {
      console.error("[v0] Error fetching messages:", error)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversation.id,
          content: newMessage.trim(),
        }),
      })

      if (response.ok) {
        setNewMessage("")
        onConversationUpdate()
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{conversation.customer.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{conversation.customer.full_name}</h3>
              <p className="text-sm text-muted-foreground">{conversation.customer.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${conversation.customer.phone}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href={`mailto:${conversation.customer.email}`}>
                <Mail className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Messages */}
        <div className="h-[450px] overflow-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === "staff" ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex gap-2 max-w-[70%] ${message.sender_type === "staff" ? "flex-row-reverse" : ""}`}>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={message.sender_type === "staff" ? "bg-blue-100 text-blue-800" : ""}>
                    {message.sender_type === "staff" ? "S" : conversation.customer.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`p-3 rounded-lg ${
                    message.sender_type === "staff" ? "bg-blue-500 text-white" : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      message.sender_type === "staff" ? "text-blue-100" : "text-muted-foreground"
                    }`}
                  >
                    {format(new Date(message.created_at), "HH:mm")}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <Button onClick={handleSendMessage} className="self-end" disabled={!newMessage.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
