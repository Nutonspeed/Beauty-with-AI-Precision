// WebSocket Server for Real-time Analytics
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { analyticsLogger } from './logger'
import { auth } from '@/lib/auth/index'

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

    const roomName = `${roomType}:${roomId}`
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
    const roomName = `${roomType}:${roomId}`
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
    const roomName = `${roomType}:${roomId}`
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
    const roomName = `${roomType}:${roomId}`
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
    const metrics: {
      connectedClients: number;
      authenticatedClients: number;
      totalSubscriptions: number;
      rooms: Record<string, Record<string, any>>;
    } = {
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
