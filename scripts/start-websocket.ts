#!/usr/bin/env node
/**
 * DEPRECATED: Prefer `tsx scripts/ws-server.ts` as the single entry point.
 * This script remains for backward compatibility during transition.
 */

import { WSServer } from '../lib/realtime/ws-server';
import { prisma } from '@/lib/db';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.WS_PORT || '3001', 10);

async function startServer() {
  console.log('Starting WebSocket server...');
  
  try {
    // Initialize database connection
    await prisma.$connect();
    console.log('Database connected');

    // Start WebSocket server
    const server = new WSServer(PORT);
    server.start(() => {
      console.log(`WebSocket server is running on port ${PORT}`);
      
      // Example: Broadcast a message every minute
      setInterval(() => {
        server.broadcast({
          type: 'SYSTEM_MESSAGE',
          data: { message: 'Server is running', timestamp: new Date().toISOString() }
        });
      }, 60000);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down WebSocket server...');
      await server.gracefulShutdown();
      await prisma.$disconnect();
      console.log('Server stopped');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
