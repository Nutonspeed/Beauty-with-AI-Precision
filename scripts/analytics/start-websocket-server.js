#!/usr/bin/env node

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
    console.log(`🚀 Analytics WebSocket server running on port ${PORT}`)
    console.log(`📊 Real-time analytics enabled`)
    console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}`)
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
    console.log('\n🔄 Shutting down WebSocket server...')
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
