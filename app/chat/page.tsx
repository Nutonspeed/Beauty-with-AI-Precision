"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageCircle, Search, Filter } from "lucide-react"
import { ChatWindow } from "@/components/chat/chat-window"
import { formatDistanceToNow } from "date-fns"
import { th } from "date-fns/locale"

// Disable static generation for this page to prevent SSR errors with Supabase client
export const dynamic = 'force-dynamic'

interface ConversationWithDetails {
  id: string
  customer: {
    id: string
    full_name: string
    email: string
    phone: string
  }
  staff: {
    id: string
    full_name: string
  } | null
  status: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  created_at: string
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat/conversations")
      const data = await response.json()
      setConversations(data.conversations || [])
      if (data.conversations?.length > 0 && !selectedConversation) {
        setSelectedConversation(data.conversations[0])
      }
    } catch (error) {
      console.error("[v0] Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Live Chat</h1>
        <p className="text-muted-foreground">Communicate with customers in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversations
              {totalUnread > 0 && <Badge className="bg-red-100 text-red-800">{totalUnread} unread</Badge>}
            </CardTitle>
            <div className="flex gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button size="icon" variant="outline">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] overflow-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">Loading conversations...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No conversations found</div>
              ) : (
                <div className="space-y-2 p-4">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      type="button"
                      className={`w-full text-left p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.id === conv.id ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{conv.customer.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium truncate">{conv.customer.full_name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conv.lastMessageTime), {
                                addSuffix: true,
                                locale: th,
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                          {conv.unreadCount > 0 && (
                            <Badge className="mt-1 bg-red-100 text-red-800 text-xs">{conv.unreadCount} new</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        {selectedConversation ? (
          <ChatWindow conversation={selectedConversation} onConversationUpdate={fetchConversations} />
        ) : (
          <Card className="lg:col-span-2">
            <CardContent className="flex items-center justify-center h-[600px]">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to start chatting</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
