/**
 * AI Chat Hook
 * React hook for managing AI chat assistant
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import AIChatAssistant, { ChatMessage, ChatSession } from '@/lib/ai/chat-assistant';
import { EnhancedMetricsResult } from '@/lib/ai/enhanced-skin-metrics';
import { TreatmentRecommendation } from '@/lib/ai/treatment-recommender';

/**
 * Hook State Interface
 */
interface UseAIChatState {
  session: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
}

/**
 * Hook Actions Interface
 */
interface UseAIChatActions {
  sendMessage: (message: string) => Promise<void>;
  startNewSession: () => void;
  setContext: (context: {
    metrics?: EnhancedMetricsResult;
    recommendations?: TreatmentRecommendation[];
  }) => void;
  clearHistory: () => void;
  exportChat: () => string;
}

/**
 * Hook Return Type
 */
type UseAIChatReturn = UseAIChatState & UseAIChatActions;

/**
 * AI Chat Hook
 */
export const useAIChat = (userId: string = 'demo_user'): UseAIChatReturn => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assistantRef = useRef<AIChatAssistant>(new AIChatAssistant());
  const contextRef = useRef<{
    metrics?: EnhancedMetricsResult;
    recommendations?: TreatmentRecommendation[];
  }>({});

  /**
   * Initialize session on mount
   */
  useEffect(() => {
    const newSession = assistantRef.current.createSession(userId);
    setSession(newSession);

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      role: 'assistant',
      content:
        'สวัสดีค่ะ! ยินดีต้อนรับสู่ AI Beauty Clinic 🌸\n\nฉันคือผู้ช่วยด้านการดูแลผิว พร้อมให้คำปรึกษาเกี่ยวกับ:\n\n• การวิเคราะห์ผิว 🔬\n• ทรีทเมนท์และการรักษา 💉\n• ผลิตภัณฑ์ดูแลผิว 🧴\n• ราคาและโปรโมชัน 💰\n• การนัดหมาย 📅\n\nมีอะไรให้ช่วยไหมคะ?',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [userId]);

  /**
   * Send Message
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        // Create user message
        const userMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: 'user',
          content,
          timestamp: new Date(),
        };

        // Add to messages
        setMessages((prev) => [...prev, userMessage]);

        // Add to assistant history
        assistantRef.current.addToHistory(userMessage);

        // Set typing indicator
        setIsTyping(true);

        // Generate response
        const response = await assistantRef.current.generateResponse(content, contextRef.current);

        // Simulate typing delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Add response to messages
        setMessages((prev) => [...prev, response]);
        assistantRef.current.addToHistory(response);

        setIsTyping(false);
      } catch (err) {
        console.error('Error sending message:', err);
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งข้อความ');
        setIsTyping(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Start New Session
   */
  const startNewSession = useCallback(() => {
    const newSession = assistantRef.current.createSession(userId);
    setSession(newSession);
    setMessages([]);
    assistantRef.current.clearHistory();
    contextRef.current = {};
    setError(null);

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: `msg_welcome_${Date.now()}`,
      role: 'assistant',
      content:
        'สวัสดีค่ะ! เริ่มการสนทนาใหม่ มีอะไรให้ช่วยไหมคะ?',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [userId]);

  /**
   * Set Context
   */
  const setContext = useCallback(
    (context: { metrics?: EnhancedMetricsResult; recommendations?: TreatmentRecommendation[] }) => {
      contextRef.current = context;

      // Add context update message
      if (context.metrics) {
        const contextMessage: ChatMessage = {
          id: `msg_context_${Date.now()}`,
          role: 'system',
          content: 'ฉันได้รับผลการวิเคราะห์ผิวของคุณแล้วค่ะ สามารถถามคำถามเกี่ยวกับผลวิเคราะห์ได้เลยนะคะ',
          timestamp: new Date(),
          metadata: {
            metrics: context.metrics,
          },
        };
        setMessages((prev) => [...prev, contextMessage]);
      }
    },
    []
  );

  /**
   * Clear History
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    assistantRef.current.clearHistory();
  }, []);

  /**
   * Export Chat
   */
  const exportChat = useCallback((): string => {
    const chatText = messages
      .map((msg) => {
        const role = msg.role === 'user' ? 'คุณ' : msg.role === 'assistant' ? 'AI' : 'ระบบ';
        const time = msg.timestamp.toLocaleTimeString('th-TH');
        return `[${time}] ${role}: ${msg.content}`;
      })
      .join('\n\n');

    return chatText;
  }, [messages]);

  return {
    session,
    messages,
    isLoading,
    isTyping,
    error,
    sendMessage,
    startNewSession,
    setContext,
    clearHistory,
    exportChat,
  };
};

export default useAIChat;
