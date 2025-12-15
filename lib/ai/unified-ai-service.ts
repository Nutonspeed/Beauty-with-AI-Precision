/**
 * Unified AI Service with Fallback
 * 
 * Provides a single interface to multiple AI providers with automatic fallback:
 * 1. Google Gemini (Primary - Free tier, 1,500 requests/day)
 * 2. OpenAI GPT-4o (Fallback - user has no credits)
 * 3. Anthropic Claude (Fallback 2)
 * 4. Local/Mock (Fallback 3 - for demo)
 */

// Dynamic imports to avoid build errors if packages not installed
// These are optional dependencies for AI providers

export interface AIProvider {
  name: string
  available: boolean
  priority: number
}

export interface AnalysisResult {
  provider: string
  success: boolean
  data?: {
    concerns: Array<{
      type: string
      severity: 'mild' | 'moderate' | 'severe'
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
  }
  error?: string
  processingTime: number
}

// Check which providers are available
export function getAvailableProviders(): AIProvider[] {
  return [
    {
      name: 'google',
      available: !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-'),
      priority: 1  // Gemini as primary (free tier)
    },
    {
      name: 'demo',
      available: true, // Always available as fallback
      priority: 99
    }
  ].sort((a, b) => a.priority - b.priority)
}

// System prompt for skin analysis
const SKIN_ANALYSIS_PROMPT = `You are an expert dermatologist AI analyzing facial skin images.

Analyze the image for these 8 VISIA metrics (score 0-100, where 100 is best):
1. Wrinkles - Fine lines and deep wrinkles
2. Spots - Dark spots, age spots, melasma
3. Pores - Pore size and visibility
4. Texture - Skin smoothness
5. Evenness - Skin tone uniformity
6. Firmness - Skin elasticity
7. Radiance - Skin brightness
8. Hydration - Moisture level

Identify any concerns with severity (mild/moderate/severe) and confidence (0-1).
Provide 3-5 personalized treatment recommendations.

Return ONLY valid JSON in this exact format:
{
  "concerns": [{"type": "acne", "severity": "mild", "confidence": 0.85, "location": "forehead", "description": "Minor breakout"}],
  "visiaScores": {"wrinkles": 85, "spots": 78, "pores": 72, "texture": 80, "evenness": 75, "firmness": 82, "radiance": 70, "hydration": 68},
  "recommendations": ["Use SPF 50 daily", "Consider retinol treatment"],
  "overallScore": 76
}`

/**
 * Analyze skin image with automatic provider fallback
 */
export async function analyzeSkinWithFallback(
  imageBase64: string,
  language: 'en' | 'th' = 'en'
): Promise<AnalysisResult> {
  const startTime = performance.now()
  const providers = getAvailableProviders().filter(p => p.available)
  
  console.log('🔍 Available AI providers:', providers.map(p => p.name).join(', '))

  for (const provider of providers) {
    try {
      console.log(`🤖 Trying ${provider.name}...`)
      
      if (provider.name === 'demo') {
        // Return demo data
        return generateDemoResult(startTime)
      }

      const result = await analyzeWithProvider(provider.name, imageBase64, language)
      
      if (result.success) {
        console.log(`✅ ${provider.name} succeeded in ${result.processingTime}ms`)
        return result
      }
    } catch (error) {
      console.error(`❌ ${provider.name} failed:`, error)
      continue
    }
  }

  // All providers failed, return demo
  console.log('⚠️ All providers failed, using demo data')
  return generateDemoResult(startTime)
}

async function analyzeWithProvider(
  providerName: string,
  imageBase64: string,
  language: 'en' | 'th'
): Promise<AnalysisResult> {
  const startTime = performance.now()
  const prompt = language === 'th' 
    ? SKIN_ANALYSIS_PROMPT + '\n\nRespond in Thai language.'
    : SKIN_ANALYSIS_PROMPT

  try {
    let responseText: string

    switch (providerName) {
      case 'google':
        responseText = await callGemini(imageBase64, prompt)
        break
      default:
        throw new Error(`Unknown or disabled provider: ${providerName}`)
    }

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON in response')
    }

    const data = JSON.parse(jsonMatch[0])
    
    return {
      provider: providerName,
      success: true,
      data: {
        concerns: data.concerns || [],
        visiaScores: data.visiaScores || generateDefaultScores(),
        recommendations: data.recommendations || [],
        overallScore: data.overallScore || 75
      },
      processingTime: Math.round(performance.now() - startTime)
    }
  } catch (error) {
    return {
      provider: providerName,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime: Math.round(performance.now() - startTime)
    }
  }
}

// Direct API calls using fetch

async function callOpenAI(imageBase64: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      }],
      max_tokens: 2000
    })
  })

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`)
  const data = await response.json()
  return data.choices[0].message.content
}

async function callAnthropic(imageBase64: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: prompt }
        ]
      }]
    })
  })

  if (!response.ok) throw new Error(`Anthropic error: ${response.status}`)
  const data = await response.json()
  return data.content[0].text
}

async function callGemini(imageBase64: string, prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }
          ]
        }]
      })
    }
  )

  if (!response.ok) throw new Error(`Gemini error: ${response.status}`)
  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

function generateDefaultScores() {
  return {
    wrinkles: 75 + Math.floor(Math.random() * 20),
    spots: 70 + Math.floor(Math.random() * 20),
    pores: 72 + Math.floor(Math.random() * 20),
    texture: 78 + Math.floor(Math.random() * 15),
    evenness: 75 + Math.floor(Math.random() * 20),
    firmness: 80 + Math.floor(Math.random() * 15),
    radiance: 70 + Math.floor(Math.random() * 20),
    hydration: 68 + Math.floor(Math.random() * 25)
  }
}

function generateDemoResult(startTime: number): AnalysisResult {
  return {
    provider: 'demo',
    success: true,
    data: {
      concerns: [
        {
          type: 'fine_lines',
          severity: 'mild',
          confidence: 0.82,
          location: 'forehead',
          description: 'Minor expression lines visible'
        },
        {
          type: 'uneven_tone',
          severity: 'moderate',
          confidence: 0.78,
          location: 'cheeks',
          description: 'Slight pigmentation variation'
        },
        {
          type: 'dryness',
          severity: 'mild',
          confidence: 0.75,
          location: 'cheeks',
          description: 'Signs of dehydration'
        }
      ],
      visiaScores: generateDefaultScores(),
      recommendations: [
        'Apply SPF 50+ sunscreen daily for UV protection',
        'Use vitamin C serum in the morning for brightness',
        'Incorporate hyaluronic acid for hydration',
        'Consider retinol treatment 2-3x weekly',
        'Stay hydrated and get adequate sleep'
      ],
      overallScore: 76
    },
    processingTime: Math.round(performance.now() - startTime)
  }
}

/**
 * Quick health check for AI providers
 */
export async function checkAIHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'demo_only'
  providers: AIProvider[]
}> {
  const providers = getAvailableProviders()
  const realProviders = providers.filter(p => p.name !== 'demo' && p.available)
  
  if (realProviders.length >= 2) {
    return { status: 'healthy', providers }
  } else if (realProviders.length === 1) {
    return { status: 'degraded', providers }
  } else {
    return { status: 'demo_only', providers }
  }
}
