/**
 * Chat Manager - Real-time messaging system
 * 
 * Features:
 * - WebSocket-based real-time communication
 * - Message history & persistence
 * - File sharing (images, documents)
 * - Typing indicators
 * - Read receipts
 * - Emoji reactions
 * - Group chat support
 * - Message search
 * - Online presence
 */

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: 'patient' | 'doctor' | 'admin' | 'staff';
  online: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: Attachment[];
  reactions?: Reaction[];
  replyTo?: string; // Message ID being replied to
  createdAt: Date;
  updatedAt?: Date;
  readBy: string[]; // User IDs who read this message
  deletedAt?: Date;
  edited: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // MIME type
  size: number; // bytes
  url: string;
  thumbnailUrl?: string;
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel';
  name?: string; // For group chats
  avatar?: string;
  participants: string[]; // User IDs
  createdBy: string;
  createdAt: Date;
  lastMessage?: Message;
  unreadCount: number;
  muted: boolean;
  pinned: boolean;
  archived: boolean;
  metadata?: {
    clinicId?: string;
    appointmentId?: string;
    purpose?: string;
  };
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface OnlineStatus {
  userId: string;
  online: boolean;
  lastSeen: Date;
}

export interface MessageFilter {
  conversationId?: string;
  senderId?: string;
  type?: Message['type'];
  search?: string;
  beforeDate?: Date;
  afterDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ConversationFilter {
  userId: string;
  type?: Conversation['type'];
  archived?: boolean;
  search?: string;
}

export class ChatManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // ms
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageCache: Map<string, Message[]> = new Map();
  private typingTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private wsUrl: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
    private userId: string
  ) {}

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.wsUrl}?userId=${this.userId}`);

        this.ws.onopen = () => {
          console.log('[ChatManager] Connected to WebSocket');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('[ChatManager] WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[ChatManager] WebSocket disconnected');
          this.stopHeartbeat();
          this.handleReconnect();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        console.error('[ChatManager] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
    this.messageCache.clear();
    this.typingTimers.forEach(timer => clearTimeout(timer));
    this.typingTimers.clear();
  }

  /**
   * Send a text message
   */
  async sendMessage(
    conversationId: string,
    content: string,
    replyTo?: string
  ): Promise<Message> {
    const message: Partial<Message> = {
      id: this.generateMessageId(),
      conversationId,
      senderId: this.userId,
      content,
      type: 'text',
      replyTo,
      createdAt: new Date(),
      readBy: [this.userId],
      edited: false,
    };

    // Send via WebSocket
    this.send({
      type: 'message',
      payload: message,
    });

    // Save to database
    await this.saveMessage(message as Message);

    return message as Message;
  }

  /**
   * Send a file/image
   */
  async sendFile(
    conversationId: string,
    file: File,
    caption?: string
  ): Promise<Message> {
    // Upload file first
    const attachment = await this.uploadFile(file);

    const message: Partial<Message> = {
      id: this.generateMessageId(),
      conversationId,
      senderId: this.userId,
      content: caption || '',
      type: file.type.startsWith('image/') ? 'image' : 'file',
      attachments: [attachment],
      createdAt: new Date(),
      readBy: [this.userId],
      edited: false,
    };

    this.send({
      type: 'message',
      payload: message,
    });

    await this.saveMessage(message as Message);

    return message as Message;
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, newContent: string): Promise<Message> {
    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== this.userId) {
      throw new Error('Cannot edit message from another user');
    }

    message.content = newContent;
    message.updatedAt = new Date();
    message.edited = true;

    this.send({
      type: 'message:edit',
      payload: { messageId, content: newContent },
    });

    await this.updateMessage(message);

    return message;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== this.userId) {
      throw new Error('Cannot delete message from another user');
    }

    message.deletedAt = new Date();

    this.send({
      type: 'message:delete',
      payload: { messageId },
    });

    await this.updateMessage(message);
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId: string, emoji: string): Promise<void> {
    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (!message.reactions) {
      message.reactions = [];
    }

    // Remove existing reaction from same user
    message.reactions = message.reactions.filter(r => r.userId !== this.userId);

    // Add new reaction
    message.reactions.push({
      emoji,
      userId: this.userId,
      userName: 'Current User', // Get from user context
      createdAt: new Date(),
    });

    this.send({
      type: 'message:reaction',
      payload: { messageId, emoji },
    });

    await this.updateMessage(message);
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: string): Promise<void> {
    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.reactions) {
      message.reactions = message.reactions.filter(r => r.userId !== this.userId);
    }

    this.send({
      type: 'message:reaction:remove',
      payload: { messageId },
    });

    await this.updateMessage(message);
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    const message = await this.getMessage(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (!message.readBy.includes(this.userId)) {
      message.readBy.push(this.userId);

      this.send({
        type: 'message:read',
        payload: { messageId },
      });

      await this.updateMessage(message);
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    this.send({
      type: 'conversation:read',
      payload: { conversationId },
    });

    // Update locally
    const messages = await this.getMessages({ conversationId });
    for (const message of messages) {
      if (!message.readBy.includes(this.userId)) {
        message.readBy.push(this.userId);
        await this.updateMessage(message);
      }
    }
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    this.send({
      type: 'typing',
      payload: {
        conversationId,
        isTyping,
      },
    });

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      const key = `${conversationId}:${this.userId}`;
      if (this.typingTimers.has(key)) {
        clearTimeout(this.typingTimers.get(key)!);
      }

      const timer = setTimeout(() => {
        this.sendTypingIndicator(conversationId, false);
        this.typingTimers.delete(key);
      }, 3000);

      this.typingTimers.set(key, timer);
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    type: Conversation['type'],
    participants: string[],
    name?: string,
    metadata?: Conversation['metadata']
  ): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.generateConversationId(),
      type,
      name,
      participants: [...participants, this.userId],
      createdBy: this.userId,
      createdAt: new Date(),
      unreadCount: 0,
      muted: false,
      pinned: false,
      archived: false,
      metadata,
    };

    this.send({
      type: 'conversation:create',
      payload: conversation,
    });

    await this.saveConversation(conversation);

    return conversation;
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    // In production, fetch from database
    // For now, return mock data
    return {
      id: conversationId,
      type: 'direct',
      participants: [this.userId, 'doctor-123'],
      createdBy: this.userId,
      createdAt: new Date(),
      unreadCount: 0,
      muted: false,
      pinned: false,
      archived: false,
    };
  }

  /**
   * Get all conversations for current user
   */
  async getConversations(filter: ConversationFilter = { userId: this.userId }): Promise<Conversation[]> {
    // In production, fetch from database with filters
    // For now, return empty array
    return [];
  }

  /**
   * Get messages with filters
   */
  async getMessages(filter: MessageFilter): Promise<Message[]> {
    const { conversationId, limit = 50, offset = 0 } = filter;

    // Check cache first
    if (conversationId && this.messageCache.has(conversationId)) {
      const cached = this.messageCache.get(conversationId)!;
      return cached.slice(offset, offset + limit);
    }

    // In production, fetch from database
    // For now, return empty array
    return [];
  }

  /**
   * Search messages
   */
  async searchMessages(query: string, conversationId?: string): Promise<Message[]> {
    const filter: MessageFilter = {
      search: query,
      conversationId,
    };

    // In production, use full-text search
    const messages = await this.getMessages(filter);
    return messages.filter(m => 
      m.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  /**
   * Update conversation settings
   */
  async updateConversation(
    conversationId: string,
    updates: Partial<Pick<Conversation, 'name' | 'muted' | 'pinned' | 'archived'>>
  ): Promise<Conversation> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    Object.assign(conversation, updates);

    this.send({
      type: 'conversation:update',
      payload: { conversationId, updates },
    });

    await this.saveConversation(conversation);

    return conversation;
  }

  /**
   * Leave conversation
   */
  async leaveConversation(conversationId: string): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    conversation.participants = conversation.participants.filter(p => p !== this.userId);

    this.send({
      type: 'conversation:leave',
      payload: { conversationId },
    });

    await this.saveConversation(conversation);
  }

  /**
   * Get online users
   */
  async getOnlineUsers(userIds: string[]): Promise<OnlineStatus[]> {
    // In production, check from Redis or WebSocket server
    return userIds.map(userId => ({
      userId,
      online: Math.random() > 0.5, // Mock
      lastSeen: new Date(),
    }));
  }

  // ============================================
  // Private Methods
  // ============================================

  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[ChatManager] Cannot send message, WebSocket not connected');
    }
  }

  private handleMessage(data: string): void {
    try {
      const parsed = JSON.parse(data);
      const { type, payload } = parsed;

      switch (type) {
        case 'message':
          this.onMessageReceived(payload);
          break;
        case 'message:edit':
          this.onMessageEdited(payload);
          break;
        case 'message:delete':
          this.onMessageDeleted(payload);
          break;
        case 'message:reaction':
          this.onReactionAdded(payload);
          break;
        case 'typing':
          this.onTypingIndicator(payload);
          break;
        case 'user:online':
          this.onUserOnline(payload);
          break;
        case 'user:offline':
          this.onUserOffline(payload);
          break;
        case 'pong':
          // Heartbeat response
          break;
        default:
          console.warn('[ChatManager] Unknown message type:', type);
      }
    } catch (error) {
      console.error('[ChatManager] Error parsing message:', error);
    }
  }

  private onMessageReceived(message: Message): void {
    // Update cache
    const conversationMessages = this.messageCache.get(message.conversationId) || [];
    conversationMessages.push(message);
    this.messageCache.set(message.conversationId, conversationMessages);

    // Trigger event for UI update
    window.dispatchEvent(new CustomEvent('chat:message', { detail: message }));
  }

  private onMessageEdited(payload: { messageId: string; content: string }): void {
    window.dispatchEvent(new CustomEvent('chat:message:edit', { detail: payload }));
  }

  private onMessageDeleted(payload: { messageId: string }): void {
    window.dispatchEvent(new CustomEvent('chat:message:delete', { detail: payload }));
  }

  private onReactionAdded(payload: { messageId: string; reaction: Reaction }): void {
    window.dispatchEvent(new CustomEvent('chat:reaction', { detail: payload }));
  }

  private onTypingIndicator(indicator: TypingIndicator): void {
    window.dispatchEvent(new CustomEvent('chat:typing', { detail: indicator }));
  }

  private onUserOnline(payload: { userId: string }): void {
    window.dispatchEvent(new CustomEvent('chat:user:online', { detail: payload }));
  }

  private onUserOffline(payload: { userId: string; lastSeen: Date }): void {
    window.dispatchEvent(new CustomEvent('chat:user:offline', { detail: payload }));
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping' });
    }, 30000); // Every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`[ChatManager] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, delay);
    } else {
      console.error('[ChatManager] Max reconnection attempts reached');
      window.dispatchEvent(new CustomEvent('chat:disconnected'));
    }
  }

  private async uploadFile(file: File): Promise<Attachment> {
    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, create object URL
    const url = URL.createObjectURL(file);
    
    return {
      id: this.generateId(),
      name: file.name,
      type: file.type,
      size: file.size,
      url,
      thumbnailUrl: file.type.startsWith('image/') ? url : undefined,
    };
  }

  private async getMessage(messageId: string): Promise<Message | null> {
    // In production, fetch from database
    // For now, search in cache
    for (const messages of this.messageCache.values()) {
      const message = messages.find(m => m.id === messageId);
      if (message) return message;
    }
    return null;
  }

  private async saveMessage(message: Message): Promise<void> {
    // In production, save to database (Supabase, PostgreSQL, etc.)
    console.log('[ChatManager] Saving message:', message.id);
    
    // Update cache
    const conversationMessages = this.messageCache.get(message.conversationId) || [];
    conversationMessages.push(message);
    this.messageCache.set(message.conversationId, conversationMessages);
  }

  private async updateMessage(message: Message): Promise<void> {
    // In production, update in database
    console.log('[ChatManager] Updating message:', message.id);
    
    // Update cache
    const conversationMessages = this.messageCache.get(message.conversationId) || [];
    const index = conversationMessages.findIndex(m => m.id === message.id);
    if (index >= 0) {
      conversationMessages[index] = message;
      this.messageCache.set(message.conversationId, conversationMessages);
    }
  }

  private async saveConversation(conversation: Conversation): Promise<void> {
    // In production, save to database
    console.log('[ChatManager] Saving conversation:', conversation.id);
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance factory
let chatManagerInstance: ChatManager | null = null;

export function getChatManager(userId: string): ChatManager {
  if (!chatManagerInstance) {
    chatManagerInstance = new ChatManager(undefined, userId);
  }
  return chatManagerInstance;
}

export function resetChatManager(): void {
  if (chatManagerInstance) {
    chatManagerInstance.disconnect();
    chatManagerInstance = null;
  }
}
