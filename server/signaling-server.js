// Signaling Server for Video Consultation System
// Socket.IO server for WebRTC signaling and room management

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store active rooms and participants
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('[Server] User connected:', socket.id);

  /**
   * Join room
   */
  socket.on('join-room', ({ roomId, userId, userName, userRole }) => {
    console.log(`[Server] ${userName} (${userRole}) joining room:`, roomId);

    // Join socket.io room
    socket.join(roomId);

    // Store user info
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    rooms.get(roomId).set(userId, {
      userId,
      userName,
      userRole,
      socketId: socket.id,
      joinedAt: Date.now(),
    });

    // Notify existing participants
    socket.to(roomId).emit('user-joined', {
      userId,
      userName,
      userRole,
    });

    // Send current participants to new user
    const participants = Array.from(rooms.get(roomId).values())
      .filter((p) => p.userId !== userId);

    socket.emit('existing-participants', { participants });

    console.log(`[Server] Room ${roomId} now has ${rooms.get(roomId).size} participants`);
  });

  /**
   * Leave room
   */
  socket.on('leave-room', ({ roomId, userId }) => {
    console.log(`[Server] User ${userId} leaving room:`, roomId);

    // Notify other participants
    socket.to(roomId).emit('user-left', { userId });

    // Remove from room data
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(userId);

      // Delete empty room
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
        console.log(`[Server] Room ${roomId} deleted (empty)`);
      }
    }

    // Leave socket.io room
    socket.leave(roomId);
  });

  /**
   * WebRTC signaling
   */
  socket.on('signal', ({ to, signal }) => {
    console.log(`[Server] Forwarding signal from ${socket.id} to ${to}`);
    io.to(to).emit('signal', {
      from: socket.id,
      signal,
    });
  });

  /**
   * Chat message
   */
  socket.on('chat-message', ({ roomId, message }) => {
    console.log(`[Server] Chat message in room ${roomId}:`, message.message);
    io.to(roomId).emit('chat-message', message);
  });

  /**
   * Media state change (audio/video/screen)
   */
  socket.on('media-state-change', ({ roomId, userId, type, enabled }) => {
    console.log(`[Server] Media state change - ${userId} ${type}: ${enabled}`);
    socket.to(roomId).emit('media-state-changed', {
      userId,
      type,
      enabled,
    });
  });

  /**
   * Disconnect
   */
  socket.on('disconnect', () => {
    console.log('[Server] User disconnected:', socket.id);

    // Find and remove user from all rooms
    rooms.forEach((participants, roomId) => {
      participants.forEach((participant, userId) => {
        if (participant.socketId === socket.id) {
          console.log(`[Server] Removing ${userId} from room ${roomId}`);

          // Notify others
          socket.to(roomId).emit('user-left', { userId });

          // Remove participant
          participants.delete(userId);

          // Delete empty room
          if (participants.size === 0) {
            rooms.delete(roomId);
            console.log(`[Server] Room ${roomId} deleted (empty)`);
          }
        }
      });
    });
  });

  /**
   * Get room info (admin/debugging)
   */
  socket.on('get-room-info', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.emit('room-info', {
        roomId,
        participantCount: room.size,
        participants: Array.from(room.values()),
      });
    } else {
      socket.emit('room-info', {
        roomId,
        participantCount: 0,
        participants: [],
      });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeRooms: rooms.size,
    totalParticipants: Array.from(rooms.values())
      .reduce((sum, room) => sum + room.size, 0),
    uptime: process.uptime(),
  });
});

// Room stats endpoint
app.get('/rooms', (req, res) => {
  const roomStats = Array.from(rooms.entries()).map(([roomId, participants]) => ({
    roomId,
    participantCount: participants.size,
    participants: Array.from(participants.values()).map((p) => ({
      userId: p.userId,
      userName: p.userName,
      userRole: p.userRole,
      joinedAt: p.joinedAt,
    })),
  }));

  res.json({ rooms: roomStats });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Video Consultation Signaling Server`);
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 Room stats: http://localhost:${PORT}/rooms`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});
