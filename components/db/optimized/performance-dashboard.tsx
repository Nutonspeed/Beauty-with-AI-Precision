'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'



interface DatabaseMetrics {
  connections: {
    active: number
    idle: number
    total: number
    maxConnections: number
  }
  performance: {
    avgQueryTime: number
    slowQueries: number
    cacheHitRate: number
    throughput: number
  }
  tables: {
    [tableName: string]: {
      size: string
      rows: number
      indexes: number
    }
  }
  queries: {
    slowQueries: Array<{
      query: string
      executionTime: number
      frequency: number
    }>
    topQueries: Array<{
      query: string
      calls: number
      totalTime: number
    }>
  }
}

export default function DatabasePerformanceDashboard() {
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000)

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/database/performance')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Failed to fetch database metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const handleOptimizeDatabase = async () => {
    try {
      const response = await fetch('/api/database/optimize', { method: 'POST' })
      const result = await response.json()
      
      if (result.success) {
        alert('Database optimization completed successfully!')
        fetchMetrics()
      } else {
        alert('Optimization failed: ' + result.error)
      }
    } catch (error) {
      alert('Optimization failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

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
        Failed to load database performance metrics
      </div>
    )
  }

  const connectionUtilization = (metrics.connections.total / metrics.connections.maxConnections) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Database Performance Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Badge variant={connectionUtilization > 80 ? 'destructive' : 'default'}>
            Connection Usage: {connectionUtilization.toFixed(1)}%
          </Badge>
          <Button onClick={handleOptimizeDatabase} variant="outline">
            Optimize Database
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.connections.active}</div>
            <Progress value={connectionUtilization} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              of {metrics.connections.maxConnections} max
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Query Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.performance.avgQueryTime.toFixed(1)}ms</div>
            <p className="text-xs text-muted-foreground">
              {metrics.performance.slowQueries} slow queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.performance.cacheHitRate * 100).toFixed(1)}%</div>
            <Progress value={metrics.performance.cacheHitRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.performance.throughput}</div>
            <p className="text-xs text-muted-foreground">queries/second</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="queries">Query Analysis</TabsTrigger>
          <TabsTrigger value="tables">Table Statistics</TabsTrigger>
          <TabsTrigger value="connections">Connection Pool</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Connection Pool Status</CardTitle>
                <CardDescription>Real-time connection utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Active Connections</span>
                      <span>{metrics.connections.active}</span>
                    </div>
                    <Progress 
                      value={(metrics.connections.active / metrics.connections.maxConnections) * 100} 
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Idle Connections</span>
                      <span>{metrics.connections.idle}</span>
                    </div>
                    <Progress 
                      value={(metrics.connections.idle / metrics.connections.maxConnections) * 100} 
                      className="mt-1" 
                    />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      Total Connections: {metrics.connections.total} / {metrics.connections.maxConnections}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Query performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Average Query Time:</span>
                    <span className="font-mono">{metrics.performance.avgQueryTime.toFixed(1)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Slow Queries:</span>
                    <span className="font-mono text-red-600">{metrics.performance.slowQueries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Hit Rate:</span>
                    <span className="font-mono text-green-600">
                      {(metrics.performance.cacheHitRate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Throughput:</span>
                    <span className="font-mono">{metrics.performance.throughput} q/s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Slow Queries</CardTitle>
                <CardDescription>Queries requiring optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.queries.slowQueries.slice(0, 5).map((query, index) => (
                    <div key={index} className="p-2 border rounded">
                      <div className="flex justify-between text-sm">
                        <span className="font-mono truncate flex-1">{query.query}</span>
                        <span className="text-red-600 ml-2">{query.executionTime}ms</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Frequency: {query.frequency} calls
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Queries by Usage</CardTitle>
                <CardDescription>Most frequently executed queries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.queries.topQueries.slice(0, 5).map((query, index) => (
                    <div key={index} className="p-2 border rounded">
                      <div className="flex justify-between text-sm">
                        <span className="font-mono truncate flex-1">{query.query}</span>
                        <span className="text-blue-600 ml-2">{query.calls}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total time: {query.totalTime.toFixed(1)}ms
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tables" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(metrics.tables).map(([tableName, tableStats]) => (
              <Card key={tableName}>
                <CardHeader>
                  <CardTitle className="text-lg">{tableName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Size:</span>
                      <span className="font-mono">{tableStats.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rows:</span>
                      <span className="font-mono">{tableStats.rows.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Indexes:</span>
                      <span className="font-mono">{tableStats.indexes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection Pool Details</CardTitle>
              <CardDescription>Detailed connection pool metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.connections.active}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{metrics.connections.idle}</div>
                  <div className="text-sm text-muted-foreground">Idle</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{metrics.connections.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{metrics.connections.maxConnections}</div>
                  <div className="text-sm text-muted-foreground">Max</div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Connection Utilization</span>
                  <span>{connectionUtilization.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={connectionUtilization} 
                  className={connectionUtilization > 80 ? 'bg-red-100' : ''}
                />
                {connectionUtilization > 80 && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ High connection utilization detected
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
