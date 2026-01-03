/**
 * AI Service Configuration
 * Centralized configuration for AI services
 */

export function getAIServiceUrl(): string {
  // Check if we're in development or production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Return appropriate AI service URL
  if (isDevelopment) {
    return process.env.AI_SERVICE_URL || 'http://localhost:8000'
  }
  
  return process.env.AI_SERVICE_URL || 'https://ai-service.cliniciq.app'
}

export function getAIServiceConfig() {
  return {
    url: getAIServiceUrl(),
    timeout: 30000, // 30 seconds
    maxRetries: 3,
    enabled: process.env.NEXT_PUBLIC_ENABLE_AI === 'true',
  }
}

export const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-vision-preview',
    enabled: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-opus-20240229',
    enabled: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'placeholder',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-pro-vision',
    enabled: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder',
  },
} as const

export function isAIEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_AI === 'true'
}

export function getAvailableAIProviders(): string[] {
  const providers: string[] = []
  
  if (AI_CONFIG.openai.enabled) providers.push('openai')
  if (AI_CONFIG.anthropic.enabled) providers.push('anthropic')
  if (AI_CONFIG.gemini.enabled) providers.push('gemini')
  
  return providers
}

// API Key getters
export function getOpenAIApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder' 
    ? process.env.OPENAI_API_KEY 
    : undefined
}

export function getAnthropicApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'placeholder'
    ? process.env.ANTHROPIC_API_KEY
    : undefined
}

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'placeholder'
    ? process.env.GEMINI_API_KEY
    : undefined
}

export function getDeepFaceApiUrl(): string {
  return process.env.DEEPFACE_API_URL && process.env.DEEPFACE_API_URL !== 'placeholder'
    ? process.env.DEEPFACE_API_URL
    : 'http://localhost:8000'
}

export function getGoogleCredentialsConfig(): any {
  try {
    const creds = process.env.GOOGLE_CREDENTIALS_JSON
    if (!creds || creds === 'placeholder') return null
    return JSON.parse(creds)
  } catch {
    return null
  }
}

// API Key checkers
export function hasOpenAIApiKey(): boolean {
  return AI_CONFIG.openai.enabled
}

export function hasAnthropicApiKey(): boolean {
  return AI_CONFIG.anthropic.enabled
}

export function hasGeminiApiKey(): boolean {
  return AI_CONFIG.gemini.enabled
}

export function hasVercelAIGatewayKey(): boolean {
  return !!process.env.VERCEL_AI_GATEWAY_KEY && process.env.VERCEL_AI_GATEWAY_KEY !== 'placeholder'
}

export function hasDeepFaceApiUrl(): boolean {
  return !!process.env.DEEPFACE_API_URL && process.env.DEEPFACE_API_URL !== 'placeholder'
}
