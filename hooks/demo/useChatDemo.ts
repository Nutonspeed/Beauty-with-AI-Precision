'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChatManager, type ChatMessage, type TypingIndicator, type ReadReceipt } from '@/lib/chat-manager';

interface UseChatDemoOptions {
  roomId: string;
  userId: string;
  userName: string;
  userRole: 'staff' | 'patient';
}

interface ChatEventHandlers {
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (typing: TypingIndicator) => void;
  onReadReceipt?: (receipt: ReadReceipt) => void;
  onDelivered?: (messageId: string) => void;
}

type NewChatMessage = Omit<ChatMessage, 'id' | 'timestamp' | 'read' | 'delivered'> & {
  id?: string;
  timestamp?: number;
  read?: boolean;
  delivered?: boolean;
};

export function useChatDemo({ roomId, userId, userName, userRole }: UseChatDemoOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const chatManagerRef = useRef<ChatManager | null>(null);

  const sendMessage = useCallback((content: string) => {
    if (!chatManagerRef.current) return null;

    const message: NewChatMessage = {
      content,
      roomId,
      senderId: userId,
      senderName: userName,
      senderRole: userRole,
      timestamp: Date.now(),
      read: false,
      delivered: false,
    };

    try {
      chatManagerRef.current.sendMessage(message.content, userId, userName, userRole);

      return {
        ...message,
        id: `temp-${Date.now()}`,
        timestamp: message.timestamp || Date.now(),
        read: false,
        delivered: false,
      } as ChatMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    }
  }, [roomId, userId, userName, userRole]);

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!chatManagerRef.current) return;
    chatManagerRef.current.sendTyping(isTyping);
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    if (!chatManagerRef.current) return;

    try {
      const readReceipt = {
        type: 'read_receipt',
        data: {
          messageId,
          userId,
          readAt: Date.now(),
        },
      };

      // @ts-ignore legacy demo manager
      chatManagerRef.current.sendMessage?.(JSON.stringify(readReceipt));

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? { ...msg, read: true }
            : msg,
        ),
      );
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }, [userId]);

  useEffect(() => {
    const chatManager = new ChatManager();
    chatManagerRef.current = chatManager;

    const handleMessage = (message: ChatMessage) => {
      setMessages((prevMessages) => {
        if (prevMessages.some((m) => m.id === message.id)) {
          return prevMessages;
        }

        return [...prevMessages, message].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      });

      if (message.senderId !== userId && message.id) {
        setTimeout(() => {
          markAsRead(message.id!);
        }, 1000);
      }
    };

    const handleTyping = (typing: TypingIndicator) => {
      if (typing.userId === userId) return;

      setTypingUsers((prev) => {
        const updated = new Map(prev);
        if (typing.isTyping) {
          updated.set(typing.userId, typing.userName);

          setTimeout(() => {
            setTypingUsers((current) => {
              const currentTypingUsers = new Map(current);
              currentTypingUsers.delete(typing.userId);
              return currentTypingUsers;
            });
          }, 3000);
        } else {
          updated.delete(typing.userId);
        }
        return updated;
      });
    };

    const handleReadReceipt = (receipt: ReadReceipt) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === receipt.messageId
            ? { ...msg, read: true }
            : msg,
        ),
      );
    };

    const handleDelivered = (messageId: string) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? { ...msg, delivered: true }
            : msg,
        ),
      );
    };

    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'message':
            handleMessage(data.data as ChatMessage);
            break;
          case 'typing':
            handleTyping(data.data as TypingIndicator);
            break;
          case 'read_receipt':
            handleReadReceipt(data.data as ReadReceipt);
            break;
          case 'delivered':
            handleDelivered(data.data.messageId);
            break;
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };

    const setupWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:3001');

        ws.onopen = () => {
          setIsConnected(true);
          ws.send(JSON.stringify({
            type: 'join',
            data: { roomId, userId, userName, userRole },
          }));
        };

        ws.onmessage = handleWebSocketMessage;

        ws.onclose = () => {
          setIsConnected(false);
          setTimeout(setupWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          ws.close();
        };

        return ws;
      } catch (error) {
        console.error('Failed to set up WebSocket:', error);
        return null;
      }
    };

    const ws = setupWebSocket();

    const chatManagerAny = chatManager as any;
    chatManagerAny.ws = ws;
    chatManagerAny.sendMessage = (message: string) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    };

    return () => {
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'leave',
            data: { roomId, userId },
          }));
        }
        ws.close();
      }

      setIsConnected(false);
    };
  }, [roomId, userId, userName, userRole, markAsRead]);

  return {
    messages,
    typingUsers: Array.from(typingUsers.values()),
    isConnected,
    sendMessage,
    sendTypingStatus,
    markAsRead,
  };
}
