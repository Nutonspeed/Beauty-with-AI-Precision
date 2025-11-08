'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatDemo } from '@/hooks/demo/useChatDemo';
import { Send, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatRoomProps {
  roomId: string;
  userId: string;
  userName: string;
  userRole: 'staff' | 'patient';
}

export function ChatRoom({ roomId, userId, userName, userRole }: ChatRoomProps) {
  const { messages, typingUsers, isConnected, sendMessage, sendTypingStatus } = useChatDemo({
    roomId,
    userId,
    userName,
    userRole
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Send typing indicator
    if (value && !isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingStatus(false);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(input.trim());
    setInput('');
    
    // Stop typing indicator
    setIsTyping(false);
    sendTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="flex flex-col h-[600px] max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">ห้องแชท</h2>
          <p className="text-sm text-muted-foreground">
            {isConnected ? '🟢 เชื่อมต่อแล้ว' : '🔴 ไม่ได้เชื่อมต่อ'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.senderId === userId;
            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                    {getInitials(message.senderName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{message.senderName}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                  </div>
                  
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>

                  {/* Delivery and read indicators */}
                  {isOwnMessage && (
                    <div className="flex items-center gap-1">
                      {message.read && <CheckCheck className="h-3 w-3 text-primary" />}
                      {!message.read && message.delivered && <Check className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
              </div>
              <span>{typingUsers.join(', ')} กำลังพิมพ์...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || !isConnected}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
