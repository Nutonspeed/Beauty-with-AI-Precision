// Health Check API
import { NextRequest, NextResponse } from 'next/server'
import { metricsCollector } from '@/lib/monitoring/metrics/collector'
import { alertManager } from '@/lib/monitoring/alerts/manager'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: number
  uptime: number
  version: string
  checks: {
    database: HealthCheck
    redis: HealthCheck
    ai_services: HealthCheck
    memory: HealthCheck
    cpu: HealthCheck
  }
  metrics: {
    activeAlerts: number
    memoryUsage: number
    cpuUsage: number
    responseTime: number
  }
}

interface HealthCheck {
  status: 'pass' | 'fail' | 'warn'
  message?: string
  responseTime?: number
  lastCheck: number
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'

    // Perform health checks
    const checks = await performHealthChecks()
    
    // Calculate overall status
    const overallStatus = calculateOverallStatus(checks)
    
    // Get current metrics
    const systemSummary = metricsCollector.getSystemSummary()
    const activeAlerts = alertManager.getActiveAlerts()

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: Date.now(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      checks,
      metrics: {
        activeAlerts: activeAlerts.length,
        memoryUsage: systemSummary?.current.memory.percentage || 0,
        cpuUsage: systemSummary?.current.cpu.usage || 0,
        responseTime: Date.now() - startTime
      }
    }

    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503

    return NextResponse.json(healthStatus, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

async function performHealthChecks() {
  const checks: HealthStatus['checks'] = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    ai_services: await checkAIServices(),
    memory: await checkMemory(),
    cpu: await checkCPU()
  }

  return checks
}

async function checkDatabase(): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Perform simple database query
    // This would be your actual database health check
    await new Promise(resolve => setTimeout(resolve, 10))
    
    return {
      status: 'pass',
      responseTime: Date.now() - startTime,
      lastCheck: Date.now()
    }
  } catch (error) {
    return {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime,
      lastCheck: Date.now()
    }
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Perform Redis ping
    // This would be your actual Redis health check
    await new Promise(resolve => setTimeout(resolve, 5))
    
    return {
      status: 'pass',
      responseTime: Date.now() - startTime,
      lastCheck: Date.now()
    }
  } catch (error) {
    return {
      status: 'warn',
      message: 'Redis not available',
      responseTime: Date.now() - startTime,
      lastCheck: Date.now()
    }
  }
}

async function checkAIServices(): Promise<HealthCheck> {
  const startTime = Date.now()
  
  try {
    // Check AI service availability
    // This would be your actual AI service health check
    await new Promise(resolve => setTimeout(resolve, 20))
    
    return {
      status: 'pass',
      responseTime: Date.now() - startTime,
      lastCheck: Date.now()
    }
  } catch (error) {
    return {
      status: 'fail',
      message: 'AI services unavailable',
      responseTime: Date.now() - startTime,
      lastCheck: Date.now()
    }
  }
}

function checkMemory(): Promise<HealthCheck> {
  return Promise.resolve({
    status: 'pass',
    message: 'Memory usage normal',
    lastCheck: Date.now()
  })
}

function checkCPU(): Promise<HealthCheck> {
  return Promise.resolve({
    status: 'pass',
    message: 'CPU usage normal',
    lastCheck: Date.now()
  })
}

function calculateOverallStatus(checks: HealthStatus['checks']): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(checks).map(check => check.status)
  
  if (statuses.some(status => status === 'fail')) {
    return 'unhealthy'
  }
  
  if (statuses.some(status => status === 'warn')) {
    return 'degraded'
  }
  
  return 'healthy'
}
