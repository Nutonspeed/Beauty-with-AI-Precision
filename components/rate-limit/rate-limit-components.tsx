'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Shield,
  Zap,
  BarChart3,
  Activity
} from 'lucide-react'

// Rate limit status component
interface RateLimitStatusProps {
  limit: number
  remaining: number
  resetTime: number
  windowMs: number
}

export function RateLimitStatus({ limit, remaining, resetTime, windowMs }: RateLimitStatusProps) {
  const [timeUntilReset, setTimeUntilReset] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const timeLeft = Math.max(0, resetTime - now)
      setTimeUntilReset(timeLeft)
      
      // Calculate progress
      const used = limit - remaining
      setProgress((used / limit) * 100)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [limit, remaining, resetTime])

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const getStatusColor = () => {
    const percentage = (remaining / limit) * 100
    if (percentage > 50) return 'text-green-600'
    if (percentage > 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = () => {
    const percentage = (remaining / limit) * 100
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 20) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Rate Limit Status
          </CardTitle>
          <Badge variant={remaining > 0 ? 'default' : 'destructive'}>
            {remaining > 0 ? 'Active' : 'Limited'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>API Calls Used</span>
            <span className={getStatusColor()}>
              {limit - remaining}/{limit}
            </span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>Resets in</span>
          </div>
          <span className="font-mono">{formatTime(timeUntilReset)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center">
            <Activity className="w-4 h-4 mr-1" />
            <span>Window</span>
          </div>
          <span className="font-mono">{formatTime(windowMs)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Rate limit alert component
interface RateLimitAlertProps {
  error: {
    type: string
    message: string
    retryAfter?: number
    limit: number
    remaining: number
    resetTime: number
  }
  onRetry?: () => void
}

export function RateLimitAlert({ error, onRetry }: RateLimitAlertProps) {
  const [countdown, setCountdown] = useState(error.retryAfter || 0)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="space-y-2">
        <div className="font-medium text-orange-800">
          {error.message}
        </div>
        
        <div className="text-sm text-orange-700">
          <div>• Limit: {error.limit} requests per window</div>
          <div>• Remaining: {error.remaining} requests</div>
          {error.retryAfter && (
            <div>• Retry after: {formatCountdown(countdown)}</div>
          )}
        </div>

        {onRetry && countdown === 0 && (
          <Button 
            onClick={onRetry} 
            size="sm" 
            variant="outline"
            className="mt-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Now
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

// Rate limit analytics component
export function RateLimitAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalRequests: 0,
    blockedRequests: 0,
    topViolators: [] as Array<{ ip: string; count: number }>,
    endpoints: [] as Array<{ endpoint: string; violations: number }>
  })

  useEffect(() => {
    // Fetch rate limit analytics
    fetchRateLimitAnalytics()
  }, [])

  const fetchRateLimitAnalytics = async () => {
    try {
      const response = await fetch('/api/rate-limit/analytics')
      const data = await response.json()
      
      if (data.success) {
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Failed to fetch rate limit analytics:', error)
    }
  }

  const blockRate = analytics.totalRequests > 0 
    ? (analytics.blockedRequests / analytics.totalRequests) * 100 
    : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Requests</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.blockedRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{blockRate.toFixed(1)}% block rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{(100 - blockRate).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Requests allowed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Violators</CardTitle>
            <CardDescription>IPs with most rate limit violations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topViolators.slice(0, 5).map((violator, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-mono">{violator.ip}</span>
                  <Badge variant="destructive">{violator.count}</Badge>
                </div>
              ))}
              {analytics.topViolators.length === 0 && (
                <div className="text-sm text-muted-foreground">No violations in the last 24 hours</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoint Violations</CardTitle>
            <CardDescription>API endpoints with most violations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.endpoints.slice(0, 5).map((endpoint, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm font-mono">{endpoint.endpoint}</span>
                  <Badge variant="secondary">{endpoint.violations}</Badge>
                </div>
              ))}
              {analytics.endpoints.length === 0 && (
                <div className="text-sm text-muted-foreground">No endpoint violations</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Rate limit configuration component
export function RateLimitConfig() {
  const [configs, setConfigs] = useState({
    api: { limit: 60, window: 60000 },
    auth: { limit: 5, window: 900000 },
    upload: { limit: 10, window: 3600000 },
    ai: { limit: 20, window: 60000 }
  })

  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/rate-limit/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs })
      })
      
      if (response.ok) {
        // Show success message
      }
    } catch (error) {
      console.error('Failed to save rate limit config:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Rate Limit Configuration
        </CardTitle>
        <CardDescription>
          Configure rate limiting for different API categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(configs).map(([category, config]) => (
          <div key={category} className="space-y-2">
            <h4 className="font-medium capitalize">{category}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Request Limit</label>
                <input
                  type="number"
                  value={config.limit}
                  onChange={(e) => setConfigs(prev => ({
                    ...prev,
                    [category]: { ...prev[category as keyof typeof prev], limit: parseInt(e.target.value) }
                  }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Window (seconds)</label>
                <input
                  type="number"
                  value={config.window / 1000}
                  onChange={(e) => setConfigs(prev => ({
                    ...prev,
                    [category]: { ...prev[category as keyof typeof prev], window: parseInt(e.target.value) * 1000 }
                  }))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        ))}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
