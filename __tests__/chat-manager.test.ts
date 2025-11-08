import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatManager, ChatMessage, TypingIndicator, ReadReceipt } from '@/lib/chat-manager';

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  readyState = 1; // OPEN
  send = vi.fn();
  close = vi.fn();
  onopen: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;

  constructor() {
    // Set the global instance
    mockWebSocketInstance = this;
    // Simulate connection asynchronously to allow handlers to be set
    setTimeout(() => {
      if (this.onopen) {
        this.onopen();
      }
    }, 0);
  }
}

vi.mock('ws', () => ({
  default: MockWebSocket
}));

// Spy on the global WebSocket constructor
let mockWebSocketInstance: MockWebSocket;

global.WebSocket = MockWebSocket as any;
(global.WebSocket as any).OPEN = 1;

describe('ChatManager', () => {
  let chatManager: ChatManager;

  beforeEach(async () => {
    vi.clearAllMocks();
    chatManager = new ChatManager();
    // Wait for WebSocket connection to be established
    await new Promise(resolve => setTimeout(resolve, 1));
    // WebSocket connection should now be established
  });

  afterEach(() => {
    chatManager.destroy();
  });

  describe('Room Management', () => {
    it('should join a room and subscribe to channel', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;

      chatManager.joinRoom(roomId, userId, userName, userRole);

      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'join',
        data: { roomId, userId, userName, userRole }
      }));
    });

    it('should leave room and unsubscribe', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);
      chatManager.leaveCurrentRoom();

      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'leave',
        data: { roomId, userId }
      }));
    });

    it('should handle joining a new room while in another', () => {
      chatManager.joinRoom('room-1', 'user-1', 'John', 'patient');
      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'join',
        data: { roomId: 'room-1', userId: 'user-1', userName: 'John', userRole: 'patient' }
      }));

      chatManager.joinRoom('room-2', 'user-1', 'John', 'patient');
      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'leave',
        data: { roomId: 'room-1', userId: 'user-1' }
      }));
      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'join',
        data: { roomId: 'room-2', userId: 'user-1', userName: 'John', userRole: 'patient' }
      }));
    });
  });

  describe('Message Handling', () => {
    it('should send a message', async () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John Doe';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);

      const messageId = chatManager.sendMessage(
        'Hello, World!',
        userId,
        userName,
        userRole
      );

      expect(messageId).toBeTruthy();
      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"join"')
      );
      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"message"')
      );
      const messageCall = mockWebSocketInstance.send.mock.calls.find(call => 
        JSON.parse(call[0]).type === 'message'
      );
      expect(messageCall).toBeDefined();
      const sentData = JSON.parse(messageCall![0]);
      expect(sentData).toEqual({
        type: 'message',
        data: expect.objectContaining({
          content: 'Hello, World!',
          senderId: userId,
          senderName: userName,
          senderRole: userRole,
          roomId
        })
      });
    });

    it('should cache sent messages', async () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);

      const messageId1 = chatManager.sendMessage('Message 1', userId, userName, userRole);
      const messageId2 = chatManager.sendMessage('Message 2', userId, userName, userRole);

      expect(messageId1).toBeTruthy();
      expect(messageId2).toBeTruthy();
      const history = chatManager.getMessageHistory(roomId);
      expect(history).toHaveLength(2);
      expect(history[0].content).toBe('Message 1');
      expect(history[1].content).toBe('Message 2');
    });

    it('should call onMessage handler when receiving messages', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      const onMessage = vi.fn();
      
      chatManager.setEventHandlers({ onMessage });
      chatManager.joinRoom(roomId, userId, userName, userRole);

      const incomingMessage: ChatMessage = {
        id: 'msg-1',
        roomId,
        senderId: 'user-2',
        senderName: 'Jane',
        senderRole: 'staff',
        content: 'Hello!',
        timestamp: Date.now(),
        delivered: true,
        read: false
      };

      // Simulate WebSocket message
      mockWebSocketInstance.onmessage!({ data: JSON.stringify({ type: 'message', data: incomingMessage }) });

      expect(onMessage).toHaveBeenCalledWith(incomingMessage);
    });

    it('should cache received messages', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);

      const message: ChatMessage = {
        id: 'msg-1',
        roomId,
        senderId: 'user-2',
        senderName: 'Jane',
        senderRole: 'staff',
        content: 'Test',
        timestamp: Date.now(),
        delivered: true,
        read: false
      };

      mockWebSocketInstance.onmessage!({ data: JSON.stringify({ type: 'message', data: message }) });

      const history = chatManager.getMessageHistory(roomId);
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(message);
    });
  });

  describe('Typing Indicators', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should send typing indicator', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);
      chatManager.sendTyping(true);

      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'typing',
        data: {
          roomId,
          userId,
          userName,
          isTyping: true
        }
      }));
    });

    it('should auto-stop typing after 3 seconds', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);
      chatManager.sendTyping(true);
      expect(mockWebSocketInstance.send).toHaveBeenCalledTimes(2);
      const typingStartCall = mockWebSocketInstance.send.mock.calls[1];
      const sentData = JSON.parse(typingStartCall[0]);
      expect(sentData).toEqual({
        type: 'typing',
        data: {
          roomId,
          userId,
          userName,
          isTyping: true
        }
      });

      vi.advanceTimersByTime(3000);

      expect(mockWebSocketInstance.send).toHaveBeenCalledTimes(3);
      const typingStopCall = mockWebSocketInstance.send.mock.calls[2];
      const stopData = JSON.parse(typingStopCall[0]);
      expect(stopData).toEqual({
        type: 'typing',
        data: expect.objectContaining({
          isTyping: false
        })
      });
    });

    it('should call onTyping handler', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      const onTyping = vi.fn();
      
      chatManager.setEventHandlers({ onTyping });
      chatManager.joinRoom(roomId, userId, userName, userRole);

      const typingData: TypingIndicator = {
        userId: 'user-2',
        userName: 'Jane',
        roomId,
        isTyping: true
      };

      // Simulate WebSocket message
      mockWebSocketInstance.onmessage!({ data: JSON.stringify({ type: 'typing', data: typingData }) });

      expect(onTyping).toHaveBeenCalledWith(typingData);
    });
  });

  describe('Read Receipts', () => {
    it('should send read receipt', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);
      chatManager.markAsRead('msg-1');

      expect(mockWebSocketInstance.send).toHaveBeenCalledTimes(2);
      const readReceiptCall = mockWebSocketInstance.send.mock.calls[1];
      const sentData = JSON.parse(readReceiptCall[0]);
      expect(sentData).toEqual({
        type: 'read_receipt',
        data: {
          messageId: 'msg-1',
          userId,
          readAt: expect.any(Number)
        }
      });
    });

    it('should update message read status in cache', async () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);
      const messageId = chatManager.sendMessage('Test', userId, userName, userRole);
      expect(messageId).toBeTruthy();

      const history = chatManager.getMessageHistory(roomId);
      const message = history.find(m => m.id === messageId);
      expect(message?.read).toBe(false);

      chatManager.markAsRead(messageId!);

      const updatedHistory = chatManager.getMessageHistory(roomId);
      const updatedMessage = updatedHistory.find(m => m.id === messageId);
      expect(updatedMessage?.read).toBe(true);
    });

    it('should call onReadReceipt handler', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      const onReadReceipt = vi.fn();
      
      chatManager.setEventHandlers({ onReadReceipt });
      chatManager.joinRoom(roomId, userId, userName, userRole);

      const receipt: ReadReceipt = {
        messageId: 'msg-1',
        userId: 'user-2',
        readAt: Date.now()
      };

      mockWebSocketInstance.onmessage!({ data: JSON.stringify({ type: 'read_receipt', data: receipt }) });

      expect(onReadReceipt).toHaveBeenCalledWith(receipt);
    });
  });

  describe('Delivery Confirmations', () => {
    it('should send delivery confirmation for received messages', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);

      const message: ChatMessage = {
        id: 'msg-1',
        roomId,
        senderId: 'user-2',
        senderName: 'Jane',
        senderRole: 'staff',
        content: 'Test',
        timestamp: Date.now(),
        delivered: false,
        read: false
      };

      mockWebSocketInstance.onmessage!({ data: JSON.stringify({ type: 'message', data: message }) });

      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'delivered',
        data: { messageId: 'msg-1' }
      }));
    });

    it('should call onDelivered handler', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      const onDelivered = vi.fn();
      
      chatManager.setEventHandlers({ onDelivered });
      chatManager.joinRoom(roomId, userId, userName, userRole);

      mockWebSocketInstance.onmessage!({ data: JSON.stringify({ type: 'delivered', data: { messageId: 'msg-1' } }) });

      expect(onDelivered).toHaveBeenCalledWith('msg-1');
    });

    it('should update message delivered status in cache', async () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);
      const messageId = chatManager.sendMessage('Test', userId, userName, userRole);
      expect(messageId).toBeTruthy();

      const history = chatManager.getMessageHistory(roomId);
      const message = history.find(m => m.id === messageId);
      expect(message?.delivered).toBe(false);

      mockWebSocketInstance.onmessage!({ data: JSON.stringify({ type: 'delivered', data: { messageId: messageId } }) });

      const updatedHistory = chatManager.getMessageHistory(roomId);
      const updatedMessage = updatedHistory.find(m => m.id === messageId);
      expect(updatedMessage?.delivered).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should clear cache on destroy', async () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);
      const messageId = chatManager.sendMessage('Test', userId, userName, userRole);
      expect(messageId).toBeTruthy();

      expect(chatManager.getMessageHistory(roomId)).toHaveLength(1);

      chatManager.destroy();

      expect(chatManager.getMessageHistory(roomId)).toHaveLength(0);
    });

    it('should unsubscribe on destroy', () => {
      const roomId = 'room-123';
      const userId = 'user-1';
      const userName = 'John';
      const userRole = 'patient' as const;
      
      chatManager.joinRoom(roomId, userId, userName, userRole);

      chatManager.destroy();

      expect(mockWebSocketInstance.send).toHaveBeenCalledWith(JSON.stringify({
        type: 'leave',
        data: { roomId, userId }
      }));
    });
  });
});
