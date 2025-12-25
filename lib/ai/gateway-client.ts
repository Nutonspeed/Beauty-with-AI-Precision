/**
 * Vercel AI Gateway Client
 *
 * Multi-model AI analysis using Vercel AI Gateway
 * Cost-optimized: Gemini 1.5 Flash (free) -> GPT-4o-mini -> Claude 3.5 Haiku -> GPT-4o/Claude Sonnet
 */

import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { google } from "@ai-sdk/google"
import { createServiceClient } from "@/lib/supabase/server"

// Initialize providers
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// AI Gateway configuration
export interface SkinAnalysisPrompt {
  imageBase64: string
  language: "en" | "th"
  analysisType: "quick" | "detailed" | "medical"
  complexity?: "simple" | "moderate" | "complex"
  userId?: string // Optional user ID for tracking
}

export interface AIModelResponse {
  model: string
  concerns: Array<{
    type: string
    severity: "mild" | "moderate" | "severe"
    confidence: number
    location?: string
    description: string
  }>
  visiaScores: {
    wrinkles: number
    spots: number
    pores: number
    texture: number
    evenness: number
    firmness: number
    radiance: number
    hydration: number
  }
  recommendations: string[]
  overallScore: number
  processingTime: number
  rawResponse: string
  cost?: number // Estimated cost in USD
  confidence?: number // Overall confidence score
}

/**
 * Smart Model Router - Chooses the most cost-effective model based on task complexity
 * WITH RATE LIMITING
 */
export async function analyzeWithSmartRouter(
  prompt: SkinAnalysisPrompt,
  clinicId?: string
): Promise<AIModelResponse> {
  const complexity = prompt.complexity || (prompt.analysisType === "medical" ? "complex" : "simple")
  
  // Check rate limit before routing
  if (clinicId) {
    const canProceed = await checkRateLimit(clinicId, 'gemini', 'gemini-1.5-flash')
    if (!canProceed) {
      throw new Error('AI usage limit exceeded for today. Please upgrade your plan.')
    }
  }
  
  // Route to appropriate model based on complexity
  switch (complexity) {
    case "simple":
      console.log("[AI Router] Using Gemini 1.5 Flash (free) for simple analysis")
      return await analyzeWithGeminiFlash(prompt, clinicId)
    case "moderate":
      console.log("[AI Router] Using GPT-4o-mini for moderate analysis")
      return await analyzeWithGPT4oMini(prompt, clinicId)
    case "complex":
      console.log("[AI Router] Using GPT-4o for complex analysis")
      return await analyzeWithGPT4o(prompt, clinicId)
    default:
      console.log("[AI Router] Defaulting to Gemini 1.5 Flash")
      return await analyzeWithGeminiFlash(prompt, clinicId)
  }
}

/**
 * Check rate limit for AI usage
 */
async function checkRateLimit(clinicId: string, provider: string, model: string): Promise<boolean> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.rpc('check_ai_usage_limit', {
      p_clinic_id: clinicId,
      p_provider: provider,
      p_model: model
    })
    
    if (error) {
      console.error('Rate limit check failed:', error)
      // Allow request if check fails (fail open)
      return true
    }
    
    return data?.[0]?.allowed || false
  } catch (err) {
    console.error('Rate limit check error:', err)
    return true // Fail open
  }
}

/**
 * Log AI usage after successful API call
 */
async function logAIUsage(
  clinicId: string,
  userId: string,
  provider: string,
  model: string,
  tokensUsed: number = 0,
  costUsd: number = 0
): Promise<void> {
  try {
    const supabase = createServiceClient()
    await supabase.rpc('log_ai_usage', {
      p_clinic_id: clinicId,
      p_user_id: userId,
      p_provider: provider,
      p_model: model,
      p_usage_type: 'skin_analysis',
      p_tokens_used: tokensUsed,
      p_cost_usd: costUsd
    })
  } catch (err) {
    console.error('Failed to log AI usage:', err)
    // Don't fail the request if logging fails
  }
}

/**
 * Gemini 1.5 Flash - FREE model (1,500 requests/day)
 */
export async function analyzeWithGeminiFlash(
  prompt: SkinAnalysisPrompt,
  clinicId?: string
): Promise<AIModelResponse> {
  const startTime = performance.now()

  try {
    const systemPrompt = `You are an expert dermatologist AI analyzing facial skin images. Provide detailed analysis in ${prompt.language === "th" ? "Thai" : "English"}.

Analyze the image for these 8 VISIA metrics (score 0-100):
1. Wrinkles (รอยเหี่ยวย่น) - Fine lines and deep wrinkles
2. Spots/Pigmentation (จุดด่างดำ) - Dark spots, age spots, melasma
3. Pores (รูขุมขน) - Pore size and visibility
4. Texture (พื้นผิว) - Skin smoothness and roughness
5. Evenness (ความสม่ำเสมอ) - Skin tone uniformity
6. Firmness (ความกระชับ) - Skin elasticity and sagging
7. Radiance (ความกระจ่างใส) - Skin brightness and glow
8. Hydration (ความชุ่มชื้น) - Skin moisture level

For each concern found, provide:
- Type (acne, wrinkles, pigmentation, redness, dryness, etc.)
- Severity score (0-100)
- Location on face
- Recommended treatment

Return JSON format:
{
  "visiaScores": {
    "wrinkles": 0-100,
    "spots": 0-100,
    "pores": 0-100,
    "texture": 0-100,
    "evenness": 0-100,
    "firmness": 0-100,
    "radiance": 0-100,
    "hydration": 0-100
  },
  "concerns": [...],
  "recommendations": [...],
  "overallScore": 0-100
}`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            { text: `Analyze this skin image: ${prompt.imageBase64}` }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!analysisText) {
      throw new Error('No analysis received from Gemini')
    }

    // Parse JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      visiaScores: {},
      concerns: [],
      recommendations: [],
      overallScore: 50
    }

    const endTime = performance.now()
    const processingTime = endTime - startTime

    // Log usage if clinicId provided
    if (clinicId && prompt.userId) {
      await logAIUsage(clinicId, prompt.userId, 'gemini', 'gemini-1.5-flash', 0, 0)
    }

    return {
      model: 'gemini-1.5-flash',
      confidence: 0.85,
      visiaScores: analysis.visiaScores || {},
      concerns: analysis.concerns || [],
      recommendations: analysis.recommendations || [],
      overallScore: analysis.overallScore || 50,
      processingTime,
      rawResponse: analysisText,
      cost: 0 // FREE
    }

  } catch (error) {
    console.error('[Gemini Flash] Error:', error)
    // Fallback to GPT-4o-mini
    console.log("[AI Router] Falling back to GPT-4o-mini")
    return await analyzeWithGPT4oMini(prompt)
  }
}

/**
 * GPT-4o Mini - Cost-effective for moderate analysis ($0.15/1M input)
 */
export async function analyzeWithGPT4oMini(prompt: SkinAnalysisPrompt, clinicId?: string): Promise<AIModelResponse> {
  const startTime = performance.now()

  try {
    const systemPrompt = `You are an expert dermatologist AI analyzing facial skin images. Provide detailed analysis in ${prompt.language === "th" ? "Thai" : "English"}.

Analyze the image for these 8 VISIA metrics (score 0-100):
1. Wrinkles, 2. Spots, 3. Pores, 4. Texture, 5. Evenness, 6. Firmness, 7. Radiance, 8. Hydration.

Return JSON with concerns, visiaScores, recommendations, overallScore.`

    const { text } = await generateText({
      model: openai("gpt-4o-mini") as any,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this facial skin image. Analysis type: ${prompt.analysisType}`,
            },
            {
              type: "image",
              image: prompt.imageBase64,
            },
          ],
        },
      ],
      temperature: 0.3,
    })

    const processingTime = performance.now() - startTime

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from GPT-4o-mini response")
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      model: "gpt-4o-mini",
      concerns: parsed.concerns || [],
      visiaScores: parsed.visiaScores || {},
      recommendations: parsed.recommendations || [],
      overallScore: parsed.overallScore || 0,
      processingTime,
      rawResponse: text,
      cost: 0.00015, // Estimated cost per request
    }
  } catch (error) {
    console.error("GPT-4o-mini analysis failed:", error)
    throw error
  }
}

/**
 * Analyze skin with GPT-4o (Primary Model)
 */
export async function analyzeWithGPT4o(prompt: SkinAnalysisPrompt, clinicId?: string): Promise<AIModelResponse> {
  const startTime = performance.now()

  try {
    const systemPrompt = `You are an expert dermatologist AI analyzing facial skin images. Provide detailed analysis in ${prompt.language === "th" ? "Thai" : "English"}.

Analyze the image for these 8 VISIA metrics (score 0-100):
1. Wrinkles (รอยเหี่ยวย่น) - Fine lines and deep wrinkles
2. Spots/Pigmentation (จุดด่างดำ) - Dark spots, age spots, melasma
3. Pores (รูขุมขน) - Pore size and visibility
4. Texture (พื้นผิว) - Skin smoothness and roughness
5. Evenness (ความสม่ำเสมอ) - Skin tone uniformity
6. Firmness (ความกระชับ) - Skin elasticity and sagging
7. Radiance (ความกระจ่างใส) - Skin brightness and glow
8. Hydration (ความชุ่มชื้น) - Skin moisture level

For each concern found, provide:
- Type (acne, wrinkles, pigmentation, redness, dryness, etc.)
- Severity (mild/moderate/severe)
- Confidence (0-100%)
- Location on face
- Brief description

Also provide 3-5 personalized recommendations.

Return response in this JSON format:
{
  "concerns": [{"type": "...", "severity": "...", "confidence": 0.95, "location": "...", "description": "..."}],
  "visiaScores": {"wrinkles": 85, "spots": 78, ...},
  "recommendations": ["...", "..."],
  "overallScore": 82
}`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this facial skin image in detail. Analysis type: ${prompt.analysisType}`,
            },
            {
              type: "image",
              image: prompt.imageBase64,
            },
          ],
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent medical analysis
    })

    const processingTime = performance.now() - startTime

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from GPT-4o response")
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      model: "gpt-4o",
      concerns: parsed.concerns || [],
      visiaScores: parsed.visiaScores || {},
      recommendations: parsed.recommendations || [],
      overallScore: parsed.overallScore || 0,
      processingTime,
      rawResponse: text,
    }
  } catch (error) {
    console.error("GPT-4o analysis failed:", error)
    throw error
  }
}

/**
 * Analyze skin with Claude 3.5 Sonnet (Validation Model)
 */
export async function analyzeWithClaude(prompt: SkinAnalysisPrompt): Promise<AIModelResponse> {
  const startTime = performance.now()

  try {
    const systemPrompt = `You are a conservative dermatologist AI providing medical-grade skin analysis. Be precise and cautious in your assessments.

Analyze for 8 VISIA metrics (0-100 scale, where 100 is perfect):
1. Wrinkles - Count and depth of lines
2. Spots - Pigmentation and dark spots
3. Pores - Size and visibility
4. Texture - Smoothness
5. Evenness - Tone uniformity
6. Firmness - Elasticity
7. Radiance - Brightness
8. Hydration - Moisture

Provide JSON response with concerns, scores, recommendations, and overall score.`

    const { text } = await generateText({
      model: "anthropic/claude-3-5-sonnet-20241022",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this skin image. Language: ${prompt.language}. Type: ${prompt.analysisType}`,
            },
            {
              type: "image",
              image: prompt.imageBase64,
            },
          ],
        },
      ],
      temperature: 0.2, // Very conservative
    })

    const processingTime = performance.now() - startTime

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from Claude response")
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      model: "claude-3.5-sonnet",
      concerns: parsed.concerns || [],
      visiaScores: parsed.visiaScores || {},
      recommendations: parsed.recommendations || [],
      overallScore: parsed.overallScore || 0,
      processingTime,
      rawResponse: text,
    }
  } catch (error) {
    console.error("Claude analysis failed:", error)
    throw error
  }
}

/**
 * Test AI Gateway connection
 */

// Export alias for backward compatibility
export const analyzeWithGemini = analyzeWithGeminiFlash;
export async function testAIGateway(): Promise<{
  success: boolean
  models: string[]
  errors: string[]
}> {
  const results = {
    success: true,
    models: [] as string[],
    errors: [] as string[],
  }

  // Test image (1x1 white pixel)
  const testImage =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="

  const testPrompt: SkinAnalysisPrompt = {
    imageBase64: testImage,
    language: "en",
    analysisType: "quick",
  }

  // Test GPT-4o
  try {
    await analyzeWithGPT4o(testPrompt)
    results.models.push("gpt-4o")
  } catch (error) {
    results.success = false
    results.errors.push(`GPT-4o: ${error}`)
  }

  // Test Claude
  try {
    await analyzeWithClaude(testPrompt)
    results.models.push("claude-3.5-sonnet")
  } catch (error) {
    results.success = false
    results.errors.push(`Claude: ${error}`)
  }

  // Test Gemini
  try {
    await analyzeWithGemini(testPrompt)
    results.models.push("gemini-2.0-flash")
  } catch (error) {
    results.success = false
    results.errors.push(`Gemini: ${error}`)
  }

  return results
}
