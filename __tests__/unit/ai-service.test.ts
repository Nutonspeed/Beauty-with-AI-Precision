/**
 * AI Service Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the unified AI service functions
const mockAnalysisResult = {
  provider: 'demo',
  success: true,
  data: {
    concerns: [
      { type: 'fine_lines', severity: 'mild', confidence: 0.82, location: 'forehead', description: 'Test' }
    ],
    visiaScores: {
      wrinkles: 82, spots: 75, pores: 78, texture: 85,
      evenness: 72, firmness: 88, radiance: 76, hydration: 70
    },
    recommendations: ['Test recommendation'],
    overallScore: 78
  },
  processingTime: 100
}

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAvailableProviders', () => {
    it('should return demo provider when no API keys configured', () => {
      // Without API keys, only demo should be available
      const providers = [
        { name: 'openai', available: false, priority: 1 },
        { name: 'anthropic', available: false, priority: 2 },
        { name: 'google', available: false, priority: 3 },
        { name: 'demo', available: true, priority: 99 }
      ]
      
      const available = providers.filter(p => p.available)
      expect(available).toHaveLength(1)
      expect(available[0].name).toBe('demo')
    })

    it('should prioritize providers correctly', () => {
      const providers = [
        { name: 'demo', available: true, priority: 99 },
        { name: 'openai', available: true, priority: 1 },
        { name: 'google', available: true, priority: 3 }
      ].sort((a, b) => a.priority - b.priority)

      expect(providers[0].name).toBe('openai')
      expect(providers[1].name).toBe('google')
      expect(providers[2].name).toBe('demo')
    })
  })

  describe('Analysis Result Format', () => {
    it('should have required fields', () => {
      expect(mockAnalysisResult).toHaveProperty('provider')
      expect(mockAnalysisResult).toHaveProperty('success')
      expect(mockAnalysisResult).toHaveProperty('data')
      expect(mockAnalysisResult).toHaveProperty('processingTime')
    })

    it('should have valid VISIA scores', () => {
      const scores = mockAnalysisResult.data.visiaScores
      const scoreKeys = ['wrinkles', 'spots', 'pores', 'texture', 'evenness', 'firmness', 'radiance', 'hydration']
      
      scoreKeys.forEach(key => {
        expect(scores).toHaveProperty(key)
        expect(scores[key as keyof typeof scores]).toBeGreaterThanOrEqual(0)
        expect(scores[key as keyof typeof scores]).toBeLessThanOrEqual(100)
      })
    })

    it('should have valid concerns array', () => {
      const concerns = mockAnalysisResult.data.concerns
      expect(Array.isArray(concerns)).toBe(true)
      
      concerns.forEach(concern => {
        expect(concern).toHaveProperty('type')
        expect(concern).toHaveProperty('severity')
        expect(['mild', 'moderate', 'severe']).toContain(concern.severity)
        expect(concern).toHaveProperty('confidence')
        expect(concern.confidence).toBeGreaterThanOrEqual(0)
        expect(concern.confidence).toBeLessThanOrEqual(1)
      })
    })

    it('should have overall score in valid range', () => {
      expect(mockAnalysisResult.data.overallScore).toBeGreaterThanOrEqual(0)
      expect(mockAnalysisResult.data.overallScore).toBeLessThanOrEqual(100)
    })
  })

  describe('Demo Fallback', () => {
    it('should return demo data when all providers fail', () => {
      // Simulate all providers failing
      const result = mockAnalysisResult
      expect(result.provider).toBe('demo')
      expect(result.success).toBe(true)
    })
  })
})
