/**
 * Mock AI Response Helper for E2E Tests
 * 
 * Provides consistent mock responses for testing without real AI API calls
 */

export const mockAnalysisResult = {
  success: true,
  provider: 'mock',
  data: {
    concerns: [
      {
        type: 'fine_lines',
        severity: 'mild' as const,
        confidence: 0.82,
        location: 'forehead',
        description: 'Minor expression lines visible'
      },
      {
        type: 'uneven_tone',
        severity: 'moderate' as const,
        confidence: 0.78,
        location: 'cheeks',
        description: 'Slight pigmentation variation'
      }
    ],
    visiaScores: {
      wrinkles: 82,
      spots: 75,
      pores: 78,
      texture: 85,
      evenness: 72,
      firmness: 88,
      radiance: 76,
      hydration: 70
    },
    recommendations: [
      'Apply SPF 50+ sunscreen daily',
      'Use vitamin C serum in the morning',
      'Incorporate hyaluronic acid for hydration'
    ],
    overallScore: 78
  },
  processingTime: 1500
}

export const mockFaceDetection = {
  detected: true,
  landmarks: 478,
  confidence: 0.95,
  boundingBox: {
    x: 100,
    y: 80,
    width: 200,
    height: 250
  },
  angles: {
    pitch: 5,
    yaw: -3,
    roll: 1
  }
}

export const mockLightingQuality = {
  overallScore: 85,
  metrics: {
    brightness: 82,
    contrast: 78,
    evenness: 88,
    shadows: 90
  },
  suggestions: []
}

/**
 * Create a mock API response for Playwright route interception
 */
export function createMockApiHandler() {
  return {
    '/api/analysis': () => ({
      status: 200,
      body: JSON.stringify(mockAnalysisResult)
    }),
    '/api/face-detection': () => ({
      status: 200,
      body: JSON.stringify(mockFaceDetection)
    }),
    '/api/lighting-quality': () => ({
      status: 200,
      body: JSON.stringify(mockLightingQuality)
    })
  }
}

/**
 * Setup route mocking for Playwright page
 */
export async function setupMockRoutes(page: import('@playwright/test').Page) {
  const handlers = createMockApiHandler()
  
  for (const [route, handler] of Object.entries(handlers)) {
    await page.route(`**${route}*`, async (interceptedRoute) => {
      const response = handler()
      await interceptedRoute.fulfill({
        status: response.status,
        contentType: 'application/json',
        body: response.body
      })
    })
  }
}

/**
 * Generate random but realistic scores for testing
 */
export function generateRandomScores() {
  return {
    wrinkles: 70 + Math.floor(Math.random() * 25),
    spots: 65 + Math.floor(Math.random() * 30),
    pores: 70 + Math.floor(Math.random() * 25),
    texture: 75 + Math.floor(Math.random() * 20),
    evenness: 70 + Math.floor(Math.random() * 25),
    firmness: 78 + Math.floor(Math.random() * 18),
    radiance: 68 + Math.floor(Math.random() * 27),
    hydration: 65 + Math.floor(Math.random() * 30)
  }
}
