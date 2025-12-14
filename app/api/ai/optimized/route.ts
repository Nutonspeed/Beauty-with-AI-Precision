import { NextRequest, NextResponse } from 'next/server'
import { aiOptimizer } from '@/lib/ai/optimization/optimizer'
import { aiCache } from '@/lib/ai/cache/manager'
import { aiQueue } from '@/lib/ai/queue/manager'
import { createServerClient } from '@/lib/supabase/server'
import { withPublicAccess } from '@/lib/auth/middleware'

// Optimized skin analysis endpoint
export const POST = withPublicAccess(async (request: NextRequest) => {
  try {
    // Verify authentication using Supabase
    const supabase = await createServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const useQueue = formData.get('useQueue') === 'true'
    const priority = formData.get('priority') as string || 'normal'

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64 for processing
    const imageBuffer = await imageFile.arrayBuffer()
    const imageBase64 = Buffer.from(imageBuffer).toString('base64')

    const requestData = {
      image: imageBase64,
      userId: session.user.id,
      options: {
        quantization: true,
        skipCache: false
      }
    }

    let result

    if (useQueue) {
      // Process through queue for better load management
      const job = await aiQueue.addJob('skin-analysis', requestData, {
        priority: priority === 'high' ? 10 : 5,
        delay: 0
      })
      
      result = {
        jobId: job.id,
        queued: true,
        estimatedTime: '30-60 seconds'
      }
    } else {
      // Process immediately with optimization
      result = await aiOptimizer.optimizeInference('skin-analysis', requestData)
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Optimized AI analysis error:', error)
    return NextResponse.json({ 
      error: 'Analysis failed. Please try again.' 
    }, { status: 500 })
  }
}, { rateLimitCategory: 'ai' })

// Batch analysis endpoint
export const PATCH = withPublicAccess(async (request: NextRequest) => {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { images, options } = await request.json()

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    if (images.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 images allowed' }, { status: 400 })
    }

    // Process batch through queue
    const job = await aiQueue.addBatchJob('skin-analysis', images.map(image => ({
      image,
      userId: session.user.id,
      options
    })))

    return NextResponse.json({
      success: true,
      jobId: job.id,
      batchId: job.id,
      imageCount: images.length,
      estimatedTime: `${Math.ceil(images.length * 2)}-${Math.ceil(images.length * 4)} minutes`
    })

  } catch (error) {
    console.error('Batch analysis error:', error)
    return NextResponse.json({ 
      error: 'Batch analysis failed' 
    }, { status: 500 })
  }
}, { rateLimitCategory: 'ai' })

// Get job status endpoint
export const GET = withPublicAccess(async (request: NextRequest) => {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      // Return system performance metrics
      const cacheStats = await aiCache.getStats()
      const queueStats = await aiQueue.getQueueStats()
      
      return NextResponse.json({
        performance: {
          cache: cacheStats,
          queues: queueStats,
          timestamp: new Date().toISOString()
        }
      })
    }

    // Get specific job status
    const job = { 
      id: jobId, 
      status: 'completed', 
      progress: 100,
      result: null,
      error: null,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    } // Mock response
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      processedAt: job.processedAt
    })

  } catch (error) {
    console.error('Job status error:', error)
    return NextResponse.json({ 
      error: 'Failed to get job status' 
    }, { status: 500 })
  }
}, { rateLimitCategory: 'ai' })
