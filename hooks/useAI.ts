// React hooks for AI features
'use client';

import { useState, useCallback, useEffect } from 'react';
import { SkinDiseaseDetector, AnalysisResult, SkinCondition } from '@/lib/ai/skin-disease-detector';
import { VirtualMakeupTryOn, TryOnResult, MakeupProduct, MakeupLook } from '@/lib/ai/virtual-makeup';
import { SkincareRoutineGenerator, RoutineRecommendation } from '@/lib/ai/skincare-routine-generator';

// Initialize AI services
const skinDetector = new SkinDiseaseDetector();
const makeupTryOn = new VirtualMakeupTryOn();
const routineGenerator = new SkincareRoutineGenerator();

export interface UseAIState {
  loading: boolean;
  error: string | null;
  result: AnalysisResult | TryOnResult | RoutineRecommendation | null;
}

/**
 * Hook for skin disease detection
 */
export function useSkinAnalysis() {
  type KnownSkinCondition = Omit<SkinCondition, 'confidence' | 'severity'>;
  const [state, setState] = useState<UseAIState>({
    loading: false,
    error: null,
    result: null,
  });

  const analyzeImage = useCallback(async (imageData: string | File) => {
    setState({ loading: true, error: null, result: null });
    
    try {
      const result = await skinDetector.analyzeImage(imageData);
      setState({ loading: false, error: null, result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setState({ loading: false, error: errorMessage, result: null });
      throw error;
    }
  }, []);

  const getConditionInfo = useCallback((conditionId: string): KnownSkinCondition | null => {
    return skinDetector.getConditionInfo(conditionId);
  }, []);

  const getAllConditions = useCallback((): KnownSkinCondition[] => {
    return skinDetector.getAllConditions();
  }, []);

  return {
    ...state,
    analyzeImage,
  getConditionInfo,
  getAllConditions,
    result: state.result as AnalysisResult | null,
  };
}

/**
 * Hook for virtual makeup try-on
 */
export function useVirtualMakeup() {
  const [state, setState] = useState<UseAIState>({
    loading: false,
    error: null,
    result: null,
  });

  const applyMakeup = useCallback(async (
    imageData: string | File,
    products: MakeupProduct[]
  ) => {
    setState({ loading: true, error: null, result: null });
    
    try {
      const result = await makeupTryOn.applyMakeup(imageData, products);
      setState({ loading: false, error: null, result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Makeup application failed';
      setState({ loading: false, error: errorMessage, result: null });
      throw error;
    }
  }, []);

  const getProduct = useCallback((productId: string) => {
    return makeupTryOn.getProduct(productId);
  }, []);

  const getProductsByCategory = useCallback((category: any) => {
    return makeupTryOn.getProductsByCategory(category);
  }, []);

  const getAllProducts = useCallback(() => {
    return makeupTryOn.getAllProducts();
  }, []);

  const getLook = useCallback((lookId: string) => {
    return makeupTryOn.getLook(lookId);
  }, []);

  const getAllLooks = useCallback(() => {
    return makeupTryOn.getAllLooks();
  }, []);

  return {
    ...state,
    applyMakeup,
    getProduct,
    getProductsByCategory,
    getAllProducts,
    getLook,
    getAllLooks,
    result: state.result as TryOnResult | null,
  };
}

/**
 * Hook for skincare routine generation
 */
export function useSkincareRoutine() {
  const [state, setState] = useState<UseAIState>({
    loading: false,
    error: null,
    result: null,
  });

  const generateRoutine = useCallback((
    skinType: string,
    concerns: string[],
    budget: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    setState({ loading: true, error: null, result: null });
    
    try {
      const result = routineGenerator.generateRoutine(skinType, concerns, budget);
      setState({ loading: false, error: null, result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Routine generation failed';
      setState({ loading: false, error: errorMessage, result: null });
      throw error;
    }
  }, []);

  return {
    ...state,
    generateRoutine,
    result: state.result as RoutineRecommendation | null,
  };
}

/**
 * Combined hook for all AI features
 */
export function useAI() {
  const skinAnalysis = useSkinAnalysis();
  const virtualMakeup = useVirtualMakeup();
  const skincareRoutine = useSkincareRoutine();

  return {
    skinAnalysis,
    virtualMakeup,
    skincareRoutine,
  };
}
