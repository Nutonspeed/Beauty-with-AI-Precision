'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AIErrorBoundary } from '@/components/error-boundary';
import { useAuth } from '@/lib/auth/context';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  followUpSuggestions?: string[];
  currentTopic?: string;
}

function AIChatContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [forceShow, setForceShow] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug log
  useEffect(() => {
    console.log('[AI Chat] Auth state:', { user: !!user, authLoading, mounted, forceShow });
  }, [user, authLoading, mounted, forceShow]);

  // Track mount state
  useEffect(() => {
    setMounted(true);
    
    // Force show after 3 seconds if still loading
    const timeout = setTimeout(() => {
      if (authLoading) {
        console.log('[AI Chat] Auth timeout - forcing show');
        setForceShow(true);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [authLoading]);

  // Redirect if not logged in (only if we're sure there's no user)
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      console.log('[AI Chat] Redirecting to login...');
      router.push('/auth/login');
    }
  }, [mounted, authLoading, user, router]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history
  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      
      console.log('[AI Chat] Loading history...');
      try {
        const res = await fetch('/api/chat');
        console.log('[AI Chat] History response:', res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log('[AI Chat] History loaded:', data.messages?.length || 0, 'messages');
          setMessages(data.messages || []);
        } else {
          console.error('[AI Chat] History error:', res.status);
        }
      } catch (error) {
        console.error('[AI Chat] Load history error:', error);
      }
    }
    
    loadHistory();
  }, [user]);

  // Send message
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      console.log('[AI Chat] Sending message:', input);
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      console.log('[AI Chat] Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[AI Chat] API error:', errorData);
        throw new Error(errorData.error || 'API error');
      }

      const data = await res.json();
      console.log('[AI Chat] Response received:', data.message?.substring(0, 100));
      
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp,
        followUpSuggestions: data.followUpSuggestions || [],
        currentTopic: data.currentTopic,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('[AI Chat] Send message error:', error);
      const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถส่งข้อความได้';
      alert(errorMessage);
      
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>กำลังเริ่มต้น...</p>
      </div>
    );
  }

  // If auth is loading for too long, show anyway (3 seconds timeout)
  if (authLoading && !forceShow) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>กำลังตรวจสอบการเข้าสู่ระบบ...</p>
        <p className="text-xs text-gray-400 mt-2">
          Debug: mounted={mounted.toString()}, authLoading={authLoading.toString()}, hasUser={!!user}
        </p>
        <p className="text-xs text-blue-500 mt-2">
          หากโหลดเกิน 3 วินาที จะแสดงหน้าอัตโนมัติ
        </p>
      </div>
    );
  }

  // If forced show due to timeout, skip user check
  if (!forceShow && !user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>กำลังเปลี่ยนหน้า...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">💬 AI Beauty Advisor</h1>
        <p className="text-gray-600">
          ถามคำถามเกี่ยวกับการดูแลผิวหน้า AI จะให้คำแนะนำที่เหมาะสมกับคุณ
        </p>
      </div>

      {/* Chat Messages */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 h-[500px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-xl mb-4">🤖 สวัสดีครับ! มีคำถามอะไรเกี่ยวกับผิวหน้าไหมครับ?</p>
            <div className="text-sm mt-4 space-y-2">
              <p className="font-semibold">ตัวอย่างคำถาม:</p>
              <ul className="space-y-1">
                <li>• "ฝ้ากระของฉันควรใช้ Program อะไร?"</li>
                <li>• "รูขุมขนกว้างแก้ได้ไหม?"</li>
                <li>• "Botox กับ Filler ต่างกันอย่างไร?"</li>
                <li>• "ริ้วรอยรอบดวงตาควรทำอย่างไร?"</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={`${msg.timestamp}-${i}`}
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] ${msg.role === 'user' ? '' : 'w-full max-w-[85%]'}`}>
              <div
                className={`rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Follow-up Suggestions for AI messages */}
              {msg.role === 'assistant' && msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 mb-1">💡 คำถามที่คุณอาจสนใจ:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.followUpSuggestions.map((suggestion) => (
                      <button
                        key={`suggestion-${msg.timestamp}-${suggestion}`}
                        onClick={() => {
                          setInput(suggestion);
                          // Auto-focus input
                          const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
                          inputElement?.focus();
                        }}
                        className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                        disabled={loading}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-gray-500">🤔 AI กำลังคิด...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์คำถาม..."
          disabled={loading}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'กำลังส่ง...' : 'ส่ง'}
        </button>
      </form>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
        <p className="font-semibold mb-1">⚠️ คำเตือนสำคัญ:</p>
        <ul className="space-y-1 text-gray-700">
          <li>• AI ให้คำแนะนำทั่วไปเท่านั้น ไม่ใช่การวินิจฉัยโรคหรือคำปรึกษาทางการแพทย์</li>
          <li>• กรุณาปรึกษาแพทย์ผู้เชี่ยวชาญก่อนตัดสินใจรักษา</li>
          <li>• ผลลัพธ์ของการรักษาอาจแตกต่างกันในแต่ละบุคคล</li>
        </ul>
      </div>
    </div>
  );
}

export default function AIChatPage() {
  return (
    <AIErrorBoundary>
      <AIChatContent />
    </AIErrorBoundary>
  )
}
