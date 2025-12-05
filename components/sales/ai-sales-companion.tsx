'use client';

/**
 * AI Sales Companion with Objection Handling
 * Advanced sales assistant with real-time objection detection and handling
 * Competitive advantage: AI-powered objection management and conversion optimization
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Zap, 
  Brain, 
  Shield
} from 'lucide-react';
import { AIObjectionHandler, ObjectionAnalysis, ObjectionResponse } from '@/lib/ai/objection-handler';

interface CustomerProfile {
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  concerns?: string[];
  budget?: 'low' | 'medium' | 'high' | 'premium';
  previousTreatments?: string[];
}

interface Treatment {
  name: string;
  price: number;
  category: string;
  confidence?: number;
}

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  objectionAnalysis?: ObjectionAnalysis;
  objectionResponse?: ObjectionResponse;
}

interface AISalesCompanionProps {
  customerProfile?: CustomerProfile;
  treatmentInterest?: string[];
  currentTreatment?: Treatment;
  leadScore?: number;
  urgency?: 'low' | 'medium' | 'high';
  onConversionAction?: (action: string) => void;
  className?: string;
}

export function AISalesCompanion({
  customerProfile = {},
  treatmentInterest = [],
  currentTreatment,
  leadScore = 50,
  urgency = 'medium',
  onConversionAction,
  className = ''
}: AISalesCompanionProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [objectionHandler] = useState(() => new AIObjectionHandler());
  const [conversionMetrics, setConversionMetrics] = useState({
    objectionCount: 0,
    handledCount: 0,
    conversionProbability: 0.5,
    engagementScore: leadScore,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize conversation
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ConversationMessage = {
        id: 'welcome',
        role: 'assistant',
        content: generateWelcomeMessage(customerProfile, treatmentInterest, currentTreatment),
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const generateWelcomeMessage = (
    profile: CustomerProfile,
    interests: string[],
    treatment?: Treatment
  ): string => {
    const name = profile.name ? `คุณ${profile.name}` : 'คุณลูกค้า';
    const interestsText = interests.length > 0 ? interests.join(', ') : 'การดูแลผิว';

    let message = `สวัสดีค่ะ ${name} 👋\n\n`;
    message += `ขอบคุณที่สนใจ${interestsText} ของเรา\n\n`;

    if (treatment) {
      message += `สำหรับ **${treatment.name}** ที่คุณสนใจ:\n`;
      message += `💰 ราคา: ฿${treatment.price.toLocaleString()}\n`;
      message += `🎯 ความมั่นใจ: ${(treatment.confidence || 0) * 100}%\n\n`;
    }

    message += `ฉันพร้อมช่วยเหลือคุณในทุกขั้นตอนค่ะ 💕\n`;
    message += `มีอะไรให้ช่วยไหมคะ?`;

    return message;
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ConversationMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAnalyzing(true);

    try {
      // Analyze for objections
      const context = {
        customerProfile,
        treatmentInterest,
        currentTreatment,
        leadScore,
        urgency,
        conversationHistory: messages,
      };

      const objectionAnalysis = await objectionHandler.detectObjection(currentMessage, context);

      let assistantMessage: ConversationMessage;

      if (objectionAnalysis.objectionType !== 'none') {
        // Handle objection
        const objectionResponse = await objectionHandler.handleObjection(objectionAnalysis, context);

        assistantMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: objectionResponse.response,
          timestamp: new Date(),
          objectionAnalysis,
          objectionResponse,
        };

        // Update metrics
        setConversionMetrics(prev => ({
          ...prev,
          objectionCount: prev.objectionCount + 1,
          handledCount: prev.handledCount + (objectionResponse.conversionProbability > 0.6 ? 1 : 0),
          conversionProbability: objectionResponse.conversionProbability,
          engagementScore: Math.min(100, prev.engagementScore + (objectionResponse.conversionProbability > 0.7 ? 5 : 0)),
        }));

        // Trigger conversion actions
        if (objectionResponse.followUpActions.length > 0) {
          objectionResponse.followUpActions.forEach(action => {
            onConversionAction?.(action);
          });
        }
      } else {
        // Normal response - use basic assistant response
        assistantMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: generateNormalResponse(currentMessage, context),
          timestamp: new Date(),
        };
      }

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Message processing failed:', error);

      const errorMessage: ConversationMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'ขออภัยค่ะ ระบบขัดข้องเล็กน้อย กรุณาลองใหม่อีกครั้งนะคะ 🙏',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateNormalResponse = (message: string, context: any): string => {
    // Simple response generation based on keywords
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('ราคา') || lowerMessage.includes('price')) {
      return `ค่ะ ราคา${context.currentTreatment?.name || 'ทรีทเมนท์'}อยู่ที่ ฿${context.currentTreatment?.price?.toLocaleString() || 'ตามแพ็คเกจ'}\n\nเรามีโปรโมชั่นและการผ่อนชำระให้เลือกด้วยค่ะ 💳`;
    }

    if (lowerMessage.includes('เวลา') || lowerMessage.includes('time') || lowerMessage.includes('นัด')) {
      return `ค่ะ เรามีเวลาการให้บริการที่หลากหลาย:\n\n📅 จันทร์-ศุกร์: 10:00-19:00\n🌅 เสาร์-อาทิตย์: 10:00-18:00\n⏰ Lunch time: 12:00-13:00\n\nสะดวกวันไหนคะ?`;
    }

    if (lowerMessage.includes('แพทย์') || lowerMessage.includes('doctor') || lowerMessage.includes('ปลอดภัย')) {
      return `ค่ะ แพทย์ของเราเป็นผู้เชี่ยวชาญด้าน Dermatology ที่ได้รับการรับรอง\n\n✅ วุฒิแพทย์จากไทยและต่างประเทศ\n✅ ประสบการณ์กว่า 10 ปี\n✅ ใช้เครื่องมือและเทคโนโลยีมาตรฐานสากล\n\nอยากให้ดูใบประกาศและผลงานไหมคะ?`;
    }

    return `เข้าใจค่ะ ${message}\n\nอยากให้ข้อมูลเพิ่มเติมเรื่องไหนคะ?\n• ราคาและโปรโมชั่น 💰\n• กระบวนการรักษา ⚕️\n• ผลลัพธ์และรีวิว ⭐\n• การนัดหมาย 📅`;
  };

  const getObjectionBadgeColor = (type: string): string => {
    const colors: Record<string, string> = {
      price: 'bg-yellow-500',
      time: 'bg-blue-500',
      trust: 'bg-red-500',
      pain: 'bg-orange-500',
      commitment: 'bg-purple-500',
      competition: 'bg-green-500',
      information: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getObjectionIcon = (type: string) => {
    switch (type) {
      case 'price': return <DollarSign className="w-3 h-3" />;
      case 'time': return <Clock className="w-3 h-3" />;
      case 'trust': return <Shield className="w-3 h-3" />;
      case 'pain': return <AlertTriangle className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-gray-900 to-black border-white/10 overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-white">AI Sales Companion</CardTitle>
              <p className="text-sm text-gray-400">ผู้ช่วยขายอัจฉริยะพร้อมจัดการ objection</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Zap className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Conversion Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Conversion</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {(conversionMetrics.conversionProbability * 100).toFixed(0)}%
            </div>
            <Progress value={conversionMetrics.conversionProbability * 100} className="h-2 mt-2" />
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Engagement</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {conversionMetrics.engagementScore}
            </div>
            <Progress value={conversionMetrics.engagementScore} className="h-2 mt-2" />
          </div>
        </div>

        {/* Objection Stats */}
        {conversionMetrics.objectionCount > 0 && (
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Objection Handling</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">พบ: {conversionMetrics.objectionCount}</span>
              <span className="text-green-400">แก้ไข: {conversionMetrics.handledCount}</span>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto bg-black/20 rounded-xl p-3 space-y-3">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white border border-white/20'
                }`}>
                  {/* Objection Indicator */}
                  {message.objectionAnalysis && message.objectionAnalysis.objectionType !== 'none' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={`${getObjectionBadgeColor(message.objectionAnalysis.objectionType)} text-white text-xs`}>
                        {getObjectionIcon(message.objectionAnalysis.objectionType)}
                        {message.objectionAnalysis.objectionType}
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-gray-300 text-xs">
                        {(message.objectionAnalysis.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="whitespace-pre-line text-sm">
                    {message.content}
                  </div>

                  {/* Response Strategy */}
                  {message.objectionResponse && (
                    <div className="mt-2 pt-2 border-t border-white/20">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        Strategy: {message.objectionResponse.strategy}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    {message.timestamp.toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 border border-white/20 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm text-gray-400">AI กำลังวิเคราะห์...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="พิมพ์ข้อความของคุณ..."
            className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400 resize-none"
            rows={2}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-green-500/50 text-green-400 hover:bg-green-500/20"
            onClick={() => onConversionAction?.('schedule_consultation')}
          >
            <Users className="w-4 h-4 mr-2" />
            นัดปรึกษาฟรี
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
            onClick={() => onConversionAction?.('send_proposal')}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            ส่ง Proposal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AISalesCompanion;
