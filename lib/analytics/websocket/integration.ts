// WebSocket Integration for Next.js App Router
import { NextRequest } from 'next/server'
import { useState, useEffect, useCallback } from 'react'
import io from 'socket.io-client'
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
