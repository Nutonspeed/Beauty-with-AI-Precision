// Video Call Manager - WebRTC-based video consultation system
// Supports peer-to-peer video calls, screen sharing, recording, and in-call chat

import SimplePeer, { Instance as SimplePeerInstance, type SignalData } from 'simple-peer';
import { io, Socket } from 'socket.io-client';

export interface VideoCallConfig {
  socketUrl?: string;
  stunServers?: RTCIceServer[];
  turnServers?: RTCIceServer[];
  enableAudio?: boolean;
  enableVideo?: boolean;
  videoConstraints?: MediaTrackConstraints;
  audioConstraints?: MediaTrackConstraints;
}

export interface Participant {
  id: string;
  name: string;
  role: 'doctor' | 'patient' | 'admin';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  stream?: MediaStream;
  peer?: SimplePeerInstance;
}

export interface CallState {
  callId: string | null;
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  participants: Participant[];
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  startTime: number | null;
  duration: number;
  error: string | null;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  type: 'text' | 'system';
}

export interface CallEventHandlers {
  onCallStarted?: (callId: string) => void;
  onCallEnded?: () => void;
  onParticipantJoined?: (participant: Participant) => void;
  onParticipantLeft?: (participantId: string) => void;
  onStreamReceived?: (participantId: string, stream: MediaStream) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onError?: (error: Error) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}

export class VideoCallManager {
  private socket: Socket | null = null;
  private peers: Map<string, SimplePeerInstance> = new Map();
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private config: VideoCallConfig;
  private eventHandlers: CallEventHandlers;
  private callState: CallState;
  private userId: string;
  private userName: string;
  private userRole: 'doctor' | 'patient' | 'admin';

  constructor(
    userId: string,
    userName: string,
    userRole: 'doctor' | 'patient' | 'admin',
    config: VideoCallConfig = {},
    eventHandlers: CallEventHandlers = {}
  ) {
    this.userId = userId;
    this.userName = userName;
    this.userRole = userRole;
    this.config = {
      socketUrl: config.socketUrl || 'http://localhost:3001',
      stunServers: config.stunServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      turnServers: config.turnServers || [],
      enableAudio: config.enableAudio !== false,
      enableVideo: config.enableVideo !== false,
      videoConstraints: config.videoConstraints || {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      },
      audioConstraints: config.audioConstraints || {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    };
    this.eventHandlers = eventHandlers;
    this.callState = this.getInitialState();
  }

  private getInitialState(): CallState {
    return {
      callId: null,
      status: 'idle',
      participants: [],
      localStream: null,
      remoteStreams: new Map(),
      isAudioEnabled: this.config.enableAudio!,
      isVideoEnabled: this.config.enableVideo!,
      isScreenSharing: false,
      isRecording: false,
      startTime: null,
      duration: 0,
      error: null,
    };
  }

  /**
   * Initialize socket connection
   */
  async initialize(): Promise<void> {
    try {
      this.socket = io(this.config.socketUrl!, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupSocketListeners();
      
      console.log('[VideoCall] Manager initialized');
    } catch (error) {
      console.error('[VideoCall] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // User joined room
    this.socket.on('user-joined', ({ userId, userName, userRole }) => {
      console.log('[VideoCall] User joined:', userId);
      
      const participant: Participant = {
        id: userId,
        name: userName,
        role: userRole,
        isAudioEnabled: true,
        isVideoEnabled: true,
        isScreenSharing: false,
      };

      this.callState.participants.push(participant);
      
      if (this.eventHandlers.onParticipantJoined) {
        this.eventHandlers.onParticipantJoined(participant);
      }

      // Initiate peer connection
      this.createPeerConnection(userId, true);
    });

    // User left room
    this.socket.on('user-left', ({ userId }) => {
      console.log('[VideoCall] User left:', userId);
      
      this.removePeer(userId);
      this.callState.participants = this.callState.participants.filter(
        (p) => p.id !== userId
      );

      if (this.eventHandlers.onParticipantLeft) {
        this.eventHandlers.onParticipantLeft(userId);
      }
    });

    // Receive WebRTC signal
    this.socket.on('signal', ({ from, signal }) => {
      console.log('[VideoCall] Signal received from:', from);
      
      const peer = this.peers.get(from);
      if (peer) {
        peer.signal(signal);
      } else {
        // Create peer for incoming connection
        this.createPeerConnection(from, false);
        setTimeout(() => {
          const newPeer = this.peers.get(from);
          if (newPeer) {
            newPeer.signal(signal);
          }
        }, 100);
      }
    });

    // Chat message received
    this.socket.on('chat-message', (message: ChatMessage) => {
      if (this.eventHandlers.onChatMessage) {
        this.eventHandlers.onChatMessage(message);
      }
    });

    // Media state changed (audio/video/screen)
    this.socket.on('media-state-changed', ({ userId, type, enabled }) => {
      const participant = this.callState.participants.find((p) => p.id === userId);
      if (participant) {
        if (type === 'audio') participant.isAudioEnabled = enabled;
        if (type === 'video') participant.isVideoEnabled = enabled;
        if (type === 'screen') participant.isScreenSharing = enabled;
      }
    });

    // Socket connection events
    this.socket.on('connect', () => {
      console.log('[VideoCall] Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[VideoCall] Socket disconnected');
      this.handleCallEnd();
    });

    this.socket.on('error', (error) => {
      console.error('[VideoCall] Socket error:', error);
      this.callState.error = error.message;
      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(error);
      }
    });
  }

  /**
   * Create peer connection
   */
  private createPeerConnection(userId: string, initiator: boolean): void {
    if (this.peers.has(userId)) {
      console.warn('[VideoCall] Peer already exists:', userId);
      return;
    }

    const peer = new SimplePeer({
      initiator,
      stream: this.localStream || undefined,
      trickle: true,
      config: {
        iceServers: [
          ...this.config.stunServers!,
          ...this.config.turnServers!,
        ],
      },
    });

    // Send WebRTC signal
    peer.on('signal', (signal: SignalData) => {
      this.socket?.emit('signal', {
        to: userId,
        signal,
      });
    });

    // Receive remote stream
    peer.on('stream', (stream: MediaStream) => {
      console.log('[VideoCall] Stream received from:', userId);
      
      this.callState.remoteStreams.set(userId, stream);
      
      const participant = this.callState.participants.find((p) => p.id === userId);
      if (participant) {
        participant.stream = stream;
      }

      if (this.eventHandlers.onStreamReceived) {
        this.eventHandlers.onStreamReceived(userId, stream);
      }
    });

    // Connection established
    peer.on('connect', () => {
      console.log('[VideoCall] Peer connected:', userId);
      this.callState.status = 'connected';
    });

    // Connection state change
    peer.on('error', (error: Error) => {
      console.error('[VideoCall] Peer error:', userId, error);
      this.removePeer(userId);
    });

    peer.on('close', () => {
      console.log('[VideoCall] Peer closed:', userId);
      this.removePeer(userId);
    });

    this.peers.set(userId, peer);
  }

  /**
   * Start video call
   */
  async startCall(callId: string): Promise<void> {
    try {
      this.callState.status = 'connecting';
      this.callState.callId = callId;

      // Get local media stream
      await this.getLocalStream();

      // Join room via socket
      this.socket?.emit('join-room', {
        roomId: callId,
        userId: this.userId,
        userName: this.userName,
        userRole: this.userRole,
      });

      this.callState.status = 'connected';
      this.callState.startTime = Date.now();

      if (this.eventHandlers.onCallStarted) {
        this.eventHandlers.onCallStarted(callId);
      }

      console.log('[VideoCall] Call started:', callId);
    } catch (error) {
      console.error('[VideoCall] Failed to start call:', error);
      this.callState.status = 'error';
      this.callState.error = (error as Error).message;
      throw error;
    }
  }

  /**
   * Get local media stream
   */
  private async getLocalStream(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: this.config.enableVideo ? this.config.videoConstraints : false,
        audio: this.config.enableAudio ? this.config.audioConstraints : false,
      });

      this.localStream = stream;
      this.callState.localStream = stream;

      console.log('[VideoCall] Local stream acquired');
      return stream;
    } catch (error) {
      console.error('[VideoCall] Failed to get local stream:', error);
      throw new Error('Failed to access camera/microphone. Please check permissions.');
    }
  }

  /**
   * End video call
   */
  endCall(): void {
    try {
      // Notify server
      if (this.socket && this.callState.callId) {
        this.socket.emit('leave-room', {
          roomId: this.callState.callId,
          userId: this.userId,
        });
      }

      this.handleCallEnd();

      if (this.eventHandlers.onCallEnded) {
        this.eventHandlers.onCallEnded();
      }

      console.log('[VideoCall] Call ended');
    } catch (error) {
      console.error('[VideoCall] Failed to end call:', error);
    }
  }

  /**
   * Handle call end cleanup
   */
  private handleCallEnd(): void {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Stop screen stream
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }

    // Stop recording
    if (this.callState.isRecording) {
      this.stopRecording();
    }

    // Close all peer connections
    this.peers.forEach((peer) => peer.destroy());
    this.peers.clear();

    // Clear remote streams
    this.callState.remoteStreams.clear();

    // Reset state
    this.callState = this.getInitialState();
  }

  /**
   * Toggle audio
   */
  toggleAudio(): boolean {
    if (!this.localStream) return false;

    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) return false;

    const enabled = !audioTracks[0].enabled;
    audioTracks.forEach((track) => {
      track.enabled = enabled;
    });

    this.callState.isAudioEnabled = enabled;

    // Notify other participants
    this.socket?.emit('media-state-change', {
      roomId: this.callState.callId,
      userId: this.userId,
      type: 'audio',
      enabled,
    });

    console.log('[VideoCall] Audio', enabled ? 'enabled' : 'disabled');
    return enabled;
  }

  /**
   * Toggle video
   */
  toggleVideo(): boolean {
    if (!this.localStream) return false;

    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) return false;

    const enabled = !videoTracks[0].enabled;
    videoTracks.forEach((track) => {
      track.enabled = enabled;
    });

    this.callState.isVideoEnabled = enabled;

    // Notify other participants
    this.socket?.emit('media-state-change', {
      roomId: this.callState.callId,
      userId: this.userId,
      type: 'video',
      enabled,
    });

    console.log('[VideoCall] Video', enabled ? 'enabled' : 'disabled');
    return enabled;
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<void> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        } as MediaTrackConstraints,
        audio: false,
      });

      this.screenStream = screenStream;
      this.callState.isScreenSharing = true;

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      this.peers.forEach((peer) => {
        const sender = (peer as any)._pc
          .getSenders()
          .find((s: RTCRtpSender) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      // Notify other participants
      this.socket?.emit('media-state-change', {
        roomId: this.callState.callId,
        userId: this.userId,
        type: 'screen',
        enabled: true,
      });

      console.log('[VideoCall] Screen sharing started');
    } catch (error) {
      console.error('[VideoCall] Failed to start screen share:', error);
      throw error;
    }
  }

  /**
   * Stop screen sharing
   */
  stopScreenShare(): void {
    if (!this.screenStream) return;

    // Stop screen stream
    this.screenStream.getTracks().forEach((track) => track.stop());
    this.screenStream = null;
    this.callState.isScreenSharing = false;

    // Restore camera video
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        this.peers.forEach((peer) => {
          const sender = (peer as any)._pc
            .getSenders()
            .find((s: RTCRtpSender) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });
      }
    }

    // Notify other participants
    this.socket?.emit('media-state-change', {
      roomId: this.callState.callId,
      userId: this.userId,
      type: 'screen',
      enabled: false,
    });

    console.log('[VideoCall] Screen sharing stopped');
  }

  /**
   * Start recording
   */
  startRecording(): void {
    try {
      if (!this.localStream) {
        throw new Error('No local stream available');
      }

      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      };

      this.mediaRecorder = new MediaRecorder(this.localStream, options);
      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Record in 1-second chunks
      this.callState.isRecording = true;

      console.log('[VideoCall] Recording started');
    } catch (error) {
      console.error('[VideoCall] Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and download
   */
  stopRecording(): Blob | null {
    if (!this.mediaRecorder || !this.callState.isRecording) {
      return null;
    }

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: 'video/webm',
        });

        this.callState.isRecording = false;
        this.recordedChunks = [];

        console.log('[VideoCall] Recording stopped');
        resolve(blob);
      };

      this.mediaRecorder!.stop();
    }) as any;
  }

  /**
   * Download recorded video
   */
  downloadRecording(blob: Blob, filename = 'consultation.webm'): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Send chat message
   */
  sendChatMessage(message: string): void {
    if (!this.socket || !this.callState.callId) return;

    const chatMessage: ChatMessage = {
      id: `${this.userId}-${Date.now()}`,
      senderId: this.userId,
      senderName: this.userName,
      message,
      timestamp: Date.now(),
      type: 'text',
    };

    this.socket.emit('chat-message', {
      roomId: this.callState.callId,
      message: chatMessage,
    });
  }

  /**
   * Remove peer connection
   */
  private removePeer(userId: string): void {
    const peer = this.peers.get(userId);
    if (peer) {
      peer.destroy();
      this.peers.delete(userId);
    }

    this.callState.remoteStreams.delete(userId);
  }

  /**
   * Get current call state
   */
  getCallState(): CallState {
    return { ...this.callState };
  }

  /**
   * Get call duration
   */
  getCallDuration(): number {
    if (!this.callState.startTime) return 0;
    return Math.floor((Date.now() - this.callState.startTime) / 1000);
  }

  /**
   * Check if browser supports WebRTC
   */
  static isSupported(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    const { mediaDevices } = navigator;
    return (
      typeof mediaDevices !== 'undefined' &&
      typeof mediaDevices.getUserMedia === 'function' &&
      typeof window.RTCPeerConnection !== 'undefined'
    );
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.handleCallEnd();
    
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('[VideoCall] Manager destroyed');
  }
}
