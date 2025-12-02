import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

interface ServiceStatus {
  name: string
  status: 'operational' | 'degraded' | 'down' | 'unknown'
  latency?: number
  details?: string
}

interface SystemStatus {
  overall: 'operational' | 'degraded' | 'down'
  timestamp: string
  version: string
  uptime: number
  services: ServiceStatus[]
  metrics: {
    database: {
      connected: boolean
      tableCount?: number
      latency?: number
    }
    auth: {
      configured: boolean
      provider: string
    }
    ai: {
      geminiConfigured: boolean
      huggingfaceConfigured: boolean
      openaiConfigured: boolean
    }
    email: {
      configured: boolean
      provider: string
    }
    storage: {
      configured: boolean
    }
  }
}

export async function GET() {
  const startTime = Date.now()
  const services: ServiceStatus[] = []
  
  // 1. Check Database
  let dbConnected = false
  let dbLatency = 0
  let tableCount = 0
  
  try {
    const dbStart = Date.now()
    const supabase = createServiceClient()
    
    // Check connection
    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
    
    dbLatency = Date.now() - dbStart
    
    if (!error) {
      dbConnected = true
      tableCount = count || 0
      
      services.push({
        name: 'PostgreSQL Database',
        status: 'operational',
        latency: dbLatency,
        details: `Connected, ${tableCount} users`
      })
    } else {
      services.push({
        name: 'PostgreSQL Database',
        status: 'down',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } catch (error) {
    services.push({
      name: 'PostgreSQL Database',
      status: 'down',
      details: error instanceof Error ? error.message : 'Connection failed'
    })
  }

  // 2. Check Auth Configuration
  const authConfigured = !!(
    process.env.NEXTAUTH_SECRET && 
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )
  
  services.push({
    name: 'Authentication (Supabase Auth)',
    status: authConfigured ? 'operational' : 'degraded',
    details: authConfigured ? 'Configured' : 'Missing configuration'
  })

  // 3. Check AI Services
  const geminiConfigured = !!process.env.GEMINI_API_KEY
  const huggingfaceConfigured = !!process.env.HUGGINGFACE_TOKEN
  const openaiConfigured = process.env.OPENAI_API_KEY !== 'your_real_openai_key_here'
  
  const aiOperational = geminiConfigured || huggingfaceConfigured
  services.push({
    name: 'AI Services',
    status: aiOperational ? 'operational' : 'degraded',
    details: `Gemini: ${geminiConfigured ? '✓' : '✗'}, HuggingFace: ${huggingfaceConfigured ? '✓' : '✗'}, OpenAI: ${openaiConfigured ? '✓' : '✗'}`
  })

  // 4. Check Email Service
  const emailConfigured = !!process.env.RESEND_API_KEY
  services.push({
    name: 'Email Service (Resend)',
    status: emailConfigured ? 'operational' : 'degraded',
    details: emailConfigured ? 'Configured' : 'Not configured'
  })

  // 5. Check Storage
  const storageConfigured = !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  services.push({
    name: 'File Storage (Supabase Storage)',
    status: storageConfigured ? 'operational' : 'degraded',
    details: storageConfigured ? 'Configured' : 'Not configured'
  })

  // 6. Check Real-time
  services.push({
    name: 'Real-time (Supabase Realtime)',
    status: dbConnected ? 'operational' : 'down',
    details: dbConnected ? 'WebSocket ready' : 'Requires database connection'
  })

  // Calculate overall status
  const downServices = services.filter(s => s.status === 'down').length
  const degradedServices = services.filter(s => s.status === 'degraded').length
  
  let overall: 'operational' | 'degraded' | 'down' = 'operational'
  if (downServices > 0) {
    overall = downServices >= 2 ? 'down' : 'degraded'
  } else if (degradedServices > 0) {
    overall = 'degraded'
  }

  const response: SystemStatus = {
    overall,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    services,
    metrics: {
      database: {
        connected: dbConnected,
        tableCount,
        latency: dbLatency
      },
      auth: {
        configured: authConfigured,
        provider: 'Supabase Auth'
      },
      ai: {
        geminiConfigured,
        huggingfaceConfigured,
        openaiConfigured
      },
      email: {
        configured: emailConfigured,
        provider: 'Resend'
      },
      storage: {
        configured: storageConfigured
      }
    }
  }

  const statusCode = overall === 'down' ? 503 : overall === 'degraded' ? 200 : 200
  
  return NextResponse.json(response, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}
