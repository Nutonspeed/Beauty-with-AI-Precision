'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'



interface PerformanceMetrics {
  cache: {
    hitRate: number
    memoryUsage: number
    totalRequests: number
  }
  models: {
    [modelName: string]: {
      avgProcessingTime: number
      avgConfidence: number
      totalRequests: number
    }
  }
  queues: {
    [queueName: string]: {
      waiting: number
      active: number
      completed: number
      failed: number
    }
  }
}

export default function AIPerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/ai/optimized')
      const data = await response.json()
      setMetrics(data.performance)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center text-muted-foreground">
        Failed to load performance metrics
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Performance Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant={autoRefresh ? 'default' : 'secondary'}>
            Auto-refresh: {autoRefresh ? 'On' : 'Off'}
          </Badge>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Toggle Auto-refresh
          </button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
          <TabsTrigger value="models">Model Performance</TabsTrigger>
          <TabsTrigger value="queues">Queue Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(metrics.cache.hitRate * 100).toFixed(1)}%</div>
                <Progress value={metrics.cache.hitRate * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(metrics.cache.memoryUsage / 1024 / 1024).toFixed(1)} MB</div>
                <p className="text-xs text-muted-foreground">Redis memory</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.cache.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Queues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(metrics.queues).length}</div>
                <p className="text-xs text-muted-foreground">Processing queues</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cache Performance</CardTitle>
                <CardDescription>Real-time cache hit rate and memory usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Hit Rate</span>
                      <span>{(metrics.cache.hitRate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.cache.hitRate * 100} className="mt-1" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>{(metrics.cache.memoryUsage / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                    <Progress value={(metrics.cache.memoryUsage / (1024 * 1024 * 100)) * 100} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Statistics</CardTitle>
                <CardDescription>Detailed cache metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Requests:</span>
                    <span className="font-mono">{metrics.cache.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Hits:</span>
                    <span className="font-mono text-green-600">
                      {Math.floor(metrics.cache.totalRequests * metrics.cache.hitRate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Misses:</span>
                    <span className="font-mono text-red-600">
                      {Math.floor(metrics.cache.totalRequests * (1 - metrics.cache.hitRate)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(metrics.models).map(([modelName, modelMetrics]) => (
              <Card key={modelName}>
                <CardHeader>
                  <CardTitle className="text-lg">{modelName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Processing Time</span>
                        <span>{modelMetrics.avgProcessingTime.toFixed(0)}ms</span>
                      </div>
                      <Progress 
                        value={Math.min((modelMetrics.avgProcessingTime / 500) * 100, 100)} 
                        className="mt-1" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Confidence</span>
                        <span>{(modelMetrics.avgConfidence * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={modelMetrics.avgConfidence * 100} className="mt-1" />
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        Total Requests: {modelMetrics.totalRequests.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="queues" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(metrics.queues).map(([queueName, queueMetrics]) => (
              <Card key={queueName}>
                <CardHeader>
                  <CardTitle className="text-lg">{queueName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{queueMetrics.waiting}</div>
                        <div className="text-sm text-muted-foreground">Waiting</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{queueMetrics.active}</div>
                        <div className="text-sm text-muted-foreground">Active</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{queueMetrics.completed}</div>
                        <div className="text-sm text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">{queueMetrics.failed}</div>
                        <div className="text-sm text-muted-foreground">Failed</div>
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        Total Jobs: {(queueMetrics.waiting + queueMetrics.active + queueMetrics.completed + queueMetrics.failed).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
