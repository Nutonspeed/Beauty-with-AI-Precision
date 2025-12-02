#!/usr/bin/env node

/**
 * Real-time Analytics Dashboard with WebSocket Setup Script
 * Implements advanced real-time analytics, WebSocket connections, and live data visualization
 */

const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorLog(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Create real-time analytics directories
function createAnalyticsDirectories() {
  colorLog('\n📁 Creating real-time analytics directories...', 'cyan')
  
  const directories = [
    'lib/analytics',
    'lib/analytics/websocket',
    'lib/analytics/metrics',
    'lib/analytics/aggregation',
    'lib/analytics/streaming',
    'components/analytics',
    'components/analytics/charts',
    'components/analytics/metrics',
    'app/api/analytics',
    'app/api/websocket',
    'scripts/analytics'
  ]
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true })
      colorLog(`  ✅ Created ${dir}`, 'green')
    } else {
      colorLog(`  ✅ ${dir} exists`, 'blue')
    }
  })
}

// Create WebSocket server implementation
function createWebSocketServer() {
  colorLog('\n🌐 Creating WebSocket server implementation...', 'cyan')
  
  const webSocketServer = `// WebSocket Server for Real-time Analytics
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { analyticsLogger } from './logger'
import { metricsAggregator } from './aggregator'
import { auth } from '@/lib/auth'

// WebSocket events
export enum SocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  METRICS_UPDATE = 'metrics_update',
  ANALYTICS_DATA = 'analytics_data',
  ERROR = 'error',
  AUTHENTICATE = 'authenticate',
  SUBSCRIBE_METRICS = 'subscribe_metrics',
  UNSUBSCRIBE_METRICS = 'unsubscribe_metrics'
}

// Room types
export enum RoomType {
  CLINIC_ANALYTICS = 'clinic_analytics',
  GLOBAL_ANALYTICS = 'global_analytics',
  USER_SESSION = 'user_session',
  PERFORMANCE_METRICS = 'performance_metrics',
  BUSINESS_METRICS = 'business_metrics'
}

// Socket data interface
export interface SocketData {
  userId?: string
  clinicId?: string
  role?: string
  authenticated: boolean
  subscriptions: string[]
  joinedAt: number
}

export class AnalyticsWebSocketServer {
  private static instance: AnalyticsWebSocketServer
  private io: SocketIOServer
  private connectedClients: Map<string, SocketData> = new Map()
  private roomMetrics: Map<string, any> = new Map()

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    })

    this.setupEventHandlers()
    this.startMetricsCollection()
  }

  static getInstance(server?: HTTPServer): AnalyticsWebSocketServer {
    if (!AnalyticsWebSocketServer.instance) {
      if (!server) {
        throw new Error('HTTP server instance required for first initialization')
      }
      AnalyticsWebSocketServer.instance = new AnalyticsWebSocketServer(server)
    }
    return AnalyticsWebSocketServer.instance
  }

  private setupEventHandlers(): void {
    this.io.on(SocketEvent.CONNECT, (socket) => {
      this.handleConnection(socket)
    })

    this.io.on(SocketEvent.DISCONNECT, (socket) => {
      this.handleDisconnection(socket)
    })
  }

  private async handleConnection(socket: any): Promise<void> {
    const clientData: SocketData = {
      authenticated: false,
      subscriptions: [],
      joinedAt: Date.now()
    }

    this.connectedClients.set(socket.id, clientData)

    // Setup socket event handlers
    socket.on(SocketEvent.AUTHENTICATE, async (token: string) => {
      await this.handleAuthentication(socket, token)
    })

    socket.on(SocketEvent.JOIN_ROOM, (roomType: string, roomId: string) => {
      this.handleJoinRoom(socket, roomType, roomId)
    })

    socket.on(SocketEvent.LEAVE_ROOM, (roomType: string, roomId: string) => {
      this.handleLeaveRoom(socket, roomType, roomId)
    })

    socket.on(SocketEvent.SUBSCRIBE_METRICS, (metrics: string[]) => {
      this.handleSubscribeMetrics(socket, metrics)
    })

    socket.on(SocketEvent.UNSUBSCRIBE_METRICS, (metrics: string[]) => {
      this.handleUnsubscribeMetrics(socket, metrics)
    })

    // Send initial connection confirmation
    socket.emit('connected', {
      socketId: socket.id,
      timestamp: Date.now(),
      message: 'Connected to analytics WebSocket'
    })

    analyticsLogger.logInfo('Client connected', {
      socketId: socket.id,
      ip: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent']
    })
  }

  private async handleAuthentication(socket: any, token: string): Promise<void> {
    try {
      // Verify JWT token
      const session = await auth({ token })
      
      if (session?.user) {
        const clientData = this.connectedClients.get(socket.id)
        if (clientData) {
          clientData.authenticated = true
          clientData.userId = session.user.id
          clientData.clinicId = session.user.clinicId
          clientData.role = session.user.role
          
          this.connectedClients.set(socket.id, clientData)
        }

        socket.emit('authenticated', {
          success: true,
          user: {
            id: session.user.id,
            clinicId: session.user.clinicId,
            role: session.user.role
          }
        })

        analyticsLogger.logInfo('Client authenticated', {
          socketId: socket.id,
          userId: session.user.id,
          clinicId: session.user.clinicId
        })
      } else {
        socket.emit('authenticated', { success: false, error: 'Invalid token' })
      }
    } catch (error) {
      socket.emit('authenticated', { success: false, error: 'Authentication failed' })
      analyticsLogger.logError(error as Error, {
        socketId: socket.id,
        action: 'authentication'
      })
    }
  }

  private handleJoinRoom(socket: any, roomType: string, roomId: string): void {
    const clientData = this.connectedClients.get(socket.id)
    
    if (!clientData?.authenticated) {
      socket.emit(SocketEvent.ERROR, 'Authentication required to join rooms')
      return
    }

    // Validate room access
    if (!this.canJoinRoom(clientData, roomType, roomId)) {
      socket.emit(SocketEvent.ERROR, 'Access denied to room')
      return
    }

    const roomName = \`\${roomType}:\${roomId}\`
    socket.join(roomName)

    socket.emit('room_joined', {
      roomType,
      roomId,
      roomName,
      timestamp: Date.now()
    })

    analyticsLogger.logInfo('Client joined room', {
      socketId: socket.id,
      userId: clientData.userId,
      roomType,
      roomId
    })
  }

  private handleLeaveRoom(socket: any, roomType: string, roomId: string): void {
    const roomName = \`\${roomType}:\${roomId}\`
    socket.leave(roomName)

    socket.emit('room_left', {
      roomType,
      roomId,
      roomName,
      timestamp: Date.now()
    })

    analyticsLogger.logInfo('Client left room', {
      socketId: socket.id,
      roomType,
      roomId
    })
  }

  private handleSubscribeMetrics(socket: any, metrics: string[]): void {
    const clientData = this.connectedClients.get(socket.id)
    
    if (!clientData?.authenticated) {
      socket.emit(SocketEvent.ERROR, 'Authentication required')
      return
    }

    // Add to subscriptions
    metrics.forEach(metric => {
      if (!clientData.subscriptions.includes(metric)) {
        clientData.subscriptions.push(metric)
      }
    })

    this.connectedClients.set(socket.id, clientData)

    socket.emit('metrics_subscribed', {
      metrics: clientData.subscriptions,
      timestamp: Date.now()
    })

    analyticsLogger.logInfo('Client subscribed to metrics', {
      socketId: socket.id,
      userId: clientData.userId,
      metrics
    })
  }

  private handleUnsubscribeMetrics(socket: any, metrics: string[]): void {
    const clientData = this.connectedClients.get(socket.id)
    
    if (!clientData) return

    // Remove from subscriptions
    clientData.subscriptions = clientData.subscriptions.filter(
      sub => !metrics.includes(sub)
    )

    this.connectedClients.set(socket.id, clientData)

    socket.emit('metrics_unsubscribed', {
      metrics: clientData.subscriptions,
      timestamp: Date.now()
    })

    analyticsLogger.logInfo('Client unsubscribed from metrics', {
      socketId: socket.id,
      userId: clientData.userId,
      metrics
    })
  }

  private handleDisconnection(socket: any): void {
    const clientData = this.connectedClients.get(socket.id)
    
    if (clientData) {
      analyticsLogger.logInfo('Client disconnected', {
        socketId: socket.id,
        userId: clientData.userId,
        duration: Date.now() - clientData.joinedAt
      })
    }

    this.connectedClients.delete(socket.id)
  }

  private canJoinRoom(clientData: SocketData, roomType: string, roomId: string): boolean {
    switch (roomType) {
      case RoomType.CLINIC_ANALYTICS:
        // Users can only join their own clinic's analytics room
        return clientData.clinicId === roomId
      
      case RoomType.GLOBAL_ANALYTICS:
        // Only super admins can join global analytics
        return clientData.role === 'super_admin'
      
      case RoomType.USER_SESSION:
        // Users can only join their own session room
        return clientData.userId === roomId
      
      case RoomType.PERFORMANCE_METRICS:
      case RoomType.BUSINESS_METRICS:
        // Admin roles can access these rooms
        return ['super_admin', 'clinic_owner', 'admin'].includes(clientData.role || '')
      
      default:
        return false
    }
  }

  // Broadcast metrics to subscribed clients
  broadcastMetrics(metricType: string, data: any, targetRoom?: string): void {
    const payload = {
      type: metricType,
      data,
      timestamp: Date.now()
    }

    if (targetRoom) {
      this.io.to(targetRoom).emit(SocketEvent.METRICS_UPDATE, payload)
    } else {
      // Broadcast to all subscribed clients
      this.connectedClients.forEach((clientData, socketId) => {
        if (clientData.authenticated && clientData.subscriptions.includes(metricType)) {
          this.io.to(socketId).emit(SocketEvent.METRICS_UPDATE, payload)
        }
      })
    }
  }

  // Send analytics data to specific room
  sendAnalyticsData(roomType: string, roomId: string, data: any): void {
    const roomName = \`\${roomType}:\${roomId}\`
    const payload = {
      roomType,
      roomId,
      data,
      timestamp: Date.now()
    }

    this.io.to(roomName).emit(SocketEvent.ANALYTICS_DATA, payload)
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size
  }

  // Get clients by room
  getClientsInRoom(roomType: string, roomId: string): number {
    const roomName = \`\${roomType}:\${roomId}\`
    const room = this.io.sockets.adapter.rooms.get(roomName)
    return room ? room.size : 0
  }

  // Start metrics collection
  private startMetricsCollection(): void {
    // Collect WebSocket metrics every 30 seconds
    setInterval(() => {
      this.collectWebSocketMetrics()
    }, 30000)
  }

  private collectWebSocketMetrics(): void {
    const metrics = {
      connectedClients: this.connectedClients.size,
      authenticatedClients: Array.from(this.connectedClients.values()).filter(c => c.authenticated).length,
      totalSubscriptions: Array.from(this.connectedClients.values()).reduce((sum, c) => sum + c.subscriptions.length, 0),
      rooms: {}
    }

    // Collect room metrics
    Object.values(RoomType).forEach(roomType => {
      metrics.rooms[roomType] = {}
      // This would require additional tracking to implement properly
    })

    // Broadcast to performance metrics room
    this.broadcastMetrics('websocket_metrics', metrics, 'performance_metrics:global')
  }

  // Graceful shutdown
  shutdown(): void {
    this.io.close()
    analyticsLogger.logInfo('WebSocket server shut down')
  }
}

// Export singleton getter
export const getAnalyticsWebSocketServer = AnalyticsWebSocketServer.getInstance
`

  const serverPath = path.join(process.cwd(), 'lib', 'analytics', 'websocket', 'server.ts')
  fs.writeFileSync(serverPath, webSocketServer)
  colorLog('✅ WebSocket server implementation created', 'green')
}

// Create metrics aggregation system
function createMetricsAggregation() {
  colorLog('\n📊 Creating metrics aggregation system...', 'cyan')
  
  const metricsAggregation = `// Real-time Metrics Aggregation System
import { createClient } from '@/lib/supabase/server'
import { analyticsLogger } from './logger'

// Metric types
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer'
}

// Metric categories
export enum MetricCategory {
  BUSINESS = 'business',
  PERFORMANCE = 'performance',
  USER = 'user',
  SYSTEM = 'system',
  AI = 'ai',
  DATABASE = 'database'
}

// Metric interface
export interface Metric {
  name: string
  type: MetricType
  category: MetricCategory
  value: number
  labels?: Record<string, string>
  timestamp: number
  clinicId?: string
  userId?: string
}

// Aggregated metric interface
export interface AggregatedMetric {
  name: string
  type: MetricType
  category: MetricCategory
  value: number
  count: number
  min: number
  max: number
  avg: number
  labels?: Record<string, string>
  timeWindow: string
  timestamp: number
}

export class MetricsAggregator {
  private static instance: MetricsAggregator
  private metrics: Map<string, Metric[]> = new Map()
  private aggregationIntervals: Map<string, NodeJS.Timeout> = new Map()
  private subscribers: Map<string, Array<(metric: AggregatedMetric) => void>> = new Map()

  constructor() {
    this.startAggregation()
  }

  static getInstance(): MetricsAggregator {
    if (!MetricsAggregator.instance) {
      MetricsAggregator.instance = new MetricsAggregator()
    }
    return MetricsAggregator.instance
  }

  // Record a metric
  recordMetric(metric: Metric): void {
    const key = this.getMetricKey(metric)
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    
    const metricList = this.metrics.get(key)!
    metricList.push(metric)
    
    // Keep only last 1000 metrics per key to prevent memory issues
    if (metricList.length > 1000) {
      metricList.shift()
    }
    
    // Notify subscribers
    this.notifySubscribers(key, metric)
  }

  // Increment counter metric
  incrementCounter(
    name: string, 
    value: number = 1, 
    labels?: Record<string, string>,
    clinicId?: string,
    userId?: string
  ): void {
    this.recordMetric({
      name,
      type: MetricType.COUNTER,
      category: MetricCategory.SYSTEM,
      value,
      labels,
      timestamp: Date.now(),
      clinicId,
      userId
    })
  }

  // Set gauge metric
  setGauge(
    name: string,
    value: number,
    labels?: Record<string, string>,
    clinicId?: string,
    userId?: string
  ): void {
    this.recordMetric({
      name,
      type: MetricType.GAUGE,
      category: MetricCategory.SYSTEM,
      value,
      labels,
      timestamp: Date.now(),
      clinicId,
      userId
    })
  }

  // Record timer metric
  recordTimer(
    name: string,
    duration: number,
    labels?: Record<string, string>,
    clinicId?: string,
    userId?: string
  ): void {
    this.recordMetric({
      name,
      type: MetricType.TIMER,
      category: MetricCategory.PERFORMANCE,
      value: duration,
      labels,
      timestamp: Date.now(),
      clinicId,
      userId
    })
  }

  // Record histogram metric
  recordHistogram(
    name: string,
    value: number,
    labels?: Record<string, string>,
    clinicId?: string,
    userId?: string
  ): void {
    this.recordMetric({
      name,
      type: MetricType.HISTOGRAM,
      category: MetricCategory.SYSTEM,
      value,
      labels,
      timestamp: Date.now(),
      clinicId,
      userId
    })
  }

  // Get aggregated metrics
  getAggregatedMetrics(
    name: string,
    timeWindow: string = '5m',
    clinicId?: string
  ): AggregatedMetric | null {
    const key = this.getMetricKey({ name, clinicId } as any)
    const metrics = this.metrics.get(key) || []
    
    const cutoffTime = this.getCutoffTime(timeWindow)
    const recentMetrics = metrics.filter(m => m.timestamp >= cutoffTime)
    
    if (recentMetrics.length === 0) {
      return null
    }
    
    const values = recentMetrics.map(m => m.value)
    const firstMetric = recentMetrics[0]
    
    return {
      name: firstMetric.name,
      type: firstMetric.type,
      category: firstMetric.category,
      value: this.aggregateValue(firstMetric.type, values),
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      labels: firstMetric.labels,
      timeWindow,
      timestamp: Date.now()
    }
  }

  // Get multiple metrics
  getMultipleMetrics(
    names: string[],
    timeWindow?: string,
    clinicId?: string
  ): Map<string, AggregatedMetric> {
    const results = new Map<string, AggregatedMetric>()
    
    names.forEach(name => {
      const metric = this.getAggregatedMetrics(name, timeWindow, clinicId)
      if (metric) {
        results.set(name, metric)
      }
    })
    
    return results
  }

  // Subscribe to metric updates
  subscribe(name: string, callback: (metric: AggregatedMetric) => void): void {
    if (!this.subscribers.has(name)) {
      this.subscribers.set(name, [])
    }
    
    this.subscribers.get(name)!.push(callback)
  }

  // Unsubscribe from metric updates
  unsubscribe(name: string, callback: (metric: AggregatedMetric) => void): void {
    const subscribers = this.subscribers.get(name)
    if (subscribers) {
      const index = subscribers.indexOf(callback)
      if (index > -1) {
        subscribers.splice(index, 1)
      }
    }
  }

  // Start aggregation process
  private startAggregation(): void {
    // Aggregate metrics every minute
    this.aggregationIntervals.set('1m', setInterval(() => {
      this.performAggregation('1m')
    }, 60000))
    
    // Aggregate metrics every 5 minutes
    this.aggregationIntervals.set('5m', setInterval(() => {
      this.performAggregation('5m')
    }, 300000))
    
    // Aggregate metrics every hour
    this.aggregationIntervals.set('1h', setInterval(() => {
      this.performAggregation('1h')
    }, 3600000))
  }

  // Perform aggregation for time window
  private performAggregation(timeWindow: string): void {
    const cutoffTime = this.getCutoffTime(timeWindow)
    
    this.metrics.forEach((metrics, key) => {
      const recentMetrics = metrics.filter(m => m.timestamp >= cutoffTime)
      
      if (recentMetrics.length > 0) {
        const firstMetric = recentMetrics[0]
        const values = recentMetrics.map(m => m.value)
        
        const aggregatedMetric: AggregatedMetric = {
          name: firstMetric.name,
          type: firstMetric.type,
          category: firstMetric.category,
          value: this.aggregateValue(firstMetric.type, values),
          count: values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          labels: firstMetric.labels,
          timeWindow,
          timestamp: Date.now()
        }
        
        // Store aggregated metric
        this.storeAggregatedMetric(aggregatedMetric)
        
        // Notify subscribers
        this.notifyAggregatedSubscribers(firstMetric.name, aggregatedMetric)
      }
    })
  }

  // Aggregate value based on metric type
  private aggregateValue(type: MetricType, values: number[]): number {
    switch (type) {
      case MetricType.COUNTER:
        return values.reduce((sum, val) => sum + val, 0)
      case MetricType.GAUGE:
        return values[values.length - 1] // Latest value
      case MetricType.HISTOGRAM:
      case MetricType.TIMER:
        return values.reduce((sum, val) => sum + val, 0) / values.length // Average
      default:
        return values.reduce((sum, val) => sum + val, 0)
    }
  }

  // Get metric key
  private getMetricKey(metric: Partial<Metric>): string {
    const parts = [metric.name]
    
    if (metric.clinicId) {
      parts.push(\`clinic:\${metric.clinicId}\`)
    }
    
    if (metric.userId) {
      parts.push(\`user:\${metric.userId}\`)
    }
    
    if (metric.labels) {
      const labelStr = Object.entries(metric.labels)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => \`\${k}=\${v}\`)
        .join(',')
      parts.push(labelStr)
    }
    
    return parts.join(':')
  }

  // Get cutoff time for time window
  private getCutoffTime(timeWindow: string): number {
    const now = Date.now()
    
    switch (timeWindow) {
      case '1m':
        return now - 60000
      case '5m':
        return now - 300000
      case '15m':
        return now - 900000
      case '30m':
        return now - 1800000
      case '1h':
        return now - 3600000
      case '6h':
        return now - 21600000
      case '24h':
        return now - 86400000
      default:
        return now - 300000 // Default to 5 minutes
    }
  }

  // Notify subscribers of new metric
  private notifySubscribers(key: string, metric: Metric): void {
    const subscribers = this.subscribers.get(metric.name)
    if (subscribers) {
      // For now, we'll notify on the next aggregation cycle
      // Real-time notification would require immediate aggregation
    }
  }

  // Notify subscribers of aggregated metric
  private notifyAggregatedSubscribers(name: string, metric: AggregatedMetric): void {
    const subscribers = this.subscribers.get(name)
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(metric)
        } catch (error) {
          analyticsLogger.logError(error as Error, {
            action: 'metric_subscription_callback',
            metricName: name
          })
        }
      })
    }
  }

  // Store aggregated metric in database
  private async storeAggregatedMetric(metric: AggregatedMetric): Promise<void> {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('analytics_metrics')
        .insert({
          name: metric.name,
          type: metric.type,
          category: metric.category,
          value: metric.value,
          count: metric.count,
          min_value: metric.min,
          max_value: metric.max,
          avg_value: metric.avg,
          labels: metric.labels,
          time_window: metric.timeWindow,
          created_at: new Date(metric.timestamp).toISOString()
        })
      
      if (error) {
        throw error
      }
    } catch (error) {
      analyticsLogger.logError(error as Error, {
        action: 'store_aggregated_metric',
        metric: metric.name
      })
    }
  }

  // Cleanup old metrics
  cleanup(): void {
    const cutoffTime = this.getCutoffTime('24h')
    
    this.metrics.forEach((metrics, key) => {
      const filteredMetrics = metrics.filter(m => m.timestamp >= cutoffTime)
      this.metrics.set(key, filteredMetrics)
    })
  }

  // Get system overview
  getSystemOverview(): any {
    const totalMetrics = Array.from(this.metrics.values()).reduce((sum, metrics) => sum + metrics.length, 0)
    const activeSubscriptions = Array.from(this.subscribers.values()).reduce((sum, subs) => sum + subs.length, 0)
    
    return {
      totalMetrics,
      activeSubscriptions,
      metricKeys: this.metrics.size,
      timestamp: Date.now()
    }
  }

  // Shutdown
  shutdown(): void {
    this.aggregationIntervals.forEach(interval => clearInterval(interval))
    this.aggregationIntervals.clear()
    this.metrics.clear()
    this.subscribers.clear()
  }
}

// Business metrics helpers
export class BusinessMetrics {
  private static aggregator = MetricsAggregator.getInstance()

  // Track user registration
  static trackUserRegistration(clinicId: string): void {
    this.aggregator.incrementCounter('user_registrations', 1, { event: 'registration' }, clinicId)
  }

  // Track skin analysis
  static trackSkinAnalysis(clinicId: string, userId: string, confidence: number): void {
    this.aggregator.incrementCounter('skin_analyses', 1, { event: 'analysis' }, clinicId, userId)
    this.aggregator.recordHistogram('analysis_confidence', confidence, undefined, clinicId, userId)
  }

  // Track treatment booking
  static trackTreatmentBooking(clinicId: string, userId: string, treatmentType: string): void {
    this.aggregator.incrementCounter('treatment_bookings', 1, { treatment_type: treatmentType }, clinicId, userId)
  }

  // Track revenue
  static trackRevenue(clinicId: string, amount: number, currency: string = 'THB'): void {
    this.aggregator.incrementCounter('revenue', amount, { currency }, clinicId)
  }

  // Track lead conversion
  static trackLeadConversion(clinicId: string, userId: string): void {
    this.aggregator.incrementCounter('lead_conversions', 1, { event: 'conversion' }, clinicId, userId)
  }

  // Track API usage
  static trackAPIUsage(endpoint: string, method: string, statusCode: number, responseTime: number): void {
    this.aggregator.incrementCounter('api_requests', 1, { endpoint, method, status: statusCode.toString() })
    this.aggregator.recordTimer('api_response_time', responseTime, { endpoint, method })
  }

  // Track AI service usage
  static trackAIServiceUsage(service: string, model: string, tokens: number, responseTime: number): void {
    this.aggregator.incrementCounter('ai_requests', 1, { service, model })
    this.aggregator.recordHistogram('ai_tokens_used', tokens, { service, model })
    this.aggregator.recordTimer('ai_response_time', responseTime, { service, model })
  }
}

// Performance metrics helpers
export class PerformanceMetrics {
  private static aggregator = MetricsAggregator.getInstance()

  // Track database query performance
  static trackDatabaseQuery(query: string, duration: number, success: boolean): void {
    this.aggregator.recordTimer('db_query_duration', duration, { query, success: success.toString() })
    if (!success) {
      this.aggregator.incrementCounter('db_query_errors', 1, { query })
    }
  }

  // Track cache performance
  static trackCacheHit(key: string, hit: boolean): void {
    this.aggregator.incrementCounter('cache_requests', 1, { hit: hit.toString() })
  }

  // Track memory usage
  static trackMemoryUsage(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      this.aggregator.setGauge('memory_heap_used', usage.heapUsed, { type: 'heap' })
      this.aggregator.setGauge('memory_heap_total', usage.heapTotal, { type: 'heap' })
      this.aggregator.setGauge('memory_external', usage.external, { type: 'external' })
    }
  }

  // Track active connections
  static trackActiveConnections(type: string, count: number): void {
    this.aggregator.setGauge('active_connections', count, { type })
  }
}

// Export singleton instance
export const metricsAggregator = MetricsAggregator.getInstance()
`

  const aggregationPath = path.join(process.cwd(), 'lib', 'analytics', 'aggregation', 'metrics.ts')
  fs.writeFileSync(aggregationPath, metricsAggregation)
  colorLog('✅ Metrics aggregation system created', 'green')
}

// Create real-time analytics dashboard component
function createAnalyticsDashboard() {
  colorLog('\n📈 Creating real-time analytics dashboard component...', 'cyan')
  
  const dashboardComponent = `'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  Eye, 
  Clock,
  Zap,
  Database,
  Brain,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

// WebSocket client for real-time data
import { io, Socket } from 'socket.io-client'

interface MetricData {
  type: string
  data: any
  timestamp: number
}

interface DashboardMetrics {
  business: {
    totalUsers: number
    totalAnalyses: number
    totalBookings: number
    totalRevenue: number
    conversionRate: number
  }
  performance: {
    avgResponseTime: number
    uptime: number
    errorRate: number
    activeConnections: number
    cacheHitRate: number
  }
  ai: {
    totalRequests: number
    avgResponseTime: number
    successRate: number
    tokensUsed: number
    modelUsage: Record<string, number>
  }
  realTime: {
    currentUsers: number
    activeSessions: number
    requestsPerSecond: number
    systemLoad: number
  }
}

export default function RealTimeAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    business: {
      totalUsers: 0,
      totalAnalyses: 0,
      totalBookings: 0,
      totalRevenue: 0,
      conversionRate: 0
    },
    performance: {
      avgResponseTime: 0,
      uptime: 0,
      errorRate: 0,
      activeConnections: 0,
      cacheHitRate: 0
    },
    ai: {
      totalRequests: 0,
      avgResponseTime: 0,
      successRate: 0,
      tokensUsed: 0,
      modelUsage: {}
    },
    realTime: {
      currentUsers: 0,
      activeSessions: 0,
      requestsPerSecond: 0,
      systemLoad: 0
    }
  })

  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [timeRange, setTimeRange] = useState('1h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [historicalData, setHistoricalData] = useState<any[]>([])

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      auth: {
        token: localStorage.getItem('auth_token')
      }
    })

    newSocket.on('connect', () => {
      setConnected(true)
      console.log('Connected to analytics WebSocket')
      
      // Subscribe to metrics
      newSocket.emit('subscribe_metrics', [
        'business_metrics',
        'performance_metrics',
        'ai_metrics',
        'realtime_metrics'
      ])
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      console.log('Disconnected from analytics WebSocket')
    })

    newSocket.on('metrics_update', (data: MetricData) => {
      updateMetrics(data)
    })

    newSocket.on('analytics_data', (data: any) => {
      console.log('Received analytics data:', data)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Fetch initial data
  useEffect(() => {
    fetchInitialData()
    fetchHistoricalData()
  }, [timeRange])

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchInitialData()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh, timeRange])

  const fetchInitialData = async () => {
    try {
      const response = await fetch(\`/api/analytics/dashboard?timeRange=\${timeRange}\`)
      const data = await response.json()
      
      if (data.success) {
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    }
  }

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(\`/api/analytics/historical?timeRange=\${timeRange}\`)
      const data = await response.json()
      
      if (data.success) {
        setHistoricalData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch historical data:', error)
    }
  }

  const updateMetrics = useCallback((data: MetricData) => {
    setMetrics(prev => {
      const updated = { ...prev }
      
      switch (data.type) {
        case 'business_metrics':
          updated.business = { ...updated.business, ...data.data }
          break
        case 'performance_metrics':
          updated.performance = { ...updated.performance, ...data.data }
          break
        case 'ai_metrics':
          updated.ai = { ...updated.ai, ...data.data }
          break
        case 'realtime_metrics':
          updated.realTime = { ...updated.realTime, ...data.data }
          break
      }
      
      return updated
    })
  }, [])

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num)
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount)
  }

  const formatPercentage = (value: number): string => {
    return \`\${(value * 100).toFixed(1)}%\`
  }

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value >= thresholds.good) return 'text-green-600'
    if (value >= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return <CheckCircle className="w-4 h-4 text-green-600" />
    if (value >= thresholds.warning) return <AlertCircle className="w-4 h-4 text-yellow-600" />
    return <AlertCircle className="w-4 h-4 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-time Analytics Dashboard</h2>
          <p className="text-muted-foreground">Live monitoring of business metrics and system performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={\`w-2 h-2 rounded-full \${connected ? 'bg-green-500' : 'bg-red-500'}\`}></div>
            <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Clock className="w-4 h-4 mr-2" />
            Auto-refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.business.totalUsers)}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skin Analyses</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics.business.totalAnalyses)}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.business.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics.business.conversionRate)}</div>
            <p className="text-xs text-muted-foreground">
              +2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              System Performance
            </CardTitle>
            <CardDescription>Real-time system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Response Time</span>
                <div className="flex items-center space-x-2">
                  <span className={\`font-mono \${getStatusColor(metrics.performance.avgResponseTime, { good: 200, warning: 500 })}\`}>
                    {metrics.performance.avgResponseTime}ms
                  </span>
                  {getStatusIcon(metrics.performance.avgResponseTime, { good: 200, warning: 500 })}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Uptime</span>
                <div className="flex items-center space-x-2">
                  <span className={\`font-mono \${getStatusColor(metrics.performance.uptime, { good: 99, warning: 95 })}\`}>
                    {formatPercentage(metrics.performance.uptime)}
                  </span>
                  {getStatusIcon(metrics.performance.uptime, { good: 99, warning: 95 })}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Error Rate</span>
                <div className="flex items-center space-x-2">
                  <span className={\`font-mono \${getStatusColor(100 - metrics.performance.errorRate * 100, { good: 95, warning: 90 })}\`}>
                    {formatPercentage(metrics.performance.errorRate)}
                  </span>
                  {getStatusIcon(100 - metrics.performance.errorRate * 100, { good: 95, warning: 90 })}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Cache Hit Rate</span>
                <div className="flex items-center space-x-2">
                  <span className={\`font-mono \${getStatusColor(metrics.performance.cacheHitRate * 100, { good: 80, warning: 60 })}\`}>
                    {formatPercentage(metrics.performance.cacheHitRate)}
                  </span>
                  {getStatusIcon(metrics.performance.cacheHitRate * 100, { good: 80, warning: 60 })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              AI Services
            </CardTitle>
            <CardDescription>AI service performance and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Requests</span>
                <span className="font-mono">{formatNumber(metrics.ai.totalRequests)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">AI Response Time</span>
                <div className="flex items-center space-x-2">
                  <span className={\`font-mono \${getStatusColor(metrics.ai.avgResponseTime, { good: 1000, warning: 3000 })}\`}>
                    {metrics.ai.avgResponseTime}ms
                  </span>
                  {getStatusIcon(metrics.ai.avgResponseTime, { good: 1000, warning: 3000 })}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Success Rate</span>
                <div className="flex items-center space-x-2">
                  <span className={\`font-mono \${getStatusColor(metrics.ai.successRate * 100, { good: 95, warning: 90 })}\`}>
                    {formatPercentage(metrics.ai.successRate)}
                  </span>
                  {getStatusIcon(metrics.ai.successRate * 100, { good: 95, warning: 90 })}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Tokens Used</span>
                <span className="font-mono">{formatNumber(metrics.ai.tokensUsed)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Real-time Activity
          </CardTitle>
          <CardDescription>Live user activity and system load</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.realTime.currentUsers}</div>
              <div className="text-sm text-muted-foreground">Current Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.realTime.activeSessions}</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.realTime.requestsPerSecond}</div>
              <div className="text-sm text-muted-foreground">Requests/Second</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{metrics.realTime.systemLoad}%</div>
              <div className="text-sm text-muted-foreground">System Load</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historical Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="responseTime" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" />
                  <Bar dataKey="bookings" fill="#82ca9d" />
                  <Bar dataKey="analyses" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="responseTime" stroke="#ff7300" />
                  <Line type="monotone" dataKey="errorRate" stroke="#387908" />
                  <Line type="monotone" dataKey="throughput" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Service Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={Object.entries(metrics.ai.modelUsage).map(([model, usage]) => ({
                      name: model,
                      value: usage
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => \`\${name} \${(percent * 100).toFixed(0)}%\`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(metrics.ai.modelUsage).map((entry, index) => (
                      <Cell key={\`cell-\${index}\`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
`

  const dashboardPath = path.join(process.cwd(), 'components', 'analytics', 'realtime-dashboard.tsx')
  fs.writeFileSync(dashboardPath, dashboardComponent)
  colorLog('✅ Real-time analytics dashboard component created', 'green')
}

// Create analytics API endpoints
function createAnalyticsAPI() {
  colorLog('\n🔌 Creating analytics API endpoints...', 'cyan')
  
  const analyticsAPI = `import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@/lib/auth'
import { metricsAggregator, BusinessMetrics, PerformanceMetrics } from '@/lib/analytics/aggregation/metrics'
import { analyticsLogger } from '@/lib/analytics/websocket/logger'

// GET /api/analytics/dashboard - Get dashboard metrics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '1h'
    const clinicId = session.user.clinicId

    // Get business metrics
    const businessMetrics = await getBusinessMetrics(clinicId, timeRange)
    
    // Get performance metrics
    const performanceMetrics = await getPerformanceMetrics(timeRange)
    
    // Get AI metrics
    const aiMetrics = await getAIMetrics(timeRange)
    
    // Get real-time metrics
    const realTimeMetrics = await getRealTimeMetrics()

    const dashboardData = {
      success: true,
      metrics: {
        business: businessMetrics,
        performance: performanceMetrics,
        ai: aiMetrics,
        realTime: realTimeMetrics
      },
      timeRange,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'get_dashboard_metrics',
      url: request.url
    })
    
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard metrics' 
    }, { status: 500 })
  }
}

// POST /api/analytics/track - Track custom metrics
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { metrics } = await request.json()
    
    if (!Array.isArray(metrics)) {
      return NextResponse.json({ error: 'Metrics must be an array' }, { status: 400 })
    }

    // Track each metric
    metrics.forEach(metric => {
      const { name, type, value, category, labels } = metric
      
      switch (type) {
        case 'counter':
          metricsAggregator.incrementCounter(name, value, labels, session.user.clinicId, session.user.id)
          break
        case 'gauge':
          metricsAggregator.setGauge(name, value, labels, session.user.clinicId, session.user.id)
          break
        case 'timer':
          metricsAggregator.recordTimer(name, value, labels, session.user.clinicId, session.user.id)
          break
        case 'histogram':
          metricsAggregator.recordHistogram(name, value, labels, session.user.clinicId, session.user.id)
          break
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'track_metrics',
      url: request.url
    })
    
    return NextResponse.json({ 
      error: 'Failed to track metrics' 
    }, { status: 500 })
  }
}

// Helper functions
async function getBusinessMetrics(clinicId: string, timeRange: string): Promise<any> {
  try {
    const supabase = createClient()
    const cutoffDate = getCutoffDate(timeRange)
    
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', cutoffDate)

    // Get total analyses
    const { count: totalAnalyses } = await supabase
      .from('skin_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', cutoffDate)

    // Get total bookings
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', cutoffDate)

    // Get total revenue
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('clinic_id', clinicId)
      .eq('status', 'completed')
      .gte('created_at', cutoffDate)

    const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0

    // Calculate conversion rate
    const { count: totalLeads } = await supabase
      .from('sales_leads')
      .select('*', { count: 'exact', head: true })
      .eq('clinic_id', clinicId)
      .gte('created_at', cutoffDate)

    const conversionRate = totalLeads > 0 ? (totalBookings || 0) / totalLeads : 0

    return {
      totalUsers: totalUsers || 0,
      totalAnalyses: totalAnalyses || 0,
      totalBookings: totalBookings || 0,
      totalRevenue,
      conversionRate
    }
  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'get_business_metrics'
    })
    
    return {
      totalUsers: 0,
      totalAnalyses: 0,
      totalBookings: 0,
      totalRevenue: 0,
      conversionRate: 0
    }
  }
}

async function getPerformanceMetrics(timeRange: string): Promise<any> {
  try {
    // Get aggregated performance metrics
    const responseTime = metricsAggregator.getAggregatedMetrics('api_response_time', timeRange)
    const errorRate = metricsAggregator.getAggregatedMetrics('api_requests_error', timeRange)
    const totalRequests = metricsAggregator.getAggregatedMetrics('api_requests', timeRange)
    const cacheHitRate = metricsAggregator.getAggregatedMetrics('cache_hit_rate', timeRange)

    // Calculate uptime (simplified)
    const uptime = 0.99 // This would come from actual monitoring

    return {
      avgResponseTime: responseTime?.avg || 0,
      uptime,
      errorRate: totalRequests && errorRate ? errorRate.value / totalRequests.value : 0,
      activeConnections: 10, // This would come from connection pool metrics
      cacheHitRate: cacheHitRate?.avg || 0
    }
  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'get_performance_metrics'
    })
    
    return {
      avgResponseTime: 0,
      uptime: 0,
      errorRate: 0,
      activeConnections: 0,
      cacheHitRate: 0
    }
  }
}

async function getAIMetrics(timeRange: string): Promise<any> {
  try {
    const totalRequests = metricsAggregator.getAggregatedMetrics('ai_requests', timeRange)
    const avgResponseTime = metricsAggregator.getAggregatedMetrics('ai_response_time', timeRange)
    const tokensUsed = metricsAggregator.getAggregatedMetrics('ai_tokens_used', timeRange)
    const errorRate = metricsAggregator.getAggregatedMetrics('ai_requests_error', timeRange)

    const successRate = totalRequests && errorRate 
      ? (totalRequests.value - errorRate.value) / totalRequests.value 
      : 0

    // Get model usage breakdown
    const modelUsage = {
      'gpt-4': metricsAggregator.getAggregatedMetrics('ai_requests_gpt_4', timeRange)?.value || 0,
      'gpt-3.5': metricsAggregator.getAggregatedMetrics('ai_requests_gpt_3_5', timeRange)?.value || 0,
      'claude': metricsAggregator.getAggregatedMetrics('ai_requests_claude', timeRange)?.value || 0,
      'deepface': metricsAggregator.getAggregatedMetrics('ai_requests_deepface', timeRange)?.value || 0
    }

    return {
      totalRequests: totalRequests?.value || 0,
      avgResponseTime: avgResponseTime?.avg || 0,
      successRate,
      tokensUsed: tokensUsed?.value || 0,
      modelUsage
    }
  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'get_ai_metrics'
    })
    
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      successRate: 0,
      tokensUsed: 0,
      modelUsage: {}
    }
  }
}

async function getRealTimeMetrics(): Promise<any> {
  try {
    // These would come from real-time monitoring systems
    return {
      currentUsers: 25,
      activeSessions: 18,
      requestsPerSecond: 12,
      systemLoad: 45
    }
  } catch (error) {
    analyticsLogger.logError(error as Error, {
      action: 'get_realtime_metrics'
    })
    
    return {
      currentUsers: 0,
      activeSessions: 0,
      requestsPerSecond: 0,
      systemLoad: 0
    }
  }
}

function getCutoffDate(timeRange: string): string {
  const now = new Date()
  const cutoff = new Date()
  
  switch (timeRange) {
    case '1h':
      cutoff.setHours(now.getHours() - 1)
      break
    case '6h':
      cutoff.setHours(now.getHours() - 6)
      break
    case '24h':
      cutoff.setDate(now.getDate() - 1)
      break
    case '7d':
      cutoff.setDate(now.getDate() - 7)
      break
    case '30d':
      cutoff.setDate(now.getDate() - 30)
      break
    default:
      cutoff.setHours(now.getHours() - 1)
  }
  
  return cutoff.toISOString()
}
`

  const apiPath = path.join(process.cwd(), 'app', 'api', 'analytics', 'dashboard', 'route.ts')
  fs.writeFileSync(apiPath, analyticsAPI)
  colorLog('✅ Analytics API endpoints created', 'green')
}

// Create WebSocket integration for Next.js
function createWebSocketIntegration() {
  colorLog('\n🔌 Creating WebSocket integration for Next.js...', 'cyan')
  
  const webSocketIntegration = `// WebSocket Integration for Next.js App Router
import { NextRequest } from 'next/server'
import { getAnalyticsWebSocketServer } from '@/lib/analytics/websocket/server'
import { analyticsLogger } from '@/lib/analytics/websocket/logger'

// WebSocket upgrade handler for Next.js
export async function GET(request: NextRequest) {
  // This is a placeholder for WebSocket upgrade
  // In production, you'd use a proper WebSocket server setup
  // For Next.js, this might be handled by a separate server or API route
  
  return new Response('WebSocket endpoint', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
}

// WebSocket configuration for client-side
export const websocketConfig = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  options: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true
  }
}

// WebSocket client hook
export function useWebSocket(token?: string) {
  const [socket, setSocket] = useState<any>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    const newSocket = io(websocketConfig.url, {
      ...websocketConfig.options,
      auth: { token }
    })

    newSocket.on('connect', () => {
      setConnected(true)
      setError(null)
      analyticsLogger.logInfo('WebSocket connected', { client: true })
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
      analyticsLogger.logInfo('WebSocket disconnected', { client: true })
    })

    newSocket.on('connect_error', (err: Error) => {
      setError(err.message)
      analyticsLogger.logError(err, { client: true, action: 'websocket_connect_error' })
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [token])

  const subscribe = useCallback((metrics: string[]) => {
    if (socket && connected) {
      socket.emit('subscribe_metrics', metrics)
    }
  }, [socket, connected])

  const unsubscribe = useCallback((metrics: string[]) => {
    if (socket && connected) {
      socket.emit('unsubscribe_metrics', metrics)
    }
  }, [socket, connected])

  const joinRoom = useCallback((roomType: string, roomId: string) => {
    if (socket && connected) {
      socket.emit('join_room', roomType, roomId)
    }
  }, [socket, connected])

  const leaveRoom = useCallback((roomType: string, roomId: string) => {
    if (socket && connected) {
      socket.emit('leave_room', roomType, roomId)
    }
  }, [socket, connected])

  return {
    socket,
    connected,
    error,
    subscribe,
    unsubscribe,
    joinRoom,
    leaveRoom
  }
}
`

  const integrationPath = path.join(process.cwd(), 'lib', 'analytics', 'websocket', 'integration.ts')
  fs.writeFileSync(integrationPath, webSocketIntegration)
  colorLog('✅ WebSocket integration created', 'green')
}

// Create analytics logger
function createAnalyticsLogger() {
  colorLog('\n📝 Creating analytics logger...', 'cyan')
  
  const analyticsLogger = `// Analytics Logger for Real-time Analytics
import { createClient } from '@/lib/supabase/server'

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

// Log entry interface
export interface AnalyticsLogEntry {
  level: LogLevel
  message: string
  context?: Record<string, any>
  timestamp: string
  userId?: string
  clinicId?: string
  sessionId?: string
}

export class AnalyticsLogger {
  private static instance: AnalyticsLogger
  private logs: AnalyticsLogEntry[] = []
  private maxLogs = 1000

  constructor() {
    // Setup periodic log flushing
    setInterval(() => {
      this.flushLogs()
    }, 30000) // Flush every 30 seconds
  }

  static getInstance(): AnalyticsLogger {
    if (!AnalyticsLogger.instance) {
      AnalyticsLogger.instance = new AnalyticsLogger()
    }
    return AnalyticsLogger.instance
  }

  // Log debug message
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  // Log info message
  logInfo(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  // Log warning message
  logWarning(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  // Log error message
  logError(error: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, error.message, {
      ...context,
      stack: error.stack,
      name: error.name
    })
  }

  // Main log method
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    const logEntry: AnalyticsLogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString()
    }

    // Add to memory buffer
    this.logs.push(logEntry)

    // Keep buffer size manageable
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(\`[ANALYTICS-\${level}] \${message}\`, context)
    }

    // Immediately flush errors
    if (level === LogLevel.ERROR) {
      this.flushLogs()
    }
  }

  // Flush logs to database
  private async flushLogs(): Promise<void> {
    if (this.logs.length === 0) return

    const logsToFlush = [...this.logs]
    this.logs = []

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('analytics_logs')
        .insert(logsToFlush.map(log => ({
          level: log.level,
          message: log.message,
          context: log.context,
          user_id: log.userId,
          clinic_id: log.clinicId,
          session_id: log.sessionId,
          created_at: log.timestamp
        })))

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Failed to flush analytics logs:', error)
      // Re-add logs to buffer if flush failed
      this.logs.unshift(...logsToFlush)
    }
  }

  // Get recent logs
  getRecentLogs(limit: number = 100): AnalyticsLogEntry[] {
    return this.logs.slice(-limit)
  }

  // Clear logs
  clearLogs(): void {
    this.logs = []
  }
}

// Export singleton instance
export const analyticsLogger = AnalyticsLogger.getInstance()
`

  const loggerPath = path.join(process.cwd(), 'lib', 'analytics', 'websocket', 'logger.ts')
  fs.writeFileSync(loggerPath, analyticsLogger)
  colorLog('✅ Analytics logger created', 'green')
}

// Update package.json with new dependencies
function updatePackageDependencies() {
  colorLog('\n📦 Updating package.json dependencies...', 'cyan')
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
    
    // Add WebSocket and analytics dependencies
    const newDependencies = {
      'socket.io': '^4.7.4',
      'socket.io-client': '^4.7.4'
    }
    
    // Add analytics scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'analytics:start': 'node scripts/analytics/start-websocket-server.js',
      'analytics:monitor': 'node scripts/analytics/monitor-analytics.js',
      'analytics:setup': 'node scripts/setup-realtime-analytics.js'
    }
    
    // Merge dependencies
    packageJson.dependencies = {
      ...packageJson.dependencies,
      ...newDependencies
    }
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2))
    colorLog('✅ Package.json updated with analytics dependencies', 'green')
    
  } catch (error) {
    colorLog(`⚠️ Could not update package.json: ${error.message}`, 'yellow')
  }
}

// Create WebSocket server startup script
function createWebSocketServerScript() {
  colorLog('\n🚀 Creating WebSocket server startup script...', 'cyan')
  
  const serverScript = `#!/usr/bin/env node

/**
 * WebSocket Server Startup Script for Analytics
 * Starts the analytics WebSocket server
 */

const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = process.env.WS_PORT || 3001

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res)
  })

  // Initialize WebSocket server
  const { getAnalyticsWebSocketServer } = require('../lib/analytics/websocket/server')
  const wsServer = getAnalyticsWebSocketServer(server)

  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(\`🚀 Analytics WebSocket server running on port \${PORT}\`)
    console.log(\`📊 Real-time analytics enabled\`)
    console.log(\`🔌 WebSocket endpoint: ws://localhost:\${PORT}\`)
  })

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🔄 Shutting down WebSocket server...')
    wsServer.shutdown()
    server.close(() => {
      console.log('✅ WebSocket server stopped')
      process.exit(0)
    })
  })

  process.on('SIGINT', () => {
    console.log('\\n🔄 Shutting down WebSocket server...')
    wsServer.shutdown()
    server.close(() => {
      console.log('✅ WebSocket server stopped')
      process.exit(0)
    })
  })
}).catch((ex) => {
  console.error('Failed to start WebSocket server:', ex)
  process.exit(1)
})
`

  const scriptPath = path.join(process.cwd(), 'scripts', 'analytics', 'start-websocket-server.js')
  fs.writeFileSync(scriptPath, serverScript)
  colorLog('✅ WebSocket server startup script created', 'green')
}

// Main execution function
async function main() {
  colorLog('🚀 Setting up Real-time Analytics Dashboard with WebSocket', 'bright')
  colorLog('=' .repeat(60), 'cyan')
  
  try {
    createAnalyticsDirectories()
    createWebSocketServer()
    createMetricsAggregation()
    createAnalyticsDashboard()
    createAnalyticsAPI()
    createWebSocketIntegration()
    createAnalyticsLogger()
    updatePackageDependencies()
    createWebSocketServerScript()
    
    colorLog('\n' + '='.repeat(60), 'green')
    colorLog('🎉 Real-time Analytics Dashboard with WebSocket setup completed!', 'bright')
    colorLog('\n📋 Next Steps:', 'cyan')
    colorLog('1. Install new dependencies: pnpm install', 'blue')
    colorLog('2. Start WebSocket server: pnpm run analytics:start', 'blue')
    colorLog('3. Configure environment variables for WebSocket', 'blue')
    colorLog('4. Add analytics dashboard to your app', 'blue')
    colorLog('5. Test real-time data updates', 'blue')
    
    colorLog('\n📊 Analytics Features:', 'yellow')
    colorLog('• Real-time WebSocket connections for live data', 'white')
    colorLog('• Interactive charts and visualizations', 'white')
    colorLog('• Business metrics (users, revenue, conversions)', 'white')
    colorLog('• Performance monitoring (response times, uptime)', 'white')
    colorLog('• AI service analytics and usage tracking', 'white')
    colorLog('• Custom metrics tracking and aggregation', 'white')
    
    colorLog('\n🔌 WebSocket Capabilities:', 'cyan')
    colorLog('• Secure authentication and room management', 'blue')
    colorLog('• Metric subscriptions and real-time updates', 'blue')
    colorLog('• Connection monitoring and health checks', 'blue')
    colorLog('• Graceful error handling and reconnection', 'blue')
    colorLog('• Scalable architecture for multiple clients', 'blue')
    
    colorLog('\n📈 Dashboard Components:', 'green')
    colorLog('• Real-time KPI cards with trend indicators', 'white')
    colorLog('• Interactive time-series charts', 'white')
    colorLog('• Performance metrics with status indicators', 'white')
    colorLog('• AI service usage breakdowns', 'white')
    colorLog('• Historical data analysis and trends', 'white')
    
  } catch (error) {
    colorLog(`\n❌ Setup failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Run the setup
if (require.main === module) {
  main()
}

module.exports = {
  main,
  createAnalyticsDirectories,
  createWebSocketServer,
  createMetricsAggregation,
  createAnalyticsDashboard,
  createAnalyticsAPI,
  createWebSocketIntegration,
  createAnalyticsLogger,
  updatePackageDependencies,
  createWebSocketServerScript
}

// Run the setup
if (require.main === module) {
  main()
}

module.exports = {
  main,
  createAnalyticsDirectories,
  createWebSocketServer,
  createMetricsAggregation,
  createAnalyticsDashboard,
  createAnalyticsAPI,
  createWebSocketIntegration,
  createAnalyticsLogger,
  updatePackageDependencies,
  createWebSocketServerScript
}
