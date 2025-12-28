/**
 * AI Providers Status Endpoint
 * 
 * Returns status of all AI providers (OpenAI, Anthropic, Gemini, DeepFace)
 * Used by dashboard to show which AI services are active
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAvailableProviders } from '@/lib/ai/unified-ai-service'
import { withPublicAccess } from '@/lib/auth/middleware'
import { getDeepFaceApiUrl, hasDeepFaceApiUrl } from '@/lib/config/ai'

export const GET = withPublicAccess(async (_request: NextRequest) => {
  try {
    const providers = getAvailableProviders()
    
    // Check DeepFace service
    const deepfaceUrl =
      hasDeepFaceApiUrl() ? getDeepFaceApiUrl() : process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:8001'
    let deepfaceStatus = {
      name: 'deepface',
      available: false,
      endpoint: deepfaceUrl
    }
    
    try {
      if (!deepfaceUrl) {
        throw new Error('DeepFace not configured')
      }
      const response = await fetch(`${deepfaceUrl}/health`, {
        signal: AbortSignal.timeout(3000)
      })
      deepfaceStatus.available = response.ok
    } catch {
      deepfaceStatus.available = false
    }

    // Summary
    const activeProviders = providers.filter(p => p.available && p.name !== 'demo')
    const hasRealAI = activeProviders.length > 0
    
    return NextResponse.json({
      status: hasRealAI ? 'active' : 'demo_mode',
      message: hasRealAI 
        ? `${activeProviders.length} AI provider(s) active` 
        : 'Running in demo mode - no AI keys configured',
      providers: [
        ...providers.map(p => ({
          name: p.name,
          available: p.available,
          priority: p.priority
        })),
        deepfaceStatus
      ],
      recommendations: !hasRealAI ? [
        'Add OPENAI_API_KEY for best results',
        'Add ANTHROPIC_API_KEY for fallback',
        'Add GEMINI_API_KEY for free alternative (1,500 req/day)',
        'Start DeepFace service for age/gender detection'
      ] : [],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}, { rateLimitCategory: 'api' })
