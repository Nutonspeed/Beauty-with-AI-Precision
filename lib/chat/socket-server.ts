/**
 * WebSocket Server for Real-time Chat
 * 
 * Run this as a separate Node.js process:
 * node lib/chat/socket-server.js
 * 
 * Or integrate with Next.js API routes for production
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

interface Client {
  ws: WebSocket;
  userId: string;
  conversationIds: Set<string>;
}

interface ServerMessage {
  type: string;
  payload: any;
}

class ChatSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map(); // userId -> Client
  private rooms: Map<string, Set<string>> = new Map(); // conversationId -> Set<userId>

  constructor(port: number = 3001) {
    const server = createServer();
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    server.listen(port, () => {
      console.log(`[ChatSocketServer] WebSocket server running on port ${port}`);
    });
  }

  private handleConnection(ws: WebSocket, req: any): void {
    // Extract userId from query params
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      console.error('[ChatSocketServer] Connection rejected: missing userId');
      ws.close(1008, 'Missing userId');
      return;
    }

    console.log(`[ChatSocketServer] Client connected: ${userId}`);

    // Store client
    const client: Client = {
      ws,
      userId,
      conversationIds: new Set(),
    };
    this.clients.set(userId, client);

    // Broadcast user online status
    this.broadcast({
      type: 'user:online',
      payload: { userId },
    });

    // Handle messages
    ws.on('message', (data) => {
      this.handleMessage(userId, data.toString());
    });

    // Handle disconnection
    ws.on('close', () => {
      this.handleDisconnection(userId);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`[ChatSocketServer] Client error (${userId}):`, error);
    });

    // Send welcome message
    this.sendToClient(userId, {
      type: 'welcome',
      payload: { message: 'Connected to chat server' },
    });
  }

  private handleMessage(userId: string, data: string): void {
    try {
      const message: ServerMessage = JSON.parse(data);
      const { type, payload } = message;

      switch (type) {
        case 'ping':
          this.sendToClient(userId, { type: 'pong', payload: {} });
          break;

        case 'message':
          this.handleChatMessage(userId, payload);
          break;

        case 'message:edit':
          this.handleMessageEdit(userId, payload);
          break;

        case 'message:delete':
          this.handleMessageDelete(userId, payload);
          break;

        case 'message:reaction':
          this.handleReaction(userId, payload);
          break;

        case 'message:reaction:remove':
          this.handleReactionRemove(userId, payload);
          break;

        case 'message:read':
          this.handleMessageRead(userId, payload);
          break;

        case 'conversation:read':
          this.handleConversationRead(userId, payload);
          break;

        case 'typing':
          this.handleTyping(userId, payload);
          break;

        case 'conversation:create':
          this.handleConversationCreate(userId, payload);
          break;

        case 'conversation:join':
          this.handleConversationJoin(userId, payload);
          break;

        case 'conversation:leave':
          this.handleConversationLeave(userId, payload);
          break;

        default:
          console.warn(`[ChatSocketServer] Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('[ChatSocketServer] Error handling message:', error);
    }
  }

  private handleChatMessage(userId: string, message: any): void {
    const { conversationId } = message;

    // Broadcast to all participants in conversation
    this.broadcastToRoom(conversationId, {
      type: 'message',
      payload: message,
    }, userId); // Exclude sender

    console.log(`[ChatSocketServer] Message sent in conversation ${conversationId}`);
  }

  private handleMessageEdit(userId: string, payload: any): void {
    const { messageId, content, conversationId } = payload;

    this.broadcastToRoom(conversationId, {
      type: 'message:edit',
      payload: { messageId, content },
    }, userId);

    console.log(`[ChatSocketServer] Message ${messageId} edited`);
  }

  private handleMessageDelete(userId: string, payload: any): void {
    const { messageId, conversationId } = payload;

    this.broadcastToRoom(conversationId, {
      type: 'message:delete',
      payload: { messageId },
    }, userId);

    console.log(`[ChatSocketServer] Message ${messageId} deleted`);
  }

  private handleReaction(userId: string, payload: any): void {
    const { messageId, emoji, conversationId } = payload;

    this.broadcastToRoom(conversationId, {
      type: 'message:reaction',
      payload: {
        messageId,
        reaction: {
          emoji,
          userId,
          userName: 'User', // Get from database
          createdAt: new Date(),
        },
      },
    }, userId);

    console.log(`[ChatSocketServer] Reaction ${emoji} added to message ${messageId}`);
  }

  private handleReactionRemove(userId: string, payload: any): void {
    const { messageId, conversationId } = payload;

    this.broadcastToRoom(conversationId, {
      type: 'message:reaction:remove',
      payload: { messageId, userId },
    }, userId);

    console.log(`[ChatSocketServer] Reaction removed from message ${messageId}`);
  }

  private handleMessageRead(userId: string, payload: any): void {
    const { messageId, conversationId } = payload;

    this.broadcastToRoom(conversationId, {
      type: 'message:read',
      payload: { messageId, userId },
    }, userId);
  }

  private handleConversationRead(userId: string, payload: any): void {
    const { conversationId } = payload;

    this.broadcastToRoom(conversationId, {
      type: 'conversation:read',
      payload: { conversationId, userId },
    }, userId);
  }

  private handleTyping(userId: string, payload: any): void {
    const { conversationId, isTyping } = payload;

    this.broadcastToRoom(conversationId, {
      type: 'typing',
      payload: {
        conversationId,
        userId,
        userName: 'User', // Get from database
        isTyping,
        timestamp: new Date(),
      },
    }, userId);
  }

  private handleConversationCreate(userId: string, conversation: any): void {
    const { id: conversationId, participants } = conversation;

    // Create room
    this.rooms.set(conversationId, new Set(participants));

    // Add creator to room
    const client = this.clients.get(userId);
    if (client) {
      client.conversationIds.add(conversationId);
    }

    // Notify all participants
    for (const participantId of participants) {
      if (participantId !== userId) {
        this.sendToClient(participantId, {
          type: 'conversation:create',
          payload: conversation,
        });

        // Add participant to room
        const participantClient = this.clients.get(participantId);
        if (participantClient) {
          participantClient.conversationIds.add(conversationId);
        }
      }
    }

    console.log(`[ChatSocketServer] Conversation ${conversationId} created`);
  }

  private handleConversationJoin(userId: string, payload: any): void {
    const { conversationId } = payload;

    // Add user to room
    if (!this.rooms.has(conversationId)) {
      this.rooms.set(conversationId, new Set());
    }
    this.rooms.get(conversationId)!.add(userId);

    const client = this.clients.get(userId);
    if (client) {
      client.conversationIds.add(conversationId);
    }

    // Notify other participants
    this.broadcastToRoom(conversationId, {
      type: 'conversation:user:join',
      payload: { conversationId, userId },
    }, userId);

    console.log(`[ChatSocketServer] User ${userId} joined conversation ${conversationId}`);
  }

  private handleConversationLeave(userId: string, payload: any): void {
    const { conversationId } = payload;

    // Remove user from room
    if (this.rooms.has(conversationId)) {
      this.rooms.get(conversationId)!.delete(userId);
    }

    const client = this.clients.get(userId);
    if (client) {
      client.conversationIds.delete(conversationId);
    }

    // Notify other participants
    this.broadcastToRoom(conversationId, {
      type: 'conversation:user:leave',
      payload: { conversationId, userId },
    }, userId);

    console.log(`[ChatSocketServer] User ${userId} left conversation ${conversationId}`);
  }

  private handleDisconnection(userId: string): void {
    console.log(`[ChatSocketServer] Client disconnected: ${userId}`);

    // Remove client
    this.clients.delete(userId);

    // Broadcast user offline status
    this.broadcast({
      type: 'user:offline',
      payload: {
        userId,
        lastSeen: new Date(),
      },
    });
  }

  private sendToClient(userId: string, message: ServerMessage): void {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private broadcastToRoom(
    conversationId: string,
    message: ServerMessage,
    excludeUserId?: string
  ): void {
    const room = this.rooms.get(conversationId);
    if (!room) return;

    for (const userId of room) {
      if (userId !== excludeUserId) {
        this.sendToClient(userId, message);
      }
    }
  }

  private broadcast(message: ServerMessage, excludeUserId?: string): void {
    for (const [userId, client] of this.clients) {
      if (userId !== excludeUserId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  }

  getStats(): {
    clients: number;
    rooms: number;
  } {
    return {
      clients: this.clients.size,
      rooms: this.rooms.size,
    };
  }
}

// Start server if running directly
if (require.main === module) {
  const port = parseInt(process.env.WS_PORT || '3001', 10);
  new ChatSocketServer(port);
}

export default ChatSocketServer;
