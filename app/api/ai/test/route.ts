import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithGeminiText } from '@/lib/ai/gemini-wrapper'

export async function POST(request: NextRequest) {
  try {
    const { prompt, language = 'en' } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    console.log('[AI Test] Testing Gemini with:', { prompt, language })

    // Test with Gemini wrapper (text-only)
    const result = await analyzeWithGeminiText(
      `You are a helpful assistant. Language: ${language}. Respond to: ${prompt}`
    )

    console.log('[AI Test] Success:', {
      model: result.model,
      processingTime: result.processingTime,
      cost: result.cost,
    })

    return NextResponse.json({
      success: true,
      model: result.model,
      processingTime: result.processingTime,
      cost: result.cost,
      message: 'Gemini integration test successful',
      response: result.text,
    })
  } catch (error) {
    console.error('[AI Test] Error:', error)
    return NextResponse.json(
      {
        error: 'Gemini integration test failed',
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Test Endpoint (Gemini)',
    usage: 'POST with { prompt: string, language?: "en"|"th" }',
    model: 'gemini-1.5-flash (FREE - 1,500 requests/day)',
    features: ['Text analysis', 'Vision analysis', 'Thai language support'],
  })
}
