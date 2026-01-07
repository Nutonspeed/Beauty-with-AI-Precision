# Phase 6: AI Treatment Advisor (Gemini Free Tier)

## 🎯 เป้าหมาย
ใช้ **Google Gemini 1.5 Flash (ฟรี)** แทน ChatGPT เพื่อสร้าง AI Chatbot ให้คำปรึกษาการรักษาผิวหน้า

---

## ✅ ข้อดีของ Gemini Free Tier

1. **ฟรี 1,500 requests/วัน** (15 RPM)
2. **รองรับภาษาไทยเนทีฟ** (ดีกว่า GPT-3.5)
3. **Multimodal** (รับทั้งข้อความ + รูปภาพ)
4. **เร็ว** (~2-3 วินาที/response)
5. **มี API key อยู่แล้ว** (ไม่ต้องเติมเงิน)

---

## 📦 Installation (5 นาที)

### 1. Install Gemini SDK
\`\`\`bash
pnpm add @google/generative-ai
\`\`\`

### 2. Check API Key
\`\`\`bash
# ไฟล์ .env.local (มีอยู่แล้ว)
GEMINI_API_KEY=your-key-here
\`\`\`

**หมายเหตุ:** ถ้ายังไม่มี key ให้ไปเอาที่:
- https://aistudio.google.com/app/apikey
- คลิก "Get API key"
- Copy → paste ในไฟล์ .env.local

---

## 🏗️ Implementation (4-6 ชั่วโมง)

### 1. Create AI Advisor Library (1 ชั่วโมง)

**File:** `lib/ai/gemini-advisor.ts`

\`\`\`typescript
/**
 * Gemini AI Treatment Advisor
 * 
 * Uses Google Gemini 1.5 Flash (Free Tier)
 * - 1,500 requests/day
 * - Thai language support
 * - Multimodal (text + images)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { SkinAnalysis } from "@/types/analysis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1000,
  }
});

interface ChatContext {
  skinAnalysis?: SkinAnalysis;
  previousMessages?: { role: 'user' | 'assistant'; content: string }[];
  userName?: string;
  age?: number;
  budget?: number;
}

/**
 * Get AI treatment advice based on user question
 */
export async function getChatAdvice(
  userMessage: string,
  context: ChatContext = {}
): Promise<string> {
  try {
    const prompt = buildPrompt(userMessage, context);
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    return response;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('ไม่สามารถติดต่อ AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
  }
}

/**
 * Build context-aware prompt
 */
function buildPrompt(message: string, context: ChatContext): string {
  const parts: string[] = [];
  
  // System prompt
  parts.push(`คุณคือ "AI Beauty Advisor" ที่ปรึกษาด้านความงามผิวหน้า

บทบาท:
- ให้คำแนะนำการรักษาผิวหน้าแบบมืออาชีพ
- ตอบเป็นภาษาไทยที่เป็นกันเอง
- อธิบายง่ายๆ เข้าใจง่าย
- แนะนำ Treatment ที่เหมาะสมกับงบประมาณ

ข้อจำกัด:
- ⚠️ ไม่วินิจฉัยโรค (ต้องให้หมอดูเท่านั้น)
- ⚠️ ไม่ระบุชื่อยี่ห้อยา
- ✅ แนะนำให้ปรึกษาคลินิกถ้าปัญหารุนแรง
`);

  // Add skin analysis context
  if (context.skinAnalysis) {
    parts.push(`\nผลวิเคราะห์ผิวของผู้ใช้:
- ฝ้า-กระ: ${context.skinAnalysis.spots_count} จุด (ความรุนแรง: ${getSeverity(context.skinAnalysis.spots_count)})
- รูขุมขน: ${context.skinAnalysis.pores_count} จุด
- ริ้วรอย: ${context.skinAnalysis.wrinkles_count} เส้น
- คะแนนรวม: ${context.skinAnalysis.overall_score}/100
`);
  }

  // Add user info
  if (context.userName) {
    parts.push(`\nชื่อผู้ใช้: ${context.userName}`);
  }
  if (context.age) {
    parts.push(`อายุ: ${context.age} ปี`);
  }
  if (context.budget) {
    parts.push(`งบประมาณ: ${context.budget.toLocaleString()} บาท`);
  }

  // Add chat history (last 3 messages)
  if (context.previousMessages && context.previousMessages.length > 0) {
    parts.push('\nประวัติการสนทนา:');
    context.previousMessages.slice(-3).forEach(msg => {
      parts.push(`${msg.role === 'user' ? 'ผู้ใช้' : 'AI'}: ${msg.content}`);
    });
  }

  // Add current question
  parts.push(`\nคำถามปัจจุบัน: ${message}`);
  parts.push('\nคำตอบ (ภาษาไทย):');

  return parts.join('\n');
}

/**
 * Determine severity level
 */
function getSeverity(count: number): string {
  if (count < 10) return 'เล็กน้อย';
  if (count < 30) return 'ปานกลาง';
  if (count < 50) return 'ค่อนข้างมาก';
  return 'มาก';
}

/**
 * Get treatment recommendations with image
 */
export async function getRecommendationsWithImage(
  imageBase64: string,
  question: string
): Promise<string> {
  try {
    const imagePart = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([
      `คุณคือผู้เชี่ยวชาญด้านผิวหน้า วิเคราะห์รูปภาพและตอบคำถาม: ${question}`,
      imagePart
    ]);

    return result.response.text();
  } catch (error) {
    console.error('Gemini image analysis error:', error);
    throw new Error('ไม่สามารถวิเคราะห์รูปภาพได้');
  }
}
\`\`\`

---

### 2. Create Chat API (1 ชั่วโมง)

**File:** `app/api/chat/route.ts`

\`\`\`typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getChatAdvice } from '@/lib/ai/gemini-advisor';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse request
    const { message, skinAnalysisId } = await req.json();
    
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // 3. Get skin analysis context (if provided)
    let skinAnalysis = null;
    if (skinAnalysisId) {
      const { data } = await supabase
        .from('skin_analyses')
        .select('*')
        .eq('id', skinAnalysisId)
        .single();
      
      skinAnalysis = data;
    }

    // 4. Get chat history
    const { data: history } = await supabase
      .from('chat_history')
      .select('role, content')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(6); // Last 3 exchanges (6 messages)

    // 5. Call Gemini AI
    const aiResponse = await getChatAdvice(message, {
      skinAnalysis,
      previousMessages: history?.reverse() || [],
      userName: session.user.name || undefined,
    });

    // 6. Save chat history
    await supabase.from('chat_history').insert([
      {
        user_id: session.user.id,
        role: 'user',
        content: message,
      },
      {
        user_id: session.user.id,
        role: 'assistant',
        content: aiResponse,
      }
    ]);

    // 7. Return response
    return NextResponse.json({
      message: aiResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get chat history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
\`\`\`

---

### 3. Create Database Migration (15 นาที)

**File:** `supabase/migrations/20250105_create_chat_history_table.sql`

\`\`\`sql
-- Chat History Table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX idx_chat_history_created_at ON public.chat_history(created_at DESC);

-- RLS Policies
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own chat history
CREATE POLICY "chat_history_select_own"
  ON public.chat_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "chat_history_insert_own"
  ON public.chat_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE public.chat_history IS 'Stores AI chatbot conversation history';
COMMENT ON COLUMN public.chat_history.role IS 'Message sender: user, assistant, or system';
COMMENT ON COLUMN public.chat_history.content IS 'Message text content';
COMMENT ON COLUMN public.chat_history.metadata IS 'Additional context (skin_analysis_id, etc.)';
\`\`\`

**Run:**
1. ไปที่ Supabase Dashboard
2. SQL Editor → New query
3. Paste SQL ด้านบน
4. Run → ตรวจสอบ table `chat_history` ถูกสร้าง

---

### 4. Create Chat UI (2-3 ชั่วโมง)

**File:** `app/chat/page.tsx`

\`\`\`typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat history
  useEffect(() => {
    async function loadHistory() {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    }
    if (session) loadHistory();
  }, [session]);

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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Send message error:', error);
      alert('ไม่สามารถส่งข้อความได้ กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">💬 AI Beauty Advisor</h1>
      <p className="text-gray-600 mb-4">
        ถามคำถามเกี่ยวกับการดูแลผิวหน้า AI จะให้คำแนะนำที่เหมาะสมกับคุณ
      </p>

      {/* Chat Messages */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4 h-[500px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p>🤖 สวัสดีครับ! มีคำถามอะไรเกี่ยวกับผิวหน้าไหมครับ?</p>
            <p className="text-sm mt-2">ตัวอย่างคำถาม:</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• "ฝ้ากระของฉันควรใช้ Treatment อะไร?"</li>
              <li>• "รูขุมขนกว้างแก้ได้ไหม?"</li>
              <li>• "Botox กับ Filler ต่างกันอย่างไร?"</li>
            </ul>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString('th-TH')}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="text-gray-500">AI กำลังคิด...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์คำถาม..."
          disabled={loading}
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
        >
          ส่ง
        </button>
      </form>

      {/* Disclaimer */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
        ⚠️ <strong>คำเตือน:</strong> AI ให้คำแนะนำทั่วไปเท่านั้น ไม่ใช่การวินิจฉัยโรค
        กรุณาปรึกษาแพทย์ผู้เชี่ยวชาญก่อนตัดสินใจรักษา
      </div>
    </div>
  );
}
\`\`\`

---

### 5. Add Navigation Link (5 นาที)

**File:** `components/header.tsx` (เพิ่มลิงค์ Chat)

\`\`\`typescript
// ใน navigation menu เพิ่ม:
<Link href="/chat" className="nav-link">
  💬 AI Advisor
</Link>
\`\`\`

---

## 📊 Testing Checklist (15 นาที)

### 1. Unit Test Gemini Connection
\`\`\`bash
# Create test file
# __tests__/gemini-advisor.test.ts

import { getChatAdvice } from '@/lib/ai/gemini-advisor';

test('Gemini returns Thai response', async () => {
  const response = await getChatAdvice('ฝ้ากระคืออะไร?');
  expect(response).toContain('ฝ้า');
  expect(response.length).toBeGreaterThan(50);
});
\`\`\`

### 2. Manual Test Flow
1. Start dev server: `npx next dev`
2. ไปที่ http://localhost:3000/chat
3. Login
4. พิมพ์คำถาม: "ฝ้ากระควรใช้ Treatment อะไร?"
5. รอ response (~3 วินาที)
6. ✅ ควรได้คำตอบภาษาไทย

### 3. Check API Quota
- ไปที่ https://aistudio.google.com/app/apikey
- คลิก API key → View usage
- ✅ ควรเห็น requests count

---

## 💰 Cost Comparison

| Provider | Free Tier | Cost (if paid) | Thai Support |
|----------|-----------|----------------|--------------|
| **Gemini 1.5 Flash** | 1,500/day | $0.075/1M tokens | ⭐⭐⭐⭐⭐ Excellent |
| ChatGPT-3.5 | $0 (no free) | $0.50/1M tokens | ⭐⭐⭐⭐ Good |
| ChatGPT-4o | $0 (no free) | $5.00/1M tokens | ⭐⭐⭐⭐⭐ Excellent |
| Groq (Llama 3.1) | 14,400/day | Free | ⭐⭐⭐ Fair |

**สรุป:** Gemini คุ้มที่สุด (ฟรี + ไทยดี + มี image support)

---

## 🚀 Deployment Checklist

### Before Launch
- [ ] Test 20 conversations
- [ ] Check response time (<5s)
- [ ] Verify Thai language quality
- [ ] Test error handling (API limit)
- [ ] Add rate limiting (1 msg/5s per user)

### Production Settings
\`\`\`typescript
// lib/ai/gemini-advisor.ts
const RATE_LIMIT = {
  maxRequestsPerMinute: 15, // Gemini free tier
  maxRequestsPerDay: 1500,
};

// Implement queue if limit exceeded
\`\`\`

---

## 📈 Next Steps After Phase 6

**Phase 7:** Add voice input (speech-to-text)  
**Phase 8:** Add image upload in chat (multimodal)  
**Phase 9:** Add treatment comparison feature  
**Phase 10:** Integrate with booking system

---

## 🆘 Troubleshooting

### Issue 1: "API key not valid"
**Fix:** Check `.env.local` has correct key
\`\`\`bash
GEMINI_API_KEY=AIza...
\`\`\`

### Issue 2: "Quota exceeded"
**Fix:** Wait 24 hours or upgrade to paid tier

### Issue 3: "Response in English"
**Fix:** Add more Thai examples in prompt:
\`\`\`typescript
const prompt = `ตอบเป็นภาษาไทยเท่านั้น! ...`;
\`\`\`

---

**เวลาทำ:** 4-6 ชั่วโมง  
**ค่าใช้จ่าย:** ฟรี (1,500 requests/วัน)  
**ROI:** สูง (feature หลักที่ผู้ใช้ต้องการ)
