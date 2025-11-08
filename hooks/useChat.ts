/**
 * React hooks for Chat functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChatManager,
  getChatManager,
  Message,
  Conversation,
  TypingIndicator,
  OnlineStatus,
  MessageFilter,
  ConversationFilter,
} from '@/lib/chat/chat-manager';

interface UseChatState {
  connected: boolean;
  error: string | null;
  loading: boolean;
}

interface UseMessagesState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

interface UseConversationsState {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
}

interface UseTypingState {
  typingUsers: Map<string, TypingIndicator[]>; // conversationId -> TypingIndicator[]
}

interface UseOnlineStatusState {
  onlineUsers: Map<string, OnlineStatus>; // userId -> OnlineStatus
}

/**
 * Main chat hook - manages connection and provides chat manager
 */
export function useChat(userId: string) {
  const [state, setState] = useState<UseChatState>({
    connected: false,
    error: null,
    loading: true,
  });

  const chatManagerRef = useRef<ChatManager | null>(null);

  useEffect(() => {
    const chatManager = getChatManager(userId);
    chatManagerRef.current = chatManager;

    // Connect to WebSocket
    chatManager.connect()
      .then(() => {
        setState({ connected: true, error: null, loading: false });
      })
      .catch((error) => {
        setState({ connected: false, error: error.message, loading: false });
      });

    // Handle disconnection
    const handleDisconnect = () => {
      setState({ connected: false, error: 'Disconnected from server', loading: false });
    };

    window.addEventListener('chat:disconnected', handleDisconnect);

    // Cleanup
    return () => {
      window.removeEventListener('chat:disconnected', handleDisconnect);
      // Don't disconnect here - keep connection alive
    };
  }, [userId]);

  return {
    chatManager: chatManagerRef.current,
    connected: state.connected,
    error: state.error,
    loading: state.loading,
  };
}

/**
 * Hook for managing messages in a conversation
 */
export function useMessages(conversationId: string, userId: string) {
  const [state, setState] = useState<UseMessagesState>({
    messages: [],
    loading: true,
    error: null,
    hasMore: true,
  });

  const chatManagerRef = useRef<ChatManager | null>(null);

  useEffect(() => {
    chatManagerRef.current = getChatManager(userId);
  }, [userId]);

  // Load messages
  const loadMessages = useCallback(async (offset: number = 0) => {
    if (!chatManagerRef.current) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const filter: MessageFilter = {
        conversationId,
        limit: 50,
        offset,
      };

      const messages = await chatManagerRef.current.getMessages(filter);

      setState(prev => ({
        ...prev,
        messages: offset === 0 ? messages : [...prev.messages, ...messages],
        loading: false,
        hasMore: messages.length === 50,
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
    }
  }, [conversationId]);

  // Send message
  const sendMessage = useCallback(async (content: string, replyTo?: string) => {
    if (!chatManagerRef.current) return;

    try {
      const message = await chatManagerRef.current.sendMessage(conversationId, content, replyTo);
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
      return message;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, [conversationId]);

  // Send file
  const sendFile = useCallback(async (file: File, caption?: string) => {
    if (!chatManagerRef.current) return;

    try {
      const message = await chatManagerRef.current.sendFile(conversationId, file, caption);
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, message],
      }));
      return message;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, [conversationId]);

  // Edit message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!chatManagerRef.current) return;

    try {
      const updatedMessage = await chatManagerRef.current.editMessage(messageId, newContent);
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m => m.id === messageId ? updatedMessage : m),
      }));
      return updatedMessage;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!chatManagerRef.current) return;

    try {
      await chatManagerRef.current.deleteMessage(messageId);
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== messageId),
      }));
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  // Add reaction
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!chatManagerRef.current) return;

    try {
      await chatManagerRef.current.addReaction(messageId, emoji);
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  // Mark as read
  const markAsRead = useCallback(async (messageId: string) => {
    if (!chatManagerRef.current) return;

    try {
      await chatManagerRef.current.markAsRead(messageId);
    } catch (error: any) {
      console.error('Error marking message as read:', error);
    }
  }, []);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (event: CustomEvent) => {
      const message = event.detail as Message;
      if (message.conversationId === conversationId) {
        setState(prev => {
          // Avoid duplicates
          if (prev.messages.some(m => m.id === message.id)) {
            return prev;
          }
          return {
            ...prev,
            messages: [...prev.messages, message],
          };
        });
      }
    };

    const handleMessageEdit = (event: CustomEvent) => {
      const { messageId, content } = event.detail;
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m =>
          m.id === messageId ? { ...m, content, edited: true, updatedAt: new Date() } : m
        ),
      }));
    };

    const handleMessageDelete = (event: CustomEvent) => {
      const { messageId } = event.detail;
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(m => m.id !== messageId),
      }));
    };

    const handleReaction = (event: CustomEvent) => {
      const { messageId, reaction } = event.detail;
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m => {
          if (m.id === messageId) {
            const reactions = m.reactions || [];
            // Remove existing reaction from same user
            const filtered = reactions.filter(r => r.userId !== reaction.userId);
            return { ...m, reactions: [...filtered, reaction] };
          }
          return m;
        }),
      }));
    };

    window.addEventListener('chat:message', handleNewMessage as EventListener);
    window.addEventListener('chat:message:edit', handleMessageEdit as EventListener);
    window.addEventListener('chat:message:delete', handleMessageDelete as EventListener);
    window.addEventListener('chat:reaction', handleReaction as EventListener);

    return () => {
      window.removeEventListener('chat:message', handleNewMessage as EventListener);
      window.removeEventListener('chat:message:edit', handleMessageEdit as EventListener);
      window.removeEventListener('chat:message:delete', handleMessageDelete as EventListener);
      window.removeEventListener('chat:reaction', handleReaction as EventListener);
    };
  }, [conversationId]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    sendMessage,
    sendFile,
    editMessage,
    deleteMessage,
    addReaction,
    markAsRead,
    loadMore: () => loadMessages(state.messages.length),
  };
}

/**
 * Hook for managing conversations list
 */
export function useConversations(userId: string) {
  const [state, setState] = useState<UseConversationsState>({
    conversations: [],
    loading: true,
    error: null,
  });

  const chatManagerRef = useRef<ChatManager | null>(null);

  useEffect(() => {
    chatManagerRef.current = getChatManager(userId);
  }, [userId]);

  const loadConversations = useCallback(async (filter?: ConversationFilter) => {
    if (!chatManagerRef.current) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const conversations = await chatManagerRef.current.getConversations(
        filter || { userId }
      );

      setState({
        conversations,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState({
        conversations: [],
        loading: false,
        error: error.message,
      });
    }
  }, [userId]);

  const createConversation = useCallback(async (
    type: Conversation['type'],
    participants: string[],
    name?: string,
    metadata?: Conversation['metadata']
  ) => {
    if (!chatManagerRef.current) return;

    try {
      const conversation = await chatManagerRef.current.createConversation(
        type,
        participants,
        name,
        metadata
      );

      setState(prev => ({
        ...prev,
        conversations: [conversation, ...prev.conversations],
      }));

      return conversation;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  const updateConversation = useCallback(async (
    conversationId: string,
    updates: Partial<Pick<Conversation, 'name' | 'muted' | 'pinned' | 'archived'>>
  ) => {
    if (!chatManagerRef.current) return;

    try {
      const updated = await chatManagerRef.current.updateConversation(conversationId, updates);

      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c =>
          c.id === conversationId ? updated : c
        ),
      }));

      return updated;
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations: state.conversations,
    loading: state.loading,
    error: state.error,
    createConversation,
    updateConversation,
    refresh: loadConversations,
  };
}

/**
 * Hook for typing indicators
 */
export function useTyping(conversationId: string) {
  const [state, setState] = useState<UseTypingState>({
    typingUsers: new Map(),
  });

  useEffect(() => {
    const handleTyping = (event: CustomEvent) => {
      const indicator = event.detail as TypingIndicator;
      
      if (indicator.conversationId === conversationId) {
        setState(prev => {
          const newMap = new Map(prev.typingUsers);
          const users = newMap.get(conversationId) || [];
          
          if (indicator.isTyping) {
            // Add or update
            const filtered = users.filter(u => u.userId !== indicator.userId);
            newMap.set(conversationId, [...filtered, indicator]);
          } else {
            // Remove
            const filtered = users.filter(u => u.userId !== indicator.userId);
            newMap.set(conversationId, filtered);
          }
          
          return { typingUsers: newMap };
        });
      }
    };

    window.addEventListener('chat:typing', handleTyping as EventListener);

    return () => {
      window.removeEventListener('chat:typing', handleTyping as EventListener);
    };
  }, [conversationId]);

  const typingUsers = state.typingUsers.get(conversationId) || [];

  return {
    typingUsers,
    isTyping: typingUsers.length > 0,
    typingText: typingUsers.length === 1
      ? `${typingUsers[0].userName} is typing...`
      : typingUsers.length === 2
      ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
      : typingUsers.length > 2
      ? `${typingUsers.length} people are typing...`
      : '',
  };
}

/**
 * Hook for online status
 */
export function useOnlineStatus(userIds: string[], currentUserId: string) {
  const [state, setState] = useState<UseOnlineStatusState>({
    onlineUsers: new Map(),
  });

  const chatManagerRef = useRef<ChatManager | null>(null);

  useEffect(() => {
    chatManagerRef.current = getChatManager(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    const loadOnlineStatus = async () => {
      if (!chatManagerRef.current) return;

      const statuses = await chatManagerRef.current.getOnlineUsers(userIds);
      const statusMap = new Map(statuses.map(s => [s.userId, s]));
      setState({ onlineUsers: statusMap });
    };

    loadOnlineStatus();

    // Listen for online/offline events
    const handleUserOnline = (event: CustomEvent) => {
      const { userId } = event.detail;
      setState(prev => {
        const newMap = new Map(prev.onlineUsers);
        newMap.set(userId, { userId, online: true, lastSeen: new Date() });
        return { onlineUsers: newMap };
      });
    };

    const handleUserOffline = (event: CustomEvent) => {
      const { userId, lastSeen } = event.detail;
      setState(prev => {
        const newMap = new Map(prev.onlineUsers);
        newMap.set(userId, { userId, online: false, lastSeen });
        return { onlineUsers: newMap };
      });
    };

    window.addEventListener('chat:user:online', handleUserOnline as EventListener);
    window.addEventListener('chat:user:offline', handleUserOffline as EventListener);

    return () => {
      window.removeEventListener('chat:user:online', handleUserOnline as EventListener);
      window.removeEventListener('chat:user:offline', handleUserOffline as EventListener);
    };
  }, [userIds]);

  return {
    onlineUsers: state.onlineUsers,
    isOnline: (userId: string) => state.onlineUsers.get(userId)?.online || false,
    getLastSeen: (userId: string) => state.onlineUsers.get(userId)?.lastSeen,
  };
}
