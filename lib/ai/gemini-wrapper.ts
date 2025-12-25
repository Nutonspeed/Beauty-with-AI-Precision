/**
 * Gemini API Wrapper using @google/generative-ai SDK
 * Direct integration to avoid Vercel AI SDK version conflicts
 */

import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai'

// Initialize Gemini with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '')

export interface GeminiResponse {
  model: string
  text: string
  processingTime: number
  cost: number // Always 0 for Gemini 1.5 Flash (free tier)
}

/**
 * Analyze text with Gemini 1.5 Flash
 */
export async function analyzeWithGeminiText(prompt: string): Promise<GeminiResponse> {
  const startTime = performance.now()

  try {
    const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    const processingTime = performance.now() - startTime

    console.log('[Gemini] Success:', {
      model: 'gemini-1.5-flash',
      processingTime,
      textLength: text.length,
    })

    return {
      model: 'gemini-1.5-flash',
      text,
      processingTime,
      cost: 0, // FREE!
    }
  } catch (error) {
    console.error('[Gemini] Error:', error)
    throw error
  }
}

/**
 * Analyze image with Gemini 1.5 Flash Vision
 */
export async function analyzeWithGeminiVision(imageBase64: string, prompt: string): Promise<GeminiResponse> {
  const startTime = performance.now()

  try {
    const model: GenerativeModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    
    // Prepare image part
    const imagePart: Part = {
      inlineData: {
        data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
        mimeType: 'image/jpeg',
      },
    }

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    const text = response.text()

    const processingTime = performance.now() - startTime

    console.log('[Gemini Vision] Success:', {
      model: 'gemini-1.5-flash',
      processingTime,
      textLength: text.length,
    })

    return {
      model: 'gemini-1.5-flash',
      text,
      processingTime,
      cost: 0, // FREE!
    }
  } catch (error) {
    console.error('[Gemini Vision] Error:', error)
    throw error
  }
}

/**
 * Test Gemini connection
 */
export async function testGemini(): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await analyzeWithGeminiText('Hello! Respond with "Gemini is working"')
    return {
      success: result.text.includes('Gemini is working'),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
