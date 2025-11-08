#!/usr/bin/env node

import { WSServer } from '../lib/realtime/ws-server';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = Number.parseInt(process.env.WS_PORT || '3001', 10);

function startServer() {
  console.log('Starting WebSocket server...');
  
  try {
    // Start WebSocket server (no direct DB connection needed here)
    const server = new WSServer(PORT);
    server.start(() => {
      console.log(`WebSocket server is running on port ${PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = () => {
      console.log('Shutting down WebSocket server...');
      server.gracefulShutdown().finally(() => {
        console.log('Server stopped');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
