// React hooks for AI features - Professional Enterprise Version
'use client';

import { useState, useCallback, useMemo } from 'react';
import { SkinDiseaseDetector, AnalysisResult } from '@/lib/ai/skin-disease-detector';
import { VirtualMakeupTryOn, TryOnResult, MakeupProduct } from '@/lib/ai/virtual-makeup';
import { SkincareRoutineGenerator, RoutineRecommendation } from '@/lib/ai/skincare-routine-generator';

// Persistent AI Service Instances (Singleton Pattern for performance)
const skinDetector = new SkinDiseaseDetector();
const makeupTryOn = new VirtualMakeupTryOn();
const routineGenerator = new SkincareRoutineGenerator();

export interface UseAIState<T> {
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  result: T | null;
  lastRunAt: number | null;
}

const createInitialState = <T>(): UseAIState<T> => ({
  isLoading: false,
  isProcessing: false,
  error: null,
  result: null,
  lastRunAt: null,
});

/**
 * Hook for high-precision skin disease detection
 */
export function useSkinAnalysis() {
  const [state, setState] = useState<UseAIState<AnalysisResult>>(createInitialState());

  const analyzeImage = useCallback(async (imageData: string | File) => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    const startTime = Date.now();
    
    try {
      // In professional grade, we might add pre-validation or image optimization here
      const result = await skinDetector.analyzeImage(imageData);
      
      setState({
        isLoading: false,
        isProcessing: false,
        error: null,
        result,
        lastRunAt: Date.now(),
      });
      
      console.log(`[AI] Skin analysis completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI Analysis failed';
      setState(prev => ({ ...prev, isProcessing: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => setState(createInitialState()), []);

  return {
    ...state,
    analyzeImage,
    reset,
    getConditionInfo: (id: string) => (skinDetector as any).getConditionInfo?.(id),
    getAllConditions: () => (skinDetector as any).getAllConditions?.() || [],
  };
}

/**
 * Hook for professional virtual makeup try-on
 */
export function useVirtualMakeup() {
  const [state, setState] = useState<UseAIState<TryOnResult>>(createInitialState());

  const applyMakeup = useCallback(async (
    imageData: string | File,
    products: MakeupProduct[]
  ) => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      const result = await makeupTryOn.applyMakeup(imageData, products);
      setState({
        isLoading: false,
        isProcessing: false,
        error: null,
        result,
        lastRunAt: Date.now(),
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Visual simulation failed';
      setState(prev => ({ ...prev, isProcessing: false, error: errorMessage }));
      throw error;
    }
  }, []);

  return {
    ...state,
    applyMakeup,
    getProduct: makeupTryOn.getProduct.bind(makeupTryOn),
    getProductsByCategory: makeupTryOn.getProductsByCategory.bind(makeupTryOn),
    getAllProducts: makeupTryOn.getAllProducts.bind(makeupTryOn),
    getLook: makeupTryOn.getLook.bind(makeupTryOn),
    getAllLooks: makeupTryOn.getAllLooks.bind(makeupTryOn),
  };
}

/**
 * Hook for advanced skincare routine generation
 */
export function useSkincareRoutine() {
  const [state, setState] = useState<UseAIState<RoutineRecommendation>>(createInitialState());

  const generateRoutine = useCallback((
    skinType: string,
    concerns: string[],
    budget: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      const result = routineGenerator.generateRoutine(skinType, concerns, budget);
      setState({
        isLoading: false,
        isProcessing: false,
        error: null,
        result,
        lastRunAt: Date.now(),
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Routine generation failed';
      setState(prev => ({ ...prev, isProcessing: false, error: errorMessage }));
      throw error;
    }
  }, []);

  return {
    ...state,
    generateRoutine,
  };
}

/**
 * Orchestrator hook for unified AI capabilities
 */
export function useAI() {
  const skinAnalysis = useSkinAnalysis();
  const virtualMakeup = useVirtualMakeup();
  const skincareRoutine = useSkincareRoutine();

  const isAnyLoading = useMemo(() => 
    skinAnalysis.isProcessing || virtualMakeup.isProcessing || skincareRoutine.isProcessing,
    [skinAnalysis.isProcessing, virtualMakeup.isProcessing, skincareRoutine.isProcessing]
  );

  return {
    skinAnalysis,
    virtualMakeup,
    skincareRoutine,
    isAnyLoading,
  };
}

