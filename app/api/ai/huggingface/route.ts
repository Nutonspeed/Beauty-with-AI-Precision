/**
 * Hugging Face API Proxy
 * Server-side proxy to hide API token from client-side code
 * Supports: Feature Extraction, Segmentation, Classification
 */

import { NextRequest, NextResponse } from 'next/server'

// Hugging Face API configuration
const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_TOKEN
const BASE_URL = 'https://api-inference.huggingface.co/models'

// Supported models
const MODELS = {
  featureExtraction: 'facebook/dinov2-base',
  segmentation: 'facebook/detr-resnet-50-panoptic',
  classification: 'google/vit-base-patch16-224',
} as const

// Request body type
interface HuggingFaceRequest {
  task: 'featureExtraction' | 'segmentation' | 'classification'
  imageData: string // base64 encoded image
}

/**
 * POST /api/ai/huggingface
 * Proxy request to Hugging Face Inference API
 */
export async function POST(request: NextRequest) {
  try {
    // Validate token
    if (!HUGGINGFACE_TOKEN) {
      console.error('❌ HUGGINGFACE_TOKEN not configured')
      return NextResponse.json(
        { 
          error: 'Server configuration error',
          message: 'HUGGINGFACE_TOKEN not found in environment variables'
        },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json() as HuggingFaceRequest
    const { task, imageData } = body

    // Validate task
    if (!task || !MODELS[task]) {
      return NextResponse.json(
        { 
          error: 'Invalid task',
          message: `Task must be one of: ${Object.keys(MODELS).join(', ')}`
        },
        { status: 400 }
      )
    }

    // Validate image data
    if (!imageData) {
      return NextResponse.json(
        { error: 'Missing image data' },
        { status: 400 }
      )
    }

    // Get model for task
    const model = MODELS[task]
    const url = `${BASE_URL}/${model}`

    console.log(`🔄 Proxying request to Hugging Face: ${task} (${model})`)

    // Make request to Hugging Face
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: imageData,
      }),
    })

    // Handle errors
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Hugging Face API error (${response.status}):`, errorText)
      
      // Check if model is loading
      if (response.status === 503) {
        return NextResponse.json(
          {
            error: 'Model loading',
            message: 'Model is currently loading. Please retry in a few seconds.',
            retryAfter: 10,
          },
          { status: 503 }
        )
      }

      return NextResponse.json(
        {
          error: 'Hugging Face API error',
          message: errorText,
          status: response.status,
        },
        { status: response.status }
      )
    }

    // Parse response
    const result = await response.json()

    console.log(`✅ Hugging Face request successful: ${task}`)

    // Return result
    return NextResponse.json({
      success: true,
      task,
      model,
      result,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ Hugging Face proxy error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/huggingface
 * Health check endpoint
 */
export async function GET() {
  const isConfigured = Boolean(HUGGINGFACE_TOKEN)
  
  return NextResponse.json({
    ok: isConfigured,
    configured: isConfigured,
    supportedTasks: Object.keys(MODELS),
    models: MODELS,
    note: 'Use POST to make inference requests',
    timestamp: new Date().toISOString(),
  })
}
