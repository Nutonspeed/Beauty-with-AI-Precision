/**
 * AI Chat Assistant Component
 * Interactive chat interface with Thai language support
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIChat } from '@/hooks/useAIChat';
import { ChatMessage } from '@/lib/ai/chat-assistant';

/**
 * Chat Bubble Component
 */
const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isUser
                ? 'bg-purple-500 text-white'
                : isSystem
                ? 'bg-gray-400 text-white'
                : 'bg-gradient-to-br from-pink-400 to-purple-500 text-white'
            }`}
          >
            {isUser ? '👤' : isSystem ? 'ℹ️' : '🤖'}
          </div>

          {/* Message Bubble */}
          <div
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? 'bg-purple-500 text-white rounded-tr-none'
                : isSystem
                ? 'bg-gray-100 text-gray-700 rounded-tl-none border border-gray-300'
                : 'bg-white text-gray-900 rounded-tl-none border border-gray-200 shadow-sm'
            }`}
          >
            <div className="text-sm sm:text-base whitespace-pre-line">{message.content}</div>

            {/* Metadata */}
            {message.metadata && message.metadata.confidence && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <Badge variant="outline" className="text-xs">
                  ความมั่นใจ: {(message.metadata.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
            )}

            {/* Timestamp */}
            <div
              className={`text-xs mt-1 ${
                isUser ? 'text-purple-100' : 'text-gray-500'
              }`}
            >
              {message.timestamp.toLocaleTimeString('th-TH', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Typing Indicator Component
 */
const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white flex items-center justify-center">
          🤖
        </div>
        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Quick Reply Buttons Component
 */
const QuickReplies: React.FC<{ onSelect: (message: string) => void }> = ({ onSelect }) => {
  const quickReplies = [
    '🔬 วิเคราะห์ผิวของฉัน',
    '💉 ทรีทเมนท์แนะนำ',
    '💰 ราคาทรีทเมนท์',
    '📅 นัดหมาย',
    'ฝ้า กระ',
    'สิว',
    'ริ้วรอย',
    'รูขุมขน',
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {quickReplies.map((reply, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onSelect(reply)}
          className="text-xs sm:text-sm hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
        >
          {reply}
        </Button>
      ))}
    </div>
  );
};

/**
 * AI Chat Assistant Component
 */
export const AIChatAssistant: React.FC = () => {
  const { messages, isTyping, error, sendMessage, startNewSession, exportChat } =
    useAIChat();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Scroll to bottom when messages change
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Handle Send Message
   */
  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    await sendMessage(inputMessage);
    setInputMessage('');
    inputRef.current?.focus();
  };

  /**
   * Handle Quick Reply
   */
  const handleQuickReply = async (message: string) => {
    await sendMessage(message);
  };

  /**
   * Handle Key Press
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Handle Export Chat
   */
  const handleExport = () => {
    const chatText = exportChat();
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-transcript-${new Date().getTime()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="flex flex-col h-[600px] max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Skincare Assistant</h2>
              <p className="text-sm text-purple-100">ผู้ช่วยด้านการดูแลผิว</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleExport} className="text-white hover:bg-white/20">
              📄 Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewSession}
              className="text-white hover:bg-white/20"
            >
              🔄 New Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {isTyping && <TypingIndicator />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <QuickReplies onSelect={handleQuickReply} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-full px-6"
          >
            ส่ง 📤
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIChatAssistant;
