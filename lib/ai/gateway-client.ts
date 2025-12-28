/**
 * Vercel AI Gateway Client
 *
 * Multi-model AI analysis using Vercel AI Gateway
 * Supports GPT-4o, Claude 3.5 Sonnet, and Gemini 2.0 Flash
 */

import { generateText } from "ai"

// AI Gateway configuration
// const AI_GATEWAY_KEY =
//   process.env.VERCEL_AI_GATEWAY_KEY || "vck_21OTwoeeh20LtPP0R2aNrWJcF3XAE2H3hAzQuS9tTpdvEsXinR3l3m9I"

export interface SkinAnalysisPrompt {
  imageBase64: string
  language: "en" | "th"
  analysisType: "quick" | "detailed" | "medical"
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
}

/**
 * Analyze skin with GPT-4o (Primary Model)
 */
export async function analyzeWithGPT4o(prompt: SkinAnalysisPrompt): Promise<AIModelResponse> {
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
 * Analyze skin with Gemini 2.0 Flash (Speed Model)
 */
export async function analyzeWithGemini(prompt: SkinAnalysisPrompt): Promise<AIModelResponse> {
  const startTime = performance.now()

  try {
    const systemPrompt = `Quick skin analysis AI. Provide fast, accurate assessment of facial skin.

Rate 8 metrics (0-100): Wrinkles, Spots, Pores, Texture, Evenness, Firmness, Radiance, Hydration.

Return JSON with concerns, scores, recommendations, overall score.`

    const { text } = await generateText({
      model: "google/gemini-2.5-flash-image",
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
              text: `Quick skin analysis. Language: ${prompt.language}`,
            },
            {
              type: "image",
              image: prompt.imageBase64,
            },
          ],
        },
      ],
      temperature: 0.4,
    })

    const processingTime = performance.now() - startTime

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from Gemini response")
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      model: "gemini-2.0-flash",
      concerns: parsed.concerns || [],
      visiaScores: parsed.visiaScores || {},
      recommendations: parsed.recommendations || [],
      overallScore: parsed.overallScore || 0,
      processingTime,
      rawResponse: text,
    }
  } catch (error) {
    console.error("Gemini analysis failed:", error)
    throw error
  }
}

async function probeModelConnectivity(model: string): Promise<void> {
  const { text } = await generateText({
    model,
    messages: [
      {
        role: "user",
        content: "Reply with exactly: OK",
      },
    ],
    temperature: 0,
  })

  if (typeof text !== "string" || text.trim().toUpperCase() !== "OK") {
    throw new Error(`Unexpected probe response: ${String(text).slice(0, 200)}`)
  }
}

/**
 * Test AI Gateway connection
 */
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

  // Test GPT-4o
  try {
    await probeModelConnectivity("openai/gpt-4o")
    results.models.push("gpt-4o")
  } catch (error) {
    results.success = false
    results.errors.push(`GPT-4o: ${error}`)
  }

  // Test Claude
  try {
    await probeModelConnectivity("anthropic/claude-3-5-sonnet-20241022")
    results.models.push("claude-3.5-sonnet")
  } catch (error) {
    results.success = false
    results.errors.push(`Claude: ${error}`)
  }

  // Test Gemini
  try {
    await probeModelConnectivity("google/gemini-2.5-flash-image")
    results.models.push("gemini-2.0-flash")
  } catch (error) {
    results.success = false
    results.errors.push(`Gemini: ${error}`)
  }

  return results
}
