'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AIChatAssistant from '@/components/ai-chat-assistant';

export function AIChatDemoPanel() {
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">✨ คุณสมบัติหลัก</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureBlock
            emoji="🇹🇭"
            title="Thai Language Support"
            description="รองรับภาษาไทยเต็มรูปแบบ เข้าใจคำถามและตอบกลับเป็นภาษาไทย"
          />
          <FeatureBlock
            emoji="🧠"
            title="Intent Classification"
            description="ระบุความต้องการอัตโนมัติ: การวิเคราะห์ผิว ทรีทเมนท์ ราคา นัดหมาย"
          />
          <FeatureBlock
            emoji="📚"
            title="Knowledge Base"
            description="ความรู้ครอบคลุม 10+ ทรีทเมนท์ และ 8 ตัวชี้วัดสุขภาพผิว"
          />
          <FeatureBlock
            emoji="🔄"
            title="Context Integration"
            description="เชื่อมโยงกับผลวิเคราะห์ผิวและคำแนะนำทรีทเมนท์อัจฉริยะ"
          />
        </div>
      </Card>

      {showChat ? (
        <div className="mb-8">
          <AIChatAssistant />
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="mb-6">
            <span className="text-6xl">🤖</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">พร้อมให้คำปรึกษา</h3>
          <p className="text-gray-600 mb-6">
            เริ่มสนทนากับ AI Assistant เพื่อรับคำแนะนำด้านการดูแลผิว
          </p>
          <Button onClick={() => setShowChat(true)} size="lg">
            เริ่มการสนทนา 💬
          </Button>
        </Card>
      )}

      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 ตัวอย่างการใช้งาน</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ExampleConversation
            title="สอบถามเกี่ยวกับฝ้า กระ"
            messages={[
              { role: 'user', text: 'ผิวฉันมีฝ้ากระมาก ควรรักษายังไง' },
              { role: 'bot', text: 'แนะนำ Laser Treatment, Chemical Peel หรือ IPL Therapy ค่ะ พร้อมใช้ครีมกันแดด SPF 50+ ทุกวัน' },
            ]}
          />
          <ExampleConversation
            title="สอบถามราคาทรีทเมนท์"
            messages={[
              { role: 'user', text: 'ทำ HydraFacial ราคาเท่าไหร่' },
              { role: 'bot', text: 'HydraFacial ราคา ฿2,500-6,000 ต่อครั้ง ระยะเวลา 30-45 นาที ไม่มี downtime ค่ะ' },
            ]}
          />
          <ExampleConversation
            title="สอบถามเกี่ยวกับริ้วรอย"
            messages={[
              { role: 'user', text: 'ริ้วรอยหน้าผากลึกมาก มีวิธีรักษาไหม' },
              { role: 'bot', text: 'แนะนำ Botox สำหรับริ้วรอยแบบ dynamic หรือ Filler สำหรับริ้วรอยลึก อยู่ได้ 3-6 เดือนค่ะ' },
            ]}
          />
          <ExampleConversation
            title="การนัดหมาย"
            messages={[
              { role: 'user', text: 'อยากนัดปรึกษาแพทย์ ทำยังไง' },
              { role: 'bot', text: 'นัดหมายได้ผ่านเว็บไซต์ หรือโทร 02-XXX-XXXX (จ-ส 9:00-19:00) ปรึกษาฟรีทุกทรีทเมนท์ค่ะ' },
            ]}
          />
        </div>
      </Card>

      <Card className="p-6 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 หัวข้อความรู้ที่รองรับ</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOPICS.map((topic) => (
            <KnowledgeTopic key={topic.title} icon={topic.icon} title={topic.title} />
          ))}
        </div>
      </Card>

      <Card className="p-6 mt-8 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">🔧 Technical Implementation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FeatureList
            title="Core Components"
            items={[
              'AIChatAssistant - Chat engine with knowledge base',
              'useAIChat - React hook for state management',
              'ChatBubble - Message UI component',
              'QuickReplies - Quick action buttons',
            ]}
          />
          <FeatureList
            title="Key Features"
            items={[
              'Intent classification (10+ categories)',
              'Thai keyword matching',
              'Knowledge base (60+ entries)',
              'Context integration (metrics + recommendations)',
              'Conversation history',
              'Chat export (TXT format)',
              'Typing indicators',
              'Quick reply buttons',
            ]}
          />
          <FeatureList
            title="Intent Categories"
            items={[
              'greeting - ทักทาย',
              'skin_analysis - การวิเคราะห์ผิว',
              'treatment_inquiry - ทรีทเมนท์',
              'product_recommendation - ผลิตภัณฑ์',
              'concern_specific - ปัญหาผิว',
              'booking - นัดหมาย',
              'pricing - ราคา',
              'general_info - ข้อมูลทั่วไป',
            ]}
          />
          <FeatureList
            title="Knowledge Topics"
            items={[
              'Spots & Dark Spots (ฝ้า กระ)',
              'Pores (รูขุมขน)',
              'Wrinkles (ริ้วรอย)',
              'Acne (สิว)',
              'Hydration (ความชุ่มชื้น)',
              '10 Treatment types',
              'Pricing information',
              'Booking process',
            ]}
          />
        </div>
      </Card>
    </div>
  );
}

interface FeatureBlockProps {
  emoji: string;
  title: string;
  description: string;
}

function FeatureBlock({ emoji, title, description }: FeatureBlockProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="bg-white p-2 rounded-lg">
        <span className="text-2xl">{emoji}</span>
      </div>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

const TOPICS = [
  { icon: '🔬', title: 'การวิเคราะห์ผิว' },
  { icon: '⚡', title: 'Laser Treatment' },
  { icon: '🧪', title: 'Chemical Peel' },
  { icon: '💉', title: 'Botox & Filler' },
  { icon: '💆', title: 'HydraFacial' },
  { icon: '💡', title: 'IPL Therapy' },
  { icon: '📡', title: 'RF Treatment' },
  { icon: '💡', title: 'LED Therapy' },
  { icon: '🧴', title: 'Medical Skincare' },
  { icon: '🎯', title: 'Microneedling' },
  { icon: '💰', title: 'ราคาและโปรโมชัน' },
  { icon: '📅', title: 'การนัดหมาย' },
];

interface ExampleConversationProps {
  title: string;
  messages: { role: 'user' | 'bot'; text: string }[];
}

function ExampleConversation({ title, messages }: ExampleConversationProps) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="font-bold text-gray-900 mb-3 text-sm">{title}</h3>
      <div className="space-y-2">
        {messages.map((msg) => (
          <div
            key={`${msg.role}-${msg.text}`}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-3 py-2 rounded-lg text-xs max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface KnowledgeTopicProps {
  icon: string;
  title: string;
}

function KnowledgeTopic({ icon, title }: KnowledgeTopicProps) {
  return (
    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{title}</span>
    </div>
  );
}

interface FeatureListProps {
  title: string;
  items: string[];
}

function FeatureList({ title, items }: FeatureListProps) {
  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <ul className="text-sm text-gray-600 space-y-1">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export default AIChatDemoPanel;
