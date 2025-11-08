/**
 * React Hook for Advanced AI Analysis with Enhanced Metrics
 */

'use client'

// @ts-nocheck
import { useState, useCallback, useEffect, useRef } from 'react';
import { getAdvancedAIPipeline, type AdvancedAnalysisResult, type AdvancedAnalysisOptions } from '@/lib/ai/advanced-pipeline'
import type { EnhancedMetricsResult } from '@/lib/ai/enhanced-skin-metrics'

export interface UseAdvancedAnalysisState {
  // Analysis state
  isAnalyzing: boolean
  isInitialized: boolean
  
  // Results
  result: AdvancedAnalysisResult | null
  enhancedMetrics: EnhancedMetricsResult | null
  
  // Progress
  progress: number // 0-100
  currentStep: string
  
  // Errors
  error: string | null
  
  // Performance
  processingTime: number | null
}

export interface UseAdvancedAnalysisReturn extends UseAdvancedAnalysisState {
  // Actions
  analyzeImage: (file: File, options?: AdvancedAnalysisOptions) => Promise<void>
  analyzeWithTier: (file: File, tier: 'free' | 'premium' | 'clinical') => Promise<void>
  compareProgress: (beforeFile: File, afterFile: File) => Promise<{
    before: AdvancedAnalysisResult
    after: AdvancedAnalysisResult
    improvements: Record<string, number>
    summary: string
  }>
  reset: () => void
  
  // Utilities
  getMetricSummary: () => string | null
  getRecommendations: () => string[]
  exportResults: () => Record<string, any> | null
}

export function useAdvancedAnalysis(
  autoInitialize = true
): UseAdvancedAnalysisReturn {
  const [state, setState] = useState<UseAdvancedAnalysisState>({
    isAnalyzing: false,
    isInitialized: false,
    result: null,
    enhancedMetrics: null,
    progress: 0,
    currentStep: '',
    error: null,
    processingTime: null,
  })
  
  const pipelineRef = useRef(getAdvancedAIPipeline())
  
  // Auto-initialize
  useState(() => {
    if (autoInitialize) {
      pipelineRef.current.initialize().then(() => {
        setState((prev: UseAdvancedAnalysisState) => ({ ...prev, isInitialized: true }))
      })
    }
  })
  
  const updateProgress = useCallback((progress: number, step: string) => {
    setState((prev: UseAdvancedAnalysisState) => ({ ...prev, progress, currentStep: step }))
  }, [])
  
  const analyzeImage = useCallback(async (
    file: File,
    options: AdvancedAnalysisOptions = {}
  ) => {
    try {
      setState((prev: UseAdvancedAnalysisState) => ({
        ...prev,
        isAnalyzing: true,
        error: null,
        progress: 0,
        currentStep: 'กำลังเตรียมข้อมูล...'
      }))
      
      updateProgress(10, 'กำลังตรวจสอบคุณภาพภาพ...')
      
      const startTime = performance.now()
      const result = await pipelineRef.current.analyzeImage(file, options)
      const processingTime = performance.now() - startTime
      
      updateProgress(100, 'วิเคราะห์เสร็จสมบูรณ์')
      
      setState((prev: UseAdvancedAnalysisState) => ({
        ...prev,
        isAnalyzing: false,
        result,
        enhancedMetrics: result.enhancedMetrics || null,
        processingTime,
        progress: 100,
        currentStep: 'เสร็จสิ้น'
      }))
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการวิเคราะห์'
      
      setState((prev: UseAdvancedAnalysisState) => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
        progress: 0,
        currentStep: ''
      }))
      
      throw error
    }
  }, [updateProgress])
  
  const analyzeWithTier = useCallback(async (
    file: File,
    tier: 'free' | 'premium' | 'clinical'
  ) => {
    try {
      setState((prev: UseAdvancedAnalysisState) => ({
        ...prev,
        isAnalyzing: true,
        error: null,
        progress: 0,
        currentStep: `กำลังวิเคราะห์ระดับ ${tier.toUpperCase()}...`
      }))
      
      const startTime = performance.now()
      const result = await pipelineRef.current.analyzeWithTier(file, tier)
      const processingTime = performance.now() - startTime
      
      setState((prev: UseAdvancedAnalysisState) => ({
        ...prev,
        isAnalyzing: false,
        result,
        enhancedMetrics: result.enhancedMetrics || null,
        processingTime,
        progress: 100,
        currentStep: 'เสร็จสิ้น'
      }))
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการวิเคราะห์'
      
      setState((prev: UseAdvancedAnalysisState) => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
        progress: 0,
        currentStep: ''
      }))
      
      throw error
    }
  }, [])
  
  const compareProgress = useCallback(async (
    beforeFile: File,
    afterFile: File
  ) => {
    try {
      setState((prev: UseAdvancedAnalysisState) => ({
        ...prev,
        isAnalyzing: true,
        error: null,
        progress: 0,
        currentStep: 'กำลังเปรียบเทียบภาพ Before & After...'
      }))
      
      const comparison = await pipelineRef.current.compareProgress(beforeFile, afterFile)
      
      setState((prev: UseAdvancedAnalysisState) => ({
        ...prev,
        isAnalyzing: false,
        progress: 100,
        currentStep: 'เสร็จสิ้น'
      }))
      
      return comparison
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเปรียบเทียบ'
      
      setState((prev: UseAdvancedAnalysisState) => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
        progress: 0,
        currentStep: ''
      }))
      
      throw error
    }
  }, [])
  
  const reset = useCallback(() => {
    setState({
      isAnalyzing: false,
      isInitialized: state.isInitialized,
      result: null,
      enhancedMetrics: null,
      progress: 0,
      currentStep: '',
      error: null,
      processingTime: null,
    })
  }, [state.isInitialized])
  
  const getMetricSummary = useCallback((): string | null => {
    if (!state.enhancedMetrics) return null
    
    const { overallHealth, skinAge } = state.enhancedMetrics
    
    return `สุขภาพผิวโดยรวม: เกรด ${overallHealth.grade} (${overallHealth.score} คะแนน)\n` +
           `อายุผิว: ${skinAge.estimated} ปี` +
           (skinAge.chronological ? ` (เทียบกับอายุจริง: ${skinAge.difference > 0 ? '+' : ''}${skinAge.difference} ปี)` : '')
  }, [state.enhancedMetrics])
  
  const getRecommendations = useCallback((): string[] => {
    if (!state.enhancedMetrics) return []
    
    const recommendations: string[] = []
    const metrics = state.enhancedMetrics
    
    // Spots recommendations
    if (metrics.spots.score < 70) {
      recommendations.push('ควรใช้ผลิตภัณฑ์ลดฝ้า-กระ และป้องกัน UV')
    }
    
    // Wrinkles recommendations
    if (metrics.wrinkles.score < 70) {
      recommendations.push('แนะนำผลิตภัณฑ์ลดริ้วรอย เช่น Retinol หรือ Peptides')
    }
    
    // Hydration recommendations
    if (metrics.hydration.score < 60) {
      recommendations.push('ผิวแห้ง ควรเพิ่มความชุ่มชื้นด้วย Hyaluronic Acid')
    }
    
    // Redness recommendations
    if (metrics.redness.score < 70) {
      recommendations.push('มีอาการผิวแดง ควรใช้ผลิตภัณฑ์บรรเทาการอักเสบ')
    }
    
    // Texture recommendations
    if (metrics.texture.score < 70) {
      recommendations.push('ผิวไม่เรียบเนียน แนะนำ Exfoliation และ Serum ปรับสภาพผิว')
    }
    
    // General sun protection
    if (metrics.spots.severity !== 'low' || metrics.redness.score < 80) {
      recommendations.push('ใช้ครีมกันแดด SPF 50+ ทุกวัน')
    }
    
    return recommendations
  }, [state.enhancedMetrics])
  
  const exportResults = useCallback((): Record<string, any> | null => {
    if (!state.result) return null
    
    return {
      timestamp: state.result.timestamp,
      processingTime: state.result.totalProcessingTime,
      breakdown: state.result.breakdown,
      quality: {
        score: state.result.qualityReport.score,
        isGoodQuality: state.result.qualityReport.isGoodQuality,
        issues: state.result.qualityReport.issues
      },
      faceDetection: {
        landmarksCount: state.result.faceDetection.landmarks.length,
        confidence: state.result.faceDetection.confidence
      },
      skinAnalysis: {
        wrinkles: state.result.skinAnalysis.visiaMetrics?.wrinkles,
        spots: state.result.skinAnalysis.visiaMetrics?.spots,
        pores: state.result.skinAnalysis.visiaMetrics?.pores,
        texture: state.result.skinAnalysis.visiaMetrics?.texture
      },
      enhancedMetrics: state.enhancedMetrics ? {
        overallHealth: state.enhancedMetrics.overallHealth,
        skinAge: state.enhancedMetrics.skinAge,
        spots: state.enhancedMetrics.spots,
        pores: state.enhancedMetrics.pores,
        wrinkles: state.enhancedMetrics.wrinkles,
        texture: state.enhancedMetrics.texture,
        redness: state.enhancedMetrics.redness,
        hydration: state.enhancedMetrics.hydration,
        skinTone: state.enhancedMetrics.skinTone,
        elasticity: state.enhancedMetrics.elasticity
      } : null
    }
  }, [state.result, state.enhancedMetrics])
  
  return {
    ...state,
    analyzeImage,
    analyzeWithTier,
    compareProgress,
    reset,
    getMetricSummary,
    getRecommendations,
    exportResults
  }
}

// Type exports
export type { AdvancedAnalysisResult, AdvancedAnalysisOptions, EnhancedMetricsResult }
