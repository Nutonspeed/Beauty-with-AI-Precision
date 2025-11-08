"use client"

import { useState, useRef, useEffect } from "react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  X, 
  Send, 
  Phone, 
  Video,
  Paperclip,
  Plus,
  Trash2,
  Mic,
  MicOff
} from "lucide-react"
import { format } from "date-fns"
import { 
  getAllQuickReplies,
  getQuickRepliesByCategory,
  saveCustomQuickReply,
  deleteCustomQuickReply,
  QUICK_REPLY_CATEGORIES,
  type QuickReplyCategory
} from "@/lib/quick-replies-library"
import { 
  voiceRecognition, 
  type VoiceRecognitionStatus,
  type VoiceRecognitionError
} from "@/lib/voice-recognition"
import { offlineManager } from "@/lib/offline-manager"

interface Message {
  id: string
  text: string
  sender: "customer" | "sales"
  timestamp: Date
  isRead?: boolean
}

interface Customer {
  id: string
  name: string
  photo?: string
  initials: string
  isOnline: boolean
  isTyping?: boolean
}

interface ChatDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer
  messages: Message[]
  onSendMessage: (message: string) => void
  onCall?: () => void
  onVideoCall?: () => void
}

interface ChatDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer
  messages: Message[]
  onSendMessage: (message: string) => void
  onCall?: () => void
  onVideoCall?: () => void
}

export function ChatDrawer({ 
  open, 
  onOpenChange, 
  customer, 
  messages,
  onSendMessage,
  onCall,
  onVideoCall
}: Readonly<ChatDrawerProps>) {
  const [messageText, setMessageText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<QuickReplyCategory>('greetings')
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [customReplyText, setCustomReplyText] = useState("")
  const [, setQuickReplies] = useState(getAllQuickReplies())
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const categoryScrollRef = useRef<HTMLDivElement>(null)
  
  // Optimistic UI state
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const [isSending, setIsSending] = useState(false)

  // Voice recognition state
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const [voiceStatus, setVoiceStatus] = useState<VoiceRecognitionStatus>('idle')
  const [interimTranscript, setInterimTranscript] = useState("")

  // Offline status
  const [isOnline, setIsOnline] = useState(true)

  // Check voice support on mount
  useEffect(() => {
    setIsVoiceSupported(voiceRecognition.isBrowserSupported())
  }, [])

  // Subscribe to offline status
  useEffect(() => {
    const unsubscribe = offlineManager.subscribe((status) => {
      setIsOnline(status.isOnline)
    })
    return () => unsubscribe()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages, optimisticMessages])

  // Combine real messages with optimistic messages
  const allMessages = [...messages, ...optimisticMessages]

  // Refresh quick replies when component mounts
  useEffect(() => {
    setQuickReplies(getAllQuickReplies())
  }, [open])

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return

    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      text: messageText,
      sender: "sales",
      timestamp: new Date(),
      isRead: false
    }

    // Add optimistic message immediately
    setOptimisticMessages(prev => [...prev, optimisticMessage])
    const currentMessageText = messageText
    setMessageText("")
    setIsSending(true)

    try {
      if (isOnline) {
        // Normal online message send
        await onSendMessage(currentMessageText)
        // Remove optimistic message after successful send
        setOptimisticMessages(prev => prev.filter(m => m.id !== tempId))
      } else {
        // Queue message for offline sync
        await offlineManager.queueMessage({
          leadId: customer.id,
          leadName: customer.name,
          text: currentMessageText,
          timestamp: new Date()
        })
        // Still call onSendMessage for optimistic UI update
        await onSendMessage(currentMessageText)
        setOptimisticMessages(prev => prev.filter(m => m.id !== tempId))
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      // Rollback: remove optimistic message and restore input
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId))
      setMessageText(currentMessageText)
    } finally {
      setIsSending(false)
    }
  }

  const handleQuickReply = async (replyText: string) => {
    if (isSending) return

    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      text: replyText,
      sender: "sales",
      timestamp: new Date(),
      isRead: false
    }

    // Add optimistic message immediately
    setOptimisticMessages(prev => [...prev, optimisticMessage])
    setIsSending(true)

    try {
      if (isOnline) {
        await onSendMessage(replyText)
        setOptimisticMessages(prev => prev.filter(m => m.id !== tempId))
      } else {
        await offlineManager.queueMessage({
          leadId: customer.id,
          leadName: customer.name,
          text: replyText,
          timestamp: new Date()
        })
        await onSendMessage(replyText)
        setOptimisticMessages(prev => prev.filter(m => m.id !== tempId))
      }
    } catch (error) {
      console.error("Failed to send quick reply:", error)
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId))
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSaveCustomReply = () => {
    if (!customReplyText.trim()) return
    saveCustomQuickReply(customReplyText.trim(), selectedCategory)
    setQuickReplies(getAllQuickReplies())
    setCustomReplyText("")
    setShowAddCustom(false)
  }

  const handleDeleteCustomReply = (replyId: string) => {
    deleteCustomQuickReply(replyId)
    setQuickReplies(getAllQuickReplies())
  }

  const currentCategoryReplies = getQuickRepliesByCategory(selectedCategory)

  // Voice recognition handlers
  const handleStartVoice = () => {
    if (!isVoiceSupported) {
      alert('เบราว์เซอร์นี้ไม่รองรับการพูดเป็นข้อความ กรุณาใช้ Chrome, Edge หรือ Safari')
      return
    }

    const success = voiceRecognition.start({
      onTranscript: (transcript, isFinal) => {
        if (isFinal) {
          // Final transcript - append to message
          setMessageText((prev: string) => (prev + ' ' + transcript).trim())
          setInterimTranscript("")
        } else {
          // Interim transcript - show as placeholder
          setInterimTranscript(transcript)
        }
      },
      onStatusChange: (status) => {
        setVoiceStatus(status)
      },
      onError: (error: VoiceRecognitionError, message) => {
        console.error('Voice recognition error:', error, message)
        const errorMessage = voiceRecognition.getErrorMessage(error)
        alert(errorMessage)
        setVoiceStatus('idle')
        setInterimTranscript("")
      },
      onEnd: () => {
        setVoiceStatus('idle')
        setInterimTranscript("")
      }
    })

    if (!success) {
      setVoiceStatus('idle')
    }
  }

  const handleStopVoice = () => {
    voiceRecognition.stop()
    setVoiceStatus('idle')
    setInterimTranscript("")
  }

  const isVoiceActive = voiceStatus === 'listening' || voiceStatus === 'processing'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[400px] p-0 flex flex-col"
      >
        <SheetTitle className="sr-only">
          Chat with {customer.name}
        </SheetTitle>
        
        {/* Chat Header - Sticky */}
        <div className="p-4 border-b bg-primary text-primary-foreground shrink-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary-foreground/20">
              <AvatarImage src={customer.photo} alt={customer.name} />
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
                {customer.initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{customer.name}</h3>
              <div className="flex items-center gap-2 text-xs opacity-90">
                {customer.isOnline && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Online</span>
                  </div>
                )}
                {customer.isTyping && (
                  <span className="italic">Typing...</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={onCall}
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={onVideoCall}
              >
                <Video className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages - Scrollable */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {allMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "sales" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "sales"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  } ${message.id.startsWith('temp-') ? 'opacity-70' : ''}`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "sales"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {format(message.timestamp, "HH:mm")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Quick Replies - Category Tabs + Messages */}
        <div className="border-t bg-muted/30 shrink-0">
          {/* Category Tabs - Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto px-3 pt-3 pb-2 scrollbar-thin" ref={categoryScrollRef}>
            {QUICK_REPLY_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-background text-muted-foreground hover:bg-background/80'
                }`}
              >
                <span className="text-base">{category.emoji}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Quick Reply Messages */}
          <div className="px-3 pb-3 pt-2">
            <div className="flex flex-wrap gap-2">
              {currentCategoryReplies.slice(0, 4).map((reply) => (
                <div key={reply.id} className="relative group">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto min-h-[48px] px-4 py-2 text-left justify-start hover:bg-primary hover:text-primary-foreground transition-colors whitespace-normal"
                    onClick={() => handleQuickReply(reply.text)}
                  >
                    {reply.emoji && <span className="mr-1.5">{reply.emoji}</span>}
                    <span className="text-xs line-clamp-2">{reply.text}</span>
                  </Button>
                  
                  {/* Delete button for custom replies */}
                  {reply.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCustomReply(reply.id)
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete custom reply"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}

              {/* Add Custom Reply Button */}
              {showAddCustom ? (
                <div className="flex-1 min-w-full flex gap-2">
                  <Input
                    placeholder="พิมพ์ข้อความที่ต้องการบันทึก..."
                    value={customReplyText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomReplyText(e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        handleSaveCustomReply()
                      } else if (e.key === 'Escape') {
                        setShowAddCustom(false)
                        setCustomReplyText("")
                      }
                    }}
                    className="text-xs"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveCustomReply}
                    disabled={!customReplyText.trim()}
                  >
                    บันทึก
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowAddCustom(false)
                      setCustomReplyText("")
                    }}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-[48px] px-4 border-dashed"
                  onClick={() => setShowAddCustom(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="text-xs">เพิ่มข้อความ</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Message Input - Sticky Bottom */}
        <div className="p-4 border-t bg-background shrink-0">
          {/* Voice Recognition Indicator */}
          {isVoiceActive && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {voiceStatus === 'listening' ? 'กำลังฟัง...' : 'กำลังประมวลผล...'}
                </span>
              </div>
              {interimTranscript && (
                <p className="text-sm text-muted-foreground italic">
                  "{interimTranscript}"
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="shrink-0"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Input
              placeholder={isVoiceActive ? "กำลังฟังเสียง..." : "Type your message..."}
              value={messageText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
              disabled={isVoiceActive}
            />

            {/* Voice Button */}
            {isVoiceSupported && (
              <Button 
                variant={isVoiceActive ? "destructive" : "outline"}
                size="icon"
                className="shrink-0"
                onClick={isVoiceActive ? handleStopVoice : handleStartVoice}
                title={isVoiceActive ? "หยุดบันทึกเสียง" : "บันทึกเสียง (Thai)"}
              >
                {isVoiceActive ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            )}

            <Button 
              size="icon" 
              className="shrink-0 bg-primary hover:bg-primary/90"
              onClick={handleSend}
              disabled={!messageText.trim() || isVoiceActive}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
