/**
 * Real-time Objection Detection Hook
 * Provides real-time objection analysis during conversations
 */

import { useState, useCallback, useRef } from 'react';
import { AIObjectionHandler, ObjectionAnalysis, ObjectionContext } from '@/lib/ai/objection-handler';

interface UseObjectionDetectionOptions {
  enabled?: boolean;
  debounceMs?: number;
  onObjectionDetected?: (analysis: ObjectionAnalysis) => void;
}

interface ObjectionDetectionResult {
  analyzeMessage: (message: string, context: ObjectionContext) => Promise<ObjectionAnalysis>;
  isAnalyzing: boolean;
  lastAnalysis: ObjectionAnalysis | null;
  clearAnalysis: () => void;
}

export function useObjectionDetection(
  options: UseObjectionDetectionOptions = {}
): ObjectionDetectionResult {
  const { enabled = true, debounceMs = 300, onObjectionDetected } = options;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<ObjectionAnalysis | null>(null);
  const objectionHandlerRef = useRef<AIObjectionHandler | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize objection handler
  if (!objectionHandlerRef.current) {
    objectionHandlerRef.current = new AIObjectionHandler();
  }

  const analyzeMessage = useCallback(async (
    message: string,
    context: ObjectionContext
  ): Promise<ObjectionAnalysis> => {
    if (!enabled || !objectionHandlerRef.current) {
      return {
        objectionType: 'none',
        confidence: 0,
        severity: 'low',
        keywords: [],
        context: '',
      };
    }

    setIsAnalyzing(true);

    try {
      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce analysis
      return new Promise((resolve) => {
        debounceTimerRef.current = setTimeout(async () => {
          const analysis = await objectionHandlerRef.current!.detectObjection(message, context);
          setLastAnalysis(analysis);
          onObjectionDetected?.(analysis);
          resolve(analysis);
        }, debounceMs);
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [enabled, debounceMs, onObjectionDetected]);

  const clearAnalysis = useCallback(() => {
    setLastAnalysis(null);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  return {
    analyzeMessage,
    isAnalyzing,
    lastAnalysis,
    clearAnalysis,
  };
}

/**
 * Hook for real-time conversation monitoring with objection detection
 */
interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseConversationMonitoringOptions extends UseObjectionDetectionOptions {
  context: ObjectionContext;
  onObjectionAlert?: (message: ConversationMessage, analysis: ObjectionAnalysis) => void;
}

interface ConversationMonitoringResult extends ObjectionDetectionResult {
  monitorMessage: (message: ConversationMessage) => void;
  conversationAlerts: Array<{
    message: ConversationMessage;
    analysis: ObjectionAnalysis;
    timestamp: Date;
  }>;
  clearAlerts: () => void;
}

export function useConversationMonitoring(
  options: UseConversationMonitoringOptions
): ConversationMonitoringResult {
  const { context, onObjectionAlert, ...detectionOptions } = options;

  const [conversationAlerts, setConversationAlerts] = useState<Array<{
    message: ConversationMessage;
    analysis: ObjectionAnalysis;
    timestamp: Date;
  }>>([]);

  const { analyzeMessage, isAnalyzing, lastAnalysis, clearAnalysis } = useObjectionDetection({
    ...detectionOptions,
    onObjectionDetected: (analysis) => {
      if (analysis.objectionType !== 'none' && analysis.confidence > 0.6) {
        // This will be set when monitorMessage is called
      }
    },
  });

  const monitorMessage = useCallback(async (message: ConversationMessage) => {
    if (message.role === 'user') {
      const analysis = await analyzeMessage(message.content, context);

      if (analysis.objectionType !== 'none' && analysis.confidence > 0.6) {
        const alert = {
          message,
          analysis,
          timestamp: new Date(),
        };

        setConversationAlerts(prev => [...prev, alert]);
        onObjectionAlert?.(message, analysis);
      }
    }
  }, [analyzeMessage, context, onObjectionAlert]);

  const clearAlerts = useCallback(() => {
    setConversationAlerts([]);
  }, []);

  return {
    analyzeMessage,
    isAnalyzing,
    lastAnalysis,
    clearAnalysis,
    monitorMessage,
    conversationAlerts,
    clearAlerts,
  };
}

/**
 * Hook for objection response generation
 */
interface UseObjectionResponseOptions {
  enabled?: boolean;
}

interface ObjectionResponseResult {
  generateResponse: (objection: ObjectionAnalysis, context: ObjectionContext) => Promise<any>;
  isGenerating: boolean;
  lastResponse: any;
}

export function useObjectionResponse(
  options: UseObjectionResponseOptions = {}
): ObjectionResponseResult {
  const { enabled = true } = options;

  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const objectionHandlerRef = useRef<AIObjectionHandler | null>(null);

  // Initialize objection handler
  if (!objectionHandlerRef.current) {
    objectionHandlerRef.current = new AIObjectionHandler();
  }

  const generateResponse = useCallback(async (
    objection: ObjectionAnalysis,
    context: ObjectionContext
  ) => {
    if (!enabled || !objectionHandlerRef.current) {
      return null;
    }

    setIsGenerating(true);

    try {
      const response = await objectionHandlerRef.current.handleObjection(objection, context);
      setLastResponse(response);
      return response;
    } finally {
      setIsGenerating(false);
    }
  }, [enabled]);

  return {
    generateResponse,
    isGenerating,
    lastResponse,
  };
}
