/**
 * Chat Manager
 * Handles realtime chat with message persistence, typing indicators, and read receipts
 */

export type UserRole = 'staff' | 'patient';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: number;
  read: boolean;
  delivered: boolean;
  readBy?: string[];
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  roomId: string;
  isTyping: boolean;
}

export interface ReadReceipt {
  messageId: string;
  userId: string;
  readAt: number;
}

export interface ChatEventHandlers {
  onMessage?: (message: ChatMessage) => void;
  onMessageUpdate?: (message: ChatMessage) => void;
  onTyping?: (typing: TypingIndicator) => void;
  onReadReceipt?: (receipt: ReadReceipt) => void;
  onDelivered?: (messageId: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

type WebSocketMessage = 
  | { type: 'message'; data: ChatMessage }
  | { type: 'typing'; data: TypingIndicator }
  | { type: 'read_receipt'; data: ReadReceipt }
  | { type: 'delivered'; data: { messageId: string } }
  | { type: 'join'; data: { roomId: string; userId: string; userName: string; userRole: UserRole } }
  | { type: 'leave'; data: { roomId: string; userId: string } };

export class ChatManager {
  private ws: WebSocket | null = null;
  private currentRoomId: string | null = null;
  private userId: string | null = null;
  private userName: string | null = null;
  private userRole: UserRole | null = null;
  private messageCache: Map<string, ChatMessage[]> = new Map();
  private handlers: ChatEventHandlers = {};
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnected = false;
  private readonly serverUrl: string;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private typingTimeout: NodeJS.Timeout | null = null;

  constructor(serverUrl: string = 'ws://localhost:3001') {
    this.serverUrl = serverUrl;
    this.setupWebSocket();
  }

  /**
   * Set up WebSocket connection with reconnection logic
   */
  private setupWebSocket(): void {
    try {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.handlers.onConnected?.();
        
        // Rejoin room if we were in one
        if (this.currentRoomId && this.userId && this.userName && this.userRole) {
          this.joinRoom(this.currentRoomId, this.userId, this.userName, this.userRole);
        }
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.handlers.onError?.(error instanceof Error ? error : new Error(String(error)));
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.handlers.onDisconnected?.();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handlers.onError?.(error instanceof Error ? error : new Error('WebSocket error occurred'));
        this.ws?.close();
      };
    } catch (error) {
      console.error('Failed to setup WebSocket:', error);
      this.handlers.onError?.(error instanceof Error ? error : new Error('Failed to setup WebSocket'));
      this.attemptReconnect();
    }
  }

  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user ID
   */
  private getCurrentUserId(): string | null {
    return this.userId;
  }

  private handleWebSocketMessage(message: WebSocketMessage): void {
    try {
      switch (message.type) {
        case 'message':
          this.handleNewMessage(message.data);
          break;
        case 'typing':
          this.handleTypingIndicator(message.data);
          break;
        case 'read_receipt':
          this.handleReadReceipt(message.data);
          break;
        case 'delivered':
          this.handleDelivered(message.data.messageId);
          break;
        case 'join':
        case 'leave':
          // Handle user join/leave notifications
          if (this.handlers.onMessage) {
            const userName = 'userName' in message.data ? message.data.userName : 'Unknown User';
            const userRole = 'userRole' in message.data ? message.data.userRole : 'patient' as UserRole;
            
            const notification: ChatMessage = {
              id: this.generateMessageId(),
              roomId: message.data.roomId,
              senderId: message.data.userId,
              senderName: userName,
              senderRole: userRole,
              content: `${userName} has ${message.type === 'join' ? 'joined' : 'left'} the chat`,
              timestamp: Date.now(),
              read: false,
              delivered: true,
              readBy: []
            };
            this.handlers.onMessage(notification);
          }
          break;
        default:
          console.warn('Unknown message type:', (message as any).type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.handlers.onError?.(error instanceof Error ? error : new Error('Error handling message'));
    }
  }

  /**
   * Handle typing indicator
   */
  private handleTypingIndicator(data: TypingIndicator): void {
    // Update typing status in the UI
    if (this.handlers.onTyping) {
      this.handlers.onTyping(data);
    }

    // Clear any existing timeout for this user
    const existingTimeout = this.typingTimeouts.get(data.userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.typingTimeouts.delete(data.userId);
    }

    // Set a new timeout to clear the typing indicator
    if (data.isTyping) {
      const timeout = setTimeout(() => {
        this.handlers.onTyping?.({
          ...data,
          isTyping: false
        });
        this.typingTimeouts.delete(data.userId);
      }, 3000);

      this.typingTimeouts.set(data.userId, timeout);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.setupWebSocket();
      
      // Exponential backoff with jitter
      this.reconnectDelay = Math.min(30000, this.reconnectDelay * 2) + (Math.random() * 1000);
    }, this.reconnectDelay);
  }

  /**
   * Send a message through the WebSocket
   */
  private sendWebSocketMessage(message: WebSocketMessage): void {
    if (!this.isConnected || !this.ws) {
      console.error('WebSocket is not connected');
      this.handlers.onError?.(new Error('WebSocket is not connected'));
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      this.handlers.onError?.(error instanceof Error ? error : new Error('Failed to send message'));
    }
  }

  /**
   * Join a chat room
   */
  joinRoom(roomId: string, userId: string, userName: string, userRole: UserRole): void {
    if (this.currentRoomId === roomId && this.userId === userId) return;
    
    // Store user information
    this.userId = userId;
    this.userName = userName;
    this.userRole = userRole;
    
    this.leaveCurrentRoom();
    this.currentRoomId = roomId;
    
    // Load initial messages from cache or API
    this.loadMessages(roomId);
    
    // Send join room message if connected
    if (this.isConnected) {
      this.sendWebSocketMessage({
        type: 'join',
        data: {
          roomId,
          userId,
          userName,
          userRole
        }
      });
    }
  }

  /**
   * Leave current chat room
   */
  leaveCurrentRoom(): void {
    if (!this.currentRoomId || !this.userId) return;

    // Send leave room message if connected
    if (this.isConnected) {
      this.sendWebSocketMessage({
        type: 'leave',
        data: {
          roomId: this.currentRoomId,
          userId: this.userId
        }
      });
    }
    
    // Clear typing indicators for this room
    this.typingTimeouts.forEach((timeout, key) => {
      if (key.startsWith(`${this.currentRoomId}:`)) {
        clearTimeout(timeout);
        this.typingTimeouts.delete(key);
      }
    });
    
    // Clear current room and handlers
    const oldRoomId = this.currentRoomId;
    this.currentRoomId = null;
    
    // Clear message cache for this room after a short delay
    setTimeout(() => {
      if (this.currentRoomId !== oldRoomId) {
        this.messageCache.delete(oldRoomId);
      }
    }, 60000); // Keep messages in cache for 1 minute after leaving
    
    console.log(`[Chat] Left room ${oldRoomId}`);
  }

  /**
   * Load messages from cache or API
   */
  loadMessages(roomId: string): void {
    const cached = this.messageCache.get(roomId) || [];
    cached.forEach(msg => {
      if (this.handlers.onMessage) {
        this.handlers.onMessage(msg);
      }
    });
  }

  /**
   * Send a chat message
   */
  sendMessage(content: string, userId: string, userName: string, userRole: UserRole): string | null {
    if (!this.currentRoomId) {
      console.error('Cannot send message: Not connected to a room');
      return null;
    }
    
    const message: ChatMessage = {
      id: this.generateMessageId(),
      roomId: this.currentRoomId,
      senderId: userId,
      senderName: userName,
      senderRole: userRole,
      content,
      timestamp: Date.now(),
      read: false,
      delivered: false,
      readBy: []
    };
    
    try {
      // Add to local cache
      const cached = this.messageCache.get(message.roomId) || [];
      cached.push(message);
      this.messageCache.set(message.roomId, cached);
      
      // Send via WebSocket
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'message',
          data: message
        }));
      } else {
        console.warn('WebSocket not connected, message queued');
        // TODO: Implement message queue for offline support
      }
      
      // Notify UI immediately for optimistic updates
      this.handlers.onMessage?.(message);
      
      return message.id;
    } catch (error) {
      console.error('Failed to send message:', error);
      this.handlers.onError?.(error instanceof Error ? error : new Error('Failed to send message'));
      return null;
    }
  }
  

  /**
   * Send typing indicator
   */
  sendTyping(isTyping: boolean): void {
    if (!this.currentRoomId || !this.userId || !this.userName) {
      console.error('Cannot send typing indicator: Not connected to a room or missing user information');
      return;
    }

    // Clear existing typing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendWebSocketMessage({
        type: 'typing',
        data: {
          roomId: this.currentRoomId,
          userId: this.userId,
          userName: this.userName,
          isTyping: isTyping
        }
      });

      // Set timeout to auto-stop typing after 3 seconds
      if (isTyping) {
        this.typingTimeout = setTimeout(() => {
          this.sendTyping(false);
        }, 3000);
      }
    }
  }

  /**
   * Mark message as read
   */
  markAsRead(messageId: string): void {
    if (!this.currentRoomId || !this.userId) {
      return;
    }

    const receipt: ReadReceipt = {
      messageId,
      userId: this.userId,
      readAt: Date.now()
    };

    // Update local message cache
    const cached = this.messageCache.get(this.currentRoomId);
    if (cached) {
      const message = cached.find(m => m.id === messageId);
      if (message) {
        message.read = true;
        message.readBy = [...(message.readBy || []), this.userId];
        this.handlers.onMessageUpdate?.(message);
      }
    }

    // Send read receipt
    if (this.isConnected) {
      this.sendWebSocketMessage({
        type: 'read_receipt',
        data: receipt
      });
    }
  }

  private handleReadReceipt(receipt: ReadReceipt): void {
    // Update message read status in cache
    if (this.currentRoomId) {
      const cached = this.messageCache.get(this.currentRoomId) || [];
      const message = cached.find(m => m.id === receipt.messageId);
      if (message) {
        message.read = true;
        message.readBy = [...(message.readBy || []), receipt.userId];
        this.handlers.onMessageUpdate?.(message);
      }
    }

    if (this.handlers.onReadReceipt) {
      this.handlers.onReadReceipt(receipt);
    }
  }

  /**
   * Handle message delivered event
   */
  private handleDelivered(messageId: string): void {
    if (!this.currentRoomId) return;
    
    const cached = this.messageCache.get(this.currentRoomId) || [];
    const message = cached.find(m => m.id === messageId);
    
    if (message) {
      message.delivered = true;
      this.handlers.onMessageUpdate?.(message);
    }
    
    if (this.handlers.onDelivered) {
      this.handlers.onDelivered(messageId);
    }
  }

  /**
   * Get message history from cache
   */
  getMessageHistory(roomId: string): ChatMessage[] {
    return this.messageCache.get(roomId) || [];
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleChatMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'message':
        this.handleNewMessage(message.data);
        break;
      case 'typing':
        this.handleTypingIndicator(message.data);
        break;
      case 'read_receipt':
        this.handleReadReceipt(message.data);
        break;
      case 'delivered':
        this.handleDelivered(message.data.messageId);
        break;
    }
  }

  /**
   * Handle new message
   */
  private handleNewMessage(message: ChatMessage): void {
    // Cache message
    const cached = this.messageCache.get(message.roomId) || [];
    const exists = cached.some(m => m.id === message.id);
    
    if (!exists) {
      cached.push(message);
      this.messageCache.set(message.roomId, cached);
    }

    // Notify handler
    if (this.handlers.onMessage) {
      this.handlers.onMessage(message);
    }

    // Send delivery receipt
    if (message.senderId !== this.getCurrentUserId()) {
      this.ws?.send(JSON.stringify({
        type: 'delivered',
        data: {
          messageId: message.id
        }
      }));
    }
  }


  /**
   * Set event handlers
   */
  setEventHandlers(handlers: ChatEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Clear message cache
   */
  clearCache(roomId?: string): void {
    if (roomId) {
      this.messageCache.delete(roomId);
    } else {
      this.messageCache.clear();
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.leaveCurrentRoom();
    this.clearCache();
    
    // Clear all typing timeouts
    this.typingTimeouts.forEach(timeout => clearTimeout(timeout));
    this.typingTimeouts.clear();
    
    // Clear reconnect timeout if it exists
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Close WebSocket connection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
