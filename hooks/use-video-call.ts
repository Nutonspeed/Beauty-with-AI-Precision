// React Hook for Video Call Management
// Manages video call state, lifecycle, and UI interactions

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoCallManager, CallState, ChatMessage, CallEventHandlers } from '@/lib/video/video-call-manager';

export interface UseVideoCallOptions {
  userId: string;
  userName: string;
  userRole: 'doctor' | 'patient' | 'admin';
  socketUrl?: string;
  autoInitialize?: boolean;
}

export interface UseVideoCallReturn {
  // State
  callState: CallState;
  chatMessages: ChatMessage[];
  isInitialized: boolean;
  error: string | null;
  callDuration: number;

  // Actions
  initialize: () => Promise<void>;
  startCall: (callId: string) => Promise<void>;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  sendMessage: (message: string) => void;

  // Manager instance (for advanced usage)
  manager: VideoCallManager | null;
}

export function useVideoCall(options: UseVideoCallOptions): UseVideoCallReturn {
  const [callState, setCallState] = useState<CallState>({
    callId: null,
    status: 'idle',
    participants: [],
    localStream: null,
    remoteStreams: new Map(),
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
    isRecording: false,
    startTime: null,
    duration: 0,
    error: null,
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  const managerRef = useRef<VideoCallManager | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize video call manager
   */
  const initialize = useCallback(async () => {
    try {
      // Check browser support
      if (!VideoCallManager.isSupported()) {
        throw new Error('WebRTC is not supported in this browser');
      }

      // Create manager instance
      const eventHandlers: CallEventHandlers = {
        onCallStarted: (callId) => {
          console.log('[useVideoCall] Call started:', callId);
          updateCallState();
          startDurationTimer();
        },
        onCallEnded: () => {
          console.log('[useVideoCall] Call ended');
          updateCallState();
          stopDurationTimer();
        },
        onParticipantJoined: (participant) => {
          console.log('[useVideoCall] Participant joined:', participant.name);
          updateCallState();
          
          // Add system message
          const systemMessage: ChatMessage = {
            id: `system-${Date.now()}`,
            senderId: 'system',
            senderName: 'System',
            message: `${participant.name} joined the call`,
            timestamp: Date.now(),
            type: 'system',
          };
          setChatMessages((prev) => [...prev, systemMessage]);
        },
        onParticipantLeft: (participantId) => {
          console.log('[useVideoCall] Participant left:', participantId);
          updateCallState();
        },
        onStreamReceived: (participantId, stream) => {
          console.log('[useVideoCall] Stream received from:', participantId);
          updateCallState();
        },
        onChatMessage: (message) => {
          console.log('[useVideoCall] Chat message:', message);
          setChatMessages((prev) => [...prev, message]);
        },
        onError: (error) => {
          console.error('[useVideoCall] Error:', error);
          setError(error.message);
        },
        onConnectionStateChange: (state) => {
          console.log('[useVideoCall] Connection state:', state);
        },
      };

      const manager = new VideoCallManager(
        options.userId,
        options.userName,
        options.userRole,
        {
          socketUrl: options.socketUrl,
        },
        eventHandlers
      );

      await manager.initialize();
      managerRef.current = manager;
      setIsInitialized(true);
      setError(null);

      console.log('[useVideoCall] Initialized successfully');
    } catch (err) {
      console.error('[useVideoCall] Initialization failed:', err);
      setError((err as Error).message);
      setIsInitialized(false);
    }
  }, [options.userId, options.userName, options.userRole, options.socketUrl]);

  /**
   * Update call state from manager
   */
  const updateCallState = useCallback(() => {
    if (managerRef.current) {
      setCallState(managerRef.current.getCallState());
    }
  }, []);

  /**
   * Start duration timer
   */
  const startDurationTimer = useCallback(() => {
    stopDurationTimer(); // Clear any existing timer
    
    durationIntervalRef.current = setInterval(() => {
      if (managerRef.current) {
        setCallDuration(managerRef.current.getCallDuration());
      }
    }, 1000);
  }, []);

  /**
   * Stop duration timer
   */
  const stopDurationTimer = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    setCallDuration(0);
  }, []);

  /**
   * Start video call
   */
  const startCall = useCallback(async (callId: string) => {
    if (!managerRef.current) {
      throw new Error('Manager not initialized');
    }

    try {
      await managerRef.current.startCall(callId);
      updateCallState();
      
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        message: 'Video consultation started',
        timestamp: Date.now(),
        type: 'system',
      };
      setChatMessages([welcomeMessage]);
    } catch (err) {
      console.error('[useVideoCall] Failed to start call:', err);
      setError((err as Error).message);
      throw err;
    }
  }, [updateCallState]);

  /**
   * End video call
   */
  const endCall = useCallback(() => {
    if (!managerRef.current) return;

    managerRef.current.endCall();
    updateCallState();
    setChatMessages([]);
  }, [updateCallState]);

  /**
   * Toggle audio
   */
  const toggleAudio = useCallback(() => {
    if (!managerRef.current) return;

    managerRef.current.toggleAudio();
    updateCallState();
  }, [updateCallState]);

  /**
   * Toggle video
   */
  const toggleVideo = useCallback(() => {
    if (!managerRef.current) return;

    managerRef.current.toggleVideo();
    updateCallState();
  }, [updateCallState]);

  /**
   * Start screen sharing
   */
  const startScreenShare = useCallback(async () => {
    if (!managerRef.current) {
      throw new Error('Manager not initialized');
    }

    try {
      await managerRef.current.startScreenShare();
      updateCallState();
    } catch (err) {
      console.error('[useVideoCall] Failed to start screen share:', err);
      setError((err as Error).message);
      throw err;
    }
  }, [updateCallState]);

  /**
   * Stop screen sharing
   */
  const stopScreenShare = useCallback(() => {
    if (!managerRef.current) return;

    managerRef.current.stopScreenShare();
    updateCallState();
  }, [updateCallState]);

  /**
   * Start recording
   */
  const startRecording = useCallback(() => {
    if (!managerRef.current) return;

    try {
      managerRef.current.startRecording();
      updateCallState();
      
      // Add system message
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        message: 'Recording started',
        timestamp: Date.now(),
        type: 'system',
      };
      setChatMessages((prev) => [...prev, systemMessage]);
    } catch (err) {
      console.error('[useVideoCall] Failed to start recording:', err);
      setError((err as Error).message);
    }
  }, [updateCallState]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(() => {
    if (!managerRef.current) return;

    const blob = managerRef.current.stopRecording();
    if (blob) {
      const filename = `consultation-${Date.now()}.webm`;
      managerRef.current.downloadRecording(blob, filename);
      
      // Add system message
      const systemMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        message: `Recording saved: ${filename}`,
        timestamp: Date.now(),
        type: 'system',
      };
      setChatMessages((prev) => [...prev, systemMessage]);
    }
    
    updateCallState();
  }, [updateCallState]);

  /**
   * Send chat message
   */
  const sendMessage = useCallback((message: string) => {
    if (!managerRef.current) return;

    managerRef.current.sendChatMessage(message);
  }, []);

  /**
   * Auto-initialize on mount
   */
  useEffect(() => {
    if (options.autoInitialize !== false) {
      initialize();
    }

    return () => {
      // Cleanup on unmount
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
      }
      stopDurationTimer();
    };
  }, [options.autoInitialize, initialize, stopDurationTimer]);

  return {
    // State
    callState,
    chatMessages,
    isInitialized,
    error,
    callDuration,

    // Actions
    initialize,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    startRecording,
    stopRecording,
    sendMessage,

    // Manager
    manager: managerRef.current,
  };
}
