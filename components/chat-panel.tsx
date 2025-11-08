// Chat Panel Component
// In-call text messaging for video consultations

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { ChatMessage } from '@/lib/video/video-call-manager';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  className?: string;
}

export function ChatPanel({
  messages,
  currentUserId,
  onSendMessage,
  onClose,
  className = '',
}: ChatPanelProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Focus input on mount
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Handle send message
   */
  const handleSend = () => {
    if (!inputMessage.trim()) return;

    onSendMessage(inputMessage.trim());
    setInputMessage('');
    inputRef.current?.focus();
  };

  /**
   * Handle key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Format timestamp
   */
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex flex-col h-full bg-white border-l border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Chat</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Close chat"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === currentUserId;
            const isSystemMessage = message.type === 'system';

            if (isSystemMessage) {
              return (
                <div key={message.id} className="text-center">
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {message.message}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage ? 'order-2' : 'order-1'
                  }`}
                >
                  {/* Sender name (only for other users) */}
                  {!isOwnMessage && (
                    <p className="text-xs text-gray-600 mb-1 px-3">
                      {message.senderName}
                    </p>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.message}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <p
                    className={`text-xs text-gray-500 mt-1 px-3 ${
                      isOwnMessage ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
