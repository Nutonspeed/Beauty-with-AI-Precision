"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Phone, Mail, MessageCircle, User } from "lucide-react"

// Mock data - ในโปรดักชั่นจะดึงจาก API
const activeChats = [
  {
    id: "1",
    customer: {
      name: "นางสาว สมใจ รักสวย",
      avatar: "/avatars/01.png",
      status: "online"
    },
    lastMessage: "สนใจแพ็คเกจครบครันมากค่ะ อยากทราบราคา",
    timestamp: "2 นาทีที่แล้ว",
    unread: 2,
    messages: [
      { id: "1", sender: "customer", text: "สวัสดีค่ะ อยากสอบถามเรื่องทรีตเมนต์", time: "10:30" },
      { id: "2", sender: "agent", text: "สวัสดีค่ะ มีอะไรให้ช่วยเหลือครับ", time: "10:31" },
      { id: "3", sender: "customer", text: "สนใจแพ็คเกจครบครันมากค่ะ อยากทราบราคา", time: "10:32" }
    ]
  },
  {
    id: "2",
    customer: {
      name: "นาย วิชัย ใจดี",
      avatar: "/avatars/02.png",
      status: "away"
    },
    lastMessage: "ขอบคุณที่ส่ง proposal มาครับ จะติดต่อกลับ",
    timestamp: "15 นาทีที่แล้ว",
    unread: 0,
    messages: [
      { id: "1", sender: "agent", text: "สวัสดีครับ นายวิชัย ตามที่คุยกันเมื่อวาน", time: "09:15" },
      { id: "2", sender: "customer", text: "สวัสดีครับ จำได้ค่ะ", time: "09:16" },
      { id: "3", sender: "agent", text: "ได้ส่ง proposal ตามที่คุยกันแล้วครับ", time: "09:20" },
      { id: "4", sender: "customer", text: "ขอบคุณที่ส่ง proposal มาครับ จะติดต่อกลับ", time: "09:45" }
    ]
  },
  {
    id: "3",
    customer: {
      name: "นาง วรรณา สวยงาม",
      avatar: "/avatars/03.png",
      status: "online"
    },
    lastMessage: "พร้อมทำสัญญาแล้วค่ะ",
    timestamp: "5 นาทีที่แล้ว",
    unread: 1,
    messages: [
      { id: "1", sender: "customer", text: "สวัสดีค่ะ อยากเริ่มทรีตเมนต์สัปดาห์หน้า", time: "14:20" },
      { id: "2", sender: "agent", text: "สวัสดีค่ะ ดีใจที่สนใจครับ จะจัดเตรียมเอกสารให้", time: "14:22" },
      { id: "3", sender: "customer", text: "พร้อมทำสัญญาแล้วค่ะ", time: "14:25" }
    ]
  }
]

const quickResponses = [
  "ขอบคุณที่สนใจครับ เรามีแพ็คเกจพิเศษสำหรับคุณ",
  "จะส่งรายละเอียดเพิ่มเติมให้ภายในวันนี้",
  "สามารถนัดหมายปรึกษาได้ตามสะดวกครับ",
  "มีคำถามอะไรเพิ่มเติมไหมครับ?"
]

export function LiveChat() {
  const [selectedChat, setSelectedChat] = useState(activeChats[0])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    // ในโปรดักชั่นจะส่งไปยัง API
    console.log("Sending message:", newMessage)
    setNewMessage("")

    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 2000)
  }

  const handleQuickResponse = (response: string) => {
    setNewMessage(response)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Active Chats
            <Badge className="bg-blue-100 text-blue-800">
              {activeChats.filter(c => c.unread > 0).length} unread
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 overflow-auto">
            <div className="space-y-2 p-4">
              {activeChats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  className={`w-full text-left p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat.id === chat.id ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={chat.customer.avatar} />
                        <AvatarFallback>{chat.customer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        chat.customer.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium truncate">{chat.customer.name}</h4>
                        <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <Badge className="mt-1 bg-red-100 text-red-800 text-xs">
                          {chat.unread} new
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Window */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedChat.customer.avatar} />
                <AvatarFallback>{selectedChat.customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{selectedChat.customer.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedChat.customer.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  {selectedChat.customer.status === 'online' ? 'Online' : 'Away'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
              <TabsTrigger value="chat" className="rounded-none">Chat</TabsTrigger>
              <TabsTrigger value="profile" className="rounded-none">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="p-4">
              {/* Messages */}
              <div className="h-64 overflow-auto mb-4">
                <div className="space-y-4">
                  {selectedChat.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[70%] ${message.sender === 'agent' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="h-8 w-8">
                          {message.sender === 'agent' ? (
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          ) : (
                            <AvatarImage src={selectedChat.customer.avatar} />
                          )}
                        </Avatar>
                        <div className={`p-3 rounded-lg ${
                          message.sender === 'agent'
                            ? 'bg-blue-500 text-white'
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.text}</p>
                          <span className={`text-xs mt-1 block ${
                            message.sender === 'agent' ? 'text-blue-100' : 'text-muted-foreground'
                          }`}>
                            {message.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 max-w-[70%]">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedChat.customer.avatar} />
                        </Avatar>
                        <div className="p-3 rounded-lg bg-muted">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animation-delay-100" />
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animation-delay-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Responses */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Quick Responses:</p>
                <div className="flex flex-wrap gap-2">
                  {quickResponses.map((response, _index) => (
                    <Button
                      key={response}
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickResponse(response)}
                      className="text-xs"
                    >
                      {response.length > 30 ? `${response.substring(0, 30)}...` : response}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="พิมพ์ข้อความ..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button onClick={handleSendMessage} className="self-end">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedChat.customer.avatar} />
                    <AvatarFallback>{selectedChat.customer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-lg">{selectedChat.customer.name}</h3>
                    <p className="text-muted-foreground">Premium Customer</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <p className="text-sm text-muted-foreground">081-234-5678</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Email</div>
                    <p className="text-sm text-muted-foreground">customer@email.com</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Last Visit</div>
                    <p className="text-sm text-muted-foreground">2 สัปดาห์ที่แล้ว</p>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Total Spent</div>
                    <p className="text-sm text-muted-foreground">฿45,000</p>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium">Notes</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ลูกค้าประจำ สนใจทรีตเมนต์ขั้นสูง คุยง่าย ตัดสินใจเร็ว
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
