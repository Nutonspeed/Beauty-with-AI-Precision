'use client';

/**
 * Chat Interface Component
 * Real-time messaging UI with all chat features
 */

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Search, Phone, Video, X, Image as ImageIcon } from 'lucide-react';
import { useMessages, useTyping, useOnlineStatus } from '@/hooks/useChat';
import { getChatManager } from '@/lib/chat/chat-manager';
import { Message } from '@/lib/chat/chat-manager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ChatInterfaceProps {
  conversationId: string;
  userId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
}

export function ChatInterface({
  conversationId,
  userId,
  recipientId,
  recipientName,
  recipientAvatar,
  onVideoCall,
  onVoiceCall,
}: ChatInterfaceProps) {
  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    sendFile,
    editMessage,
    deleteMessage,
    addReaction,
    markAsRead,
    loadMore,
  } = useMessages(conversationId, userId);

  const { typingText } = useTyping(conversationId);
  const { isOnline, getLastSeen } = useOnlineStatus([recipientId], userId);

  const chatManager = getChatManager(userId);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send typing indicator
  const handleTyping = () => {
    chatManager.sendTypingIndicator(conversationId, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      chatManager.sendTypingIndicator(conversationId, false);
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      await sendMessage(messageText, replyingTo?.id);
      setMessageText('');
      setReplyingTo(null);
      chatManager.sendTypingIndicator(conversationId, false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await sendFile(file);
    } catch (error) {
      console.error('Error sending file:', error);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastSeen = (date?: Date) => {
    if (!date) return 'ไม่ทราบ';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    
    const days = Math.floor(hours / 24);
    return `${days} วันที่แล้ว`;
  };

  const emojis = ['😀', '😂', '❤️', '👍', '🙏', '🎉', '😍', '👏', '🔥', '✨'];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar>
              <AvatarImage src={recipientAvatar} alt={recipientName} />
              <AvatarFallback>{recipientName[0]}</AvatarFallback>
            </Avatar>
            {isOnline(recipientId) && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{recipientName}</h3>
            <p className="text-sm text-gray-500">
              {isOnline(recipientId) ? 'ออนไลน์' : `ออนไลน์ ${formatLastSeen(getLastSeen(recipientId))}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onVoiceCall && (
            <Button variant="ghost" size="icon" onClick={onVoiceCall}>
              <Phone className="w-5 h-5" />
            </Button>
          )}
          {onVideoCall && (
            <Button variant="ghost" size="icon" onClick={onVideoCall}>
              <Video className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">กำลังโหลดข้อความ...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500">เกิดข้อผิดพลาด: {error}</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>ยังไม่มีข้อความ</p>
            <p className="text-sm">เริ่มสนทนากันเลย!</p>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="text-center mb-4">
                <Button variant="ghost" onClick={loadMore}>
                  โหลดข้อความเก่า
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === userId;
                const isDeleted = !!message.deletedAt;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      {/* Message bubble */}
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isOwn
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        } ${isDeleted ? 'opacity-50 italic' : ''}`}
                        onDoubleClick={() => {
                          if (isOwn && !isDeleted) {
                            const newContent = prompt('แก้ไขข้อความ:', message.content);
                            if (newContent && newContent !== message.content) {
                              editMessage(message.id, newContent);
                            }
                          }
                        }}
                      >
                        {message.replyTo && (
                          <div className={`text-xs mb-2 pb-2 border-b ${isOwn ? 'border-blue-400' : 'border-gray-300'}`}>
                            ตอบกลับข้อความ
                          </div>
                        )}

                        {message.type === 'image' && message.attachments?.[0] && (
                          <div className="mb-2">
                            <img
                              src={message.attachments[0].url}
                              alt="Attachment"
                              className="max-w-full rounded"
                            />
                          </div>
                        )}

                        {message.type === 'file' && message.attachments?.[0] && (
                          <div className="flex items-center space-x-2 mb-2 p-2 bg-white bg-opacity-20 rounded">
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">{message.attachments[0].name}</span>
                          </div>
                        )}

                        <p className="whitespace-pre-wrap break-words">
                          {isDeleted ? 'ข้อความนี้ถูกลบแล้ว' : message.content}
                        </p>

                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatTime(message.createdAt)}
                            {message.edited && ' (แก้ไข)'}
                          </span>
                          {isOwn && (
                            <span className="text-xs">
                              {message.readBy.length > 1 ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>

                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => {
                              const count = message.reactions!.filter(r => r.emoji === emoji).length;
                              return (
                                <Badge
                                  key={emoji}
                                  variant="secondary"
                                  className="text-xs cursor-pointer"
                                  onClick={() => addReaction(message.id, emoji)}
                                >
                                  {emoji} {count}
                                </Badge>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Message actions */}
                      {!isDeleted && (
                        <div className={`flex items-center space-x-2 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <button
                            className="text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => setReplyingTo(message)}
                          >
                            ตอบกลับ
                          </button>
                          <button
                            className="text-xs text-gray-500 hover:text-gray-700"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            แสดงความรู้สึก
                          </button>
                          {isOwn && (
                            <button
                              className="text-xs text-red-500 hover:text-red-700"
                              onClick={() => {
                                if (confirm('ต้องการลบข้อความนี้?')) {
                                  deleteMessage(message.id);
                                }
                              }}
                            >
                              ลบ
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Typing indicator */}
            {typingText && (
              <div className="text-sm text-gray-500 italic mt-4">
                {typingText}
              </div>
            )}
          </>
        )}
      </ScrollArea>

      {/* Replying to indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t">
          <div className="text-sm">
            <span className="text-gray-500">ตอบกลับ:</span>{' '}
            <span className="text-gray-900">{replyingTo.content.substring(0, 50)}...</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setReplyingTo(null)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <div className="flex flex-wrap gap-2">
            {emojis.map(emoji => (
              <button
                key={emoji}
                className="text-2xl hover:scale-125 transition-transform"
                onClick={() => handleEmojiSelect(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex items-center space-x-2 p-4 border-t">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx"
          aria-label="Upload file"
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="w-5 h-5" />
        </Button>

        <Input
          value={messageText}
          onChange={(e) => {
            setMessageText(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          placeholder="พิมพ์ข้อความ..."
          className="flex-1"
        />

        <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
