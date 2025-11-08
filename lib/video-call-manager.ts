/**
 * Video Call Manager
 * WebRTC-based video call system for telemedicine
 */

import wsClient, { type WebSocketClient } from './websocket-client';

export interface CallParticipant {
  userId: string;
  userName: string;
  stream?: MediaStream;
  isMuted: boolean;
  isVideoOff: boolean;
}

export interface CallState {
  callId: string;
  participants: Map<string, CallParticipant>;
  isActive: boolean;
  startTime: number;
  isRecording: boolean;
}

interface VideoCallEventHandlers {
  onCallStarted?: (callId: string) => void;
  onCallEnded?: (callId: string) => void;
  onParticipantJoined?: (participant: CallParticipant) => void;
  onParticipantLeft?: (userId: string) => void;
  onStreamAdded?: (userId: string, stream: MediaStream) => void;
  onStreamRemoved?: (userId: string) => void;
  onError?: (error: Error) => void;
}

export class VideoCallManager {
  private wsClient: WebSocketClient;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private callState: CallState | null = null;
  private handlers: VideoCallEventHandlers = {};
  private currentUserId: string | null = null;
  private currentUserName: string | null = null;

  // ICE servers configuration
  private readonly ICE_SERVERS: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor() {
    this.wsClient = wsClient;
    
    // Set up message handler
    this.wsClient.on('message', (message: any) => {
      if (message.type === 'video_call') {
        this.handleCallMessage(message.data);
      }
    });
  }

  /**
   * Initialize video call
   */
  private handleCallMessageBound = (message: any) => {
    if (message.type && message.type.startsWith('call:')) {
      this.handleCallMessage(message.data || message);
    } else if (message.data && message.data.type === 'video_call') {
      this.handleCallMessage(message.data);
    } else if (message.type === 'video_call') {
      this.handleCallMessage(message);
    }
  };

  async initializeCall(
    callId: string,
    userId: string,
    userName: string,
    handlers: VideoCallEventHandlers
  ): Promise<void> {
    this.currentUserId = userId;
    this.currentUserName = userName;
    this.handlers = handlers;

    // Subscribe to call channel
    this.wsClient.on('message', this.handleCallMessageBound);
    
    // Notify server about joining the call
    this.wsClient.send('call_join', {
      callId,
      userId,
      userName,
      timestamp: Date.now()
    });

    // Get local media stream
    try {
      this.localStream = await this.getUserMediaStream();
      
      this.callState = {
        callId,
        participants: new Map(),
        isActive: true,
        startTime: Date.now(),
        isRecording: false
      };

      // Add self as participant
      this.callState.participants.set(userId, {
        userId,
        userName,
        stream: this.localStream || undefined,
        isMuted: false,
        isVideoOff: false
      });

      // Notify others that we joined
      this.wsClient.send('call_join', {
        callId,
        userId,
        userName,
        timestamp: Date.now()
      });

      if (this.handlers.onCallStarted) {
        this.handlers.onCallStarted(callId);
      }

      console.log(`[VideoCall] Initialized call: ${callId}`);
    } catch (error) {
      console.error('[VideoCall] Failed to initialize:', error);
      if (this.handlers.onError) {
        this.handlers.onError(error as Error);
      }
      throw error;
    }
  }

  /**
   * Get user media stream from camera/microphone
   */
  private async getUserMediaStream(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      return stream;
    } catch (error) {
      console.error('[VideoCall] Failed to get media stream:', error);
      throw new Error('Camera/microphone access denied');
    }
  }

  /**
   * Create peer connection for a participant
   */
  private async createPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection(this.ICE_SERVERS);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.wsClient.send('ice_candidate', {
          callId: this.callState?.callId,
          targetUserId: participantId,
          candidate: event.candidate,
          timestamp: Date.now()
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      
      if (this.callState) {
        const participant = this.callState.participants.get(participantId);
        if (participant) {
          participant.stream = remoteStream;
        }
      }

      if (this.handlers.onStreamAdded) {
        this.handlers.onStreamAdded(participantId, remoteStream);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`[VideoCall] Connection state: ${pc.connectionState}`);
      
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.handleParticipantDisconnect(participantId);
      }
    };

    this.peerConnections.set(participantId, pc);
    return pc;
  }

  /**
   * Handle incoming call messages
   */
  private async handleCallMessage(data: any): Promise<void> {
    switch (data.type) {
      case 'call_join':
        await this.handleParticipantJoin(data.data);
        break;
      case 'call_leave':
        this.handleParticipantLeave(data.data);
        break;
      case 'offer':
        await this.handleOffer(data.data);
        break;
      case 'answer':
        await this.handleAnswer(data.data);
        break;
      case 'ice_candidate':
        await this.handleIceCandidate(data.data);
        break;
      case 'mute_toggle':
        this.handleMuteToggle(data.data);
        break;
      case 'video_toggle':
        this.handleVideoToggle(data.data);
        break;
    }
  }

  /**
   * Handle participant join
   */
  private async handleParticipantJoin(data: {
    userId: string;
    userName: string;
  }): Promise<void> {
    // Don't process own join
    if (data.userId === this.currentUserId) return;

    console.log(`[VideoCall] Participant joined: ${data.userName}`);

    // Add participant to state
    if (this.callState) {
      this.callState.participants.set(data.userId, {
        userId: data.userId,
        userName: data.userName,
        isMuted: false,
        isVideoOff: false
      });
    }

    // Create peer connection and send offer
    const pc = await this.createPeerConnection(data.userId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    this.wsClient.send('offer', {
      callId: this.callState?.callId,
      targetUserId: data.userId,
      offer: offer,
      timestamp: Date.now()
    });

    if (this.handlers.onParticipantJoined) {
      this.handlers.onParticipantJoined({
        userId: data.userId,
        userName: data.userName,
        isMuted: false,
        isVideoOff: false
      });
    }
  }

  /**
   * Handle participant leave
   */
  private handleParticipantLeave(data: { userId: string }): void {
    console.log(`[VideoCall] Participant left: ${data.userId}`);

    // Close peer connection
    const pc = this.peerConnections.get(data.userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(data.userId);
    }

    // Remove from participants
    if (this.callState) {
      this.callState.participants.delete(data.userId);
    }

    if (this.handlers.onParticipantLeft) {
      this.handlers.onParticipantLeft(data.userId);
    }

    if (this.handlers.onStreamRemoved) {
      this.handlers.onStreamRemoved(data.userId);
    }
  }

  /**
   * Handle WebRTC offer
   */
  private async handleOffer(data: {
    userId: string;
    offer: RTCSessionDescriptionInit;
  }): Promise<void> {
    const pc = await this.createPeerConnection(data.userId);
    await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.wsClient.send('answer', {
      callId: this.callState?.callId,
      targetUserId: data.userId,
      answer: answer,
      timestamp: Date.now()
    });
  }

  /**
   * Handle WebRTC answer
   */
  private async handleAnswer(data: {
    userId: string;
    answer: RTCSessionDescriptionInit;
  }): Promise<void> {
    const pc = this.peerConnections.get(data.userId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  }

  /**
   * Handle ICE candidate
   */
  private async handleIceCandidate(data: {
    userId: string;
    candidate: RTCIceCandidateInit;
  }): Promise<void> {
    const pc = this.peerConnections.get(data.userId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  }

  /**
   * Toggle microphone mute
   */
  toggleMute(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      
      // Update participant state
      if (this.callState && this.currentUserId) {
        const self = this.callState.participants.get(this.currentUserId);
        if (self) {
          self.isMuted = !audioTrack.enabled;
        }
      }

      // Notify others
      this.wsClient.send('mute_toggle', {
        callId: this.callState?.callId,
        userId: this.currentUserId,
        isMuted: !audioTrack.enabled,
        timestamp: Date.now()
      });

      return !audioTrack.enabled;
    }

    return false;
  }

  /**
   * Handle mute toggle from other participants
   */
  private handleMuteToggle(data: { userId: string; isMuted: boolean }): void {
    if (this.callState) {
      const participant = this.callState.participants.get(data.userId);
      if (participant) {
        participant.isMuted = data.isMuted;
      }
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(): boolean {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      
      // Update participant state
      if (this.callState && this.currentUserId) {
        const self = this.callState.participants.get(this.currentUserId);
        if (self) {
          self.isVideoOff = !videoTrack.enabled;
        }
      }

      // Notify others
      this.wsClient.send('video_toggle', {
        callId: this.callState?.callId,
        userId: this.currentUserId,
        isVideoOff: !videoTrack.enabled,
        timestamp: Date.now()
      });

      return !videoTrack.enabled;
    }

    return false;
  }

  /**
   * Handle video toggle from other participants
   */
  private handleVideoToggle(data: { userId: string; isVideoOff: boolean }): void {
    if (this.callState) {
      const participant = this.callState.participants.get(data.userId);
      if (participant) {
        participant.isVideoOff = data.isVideoOff;
      }
    }
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<MediaStream> {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      // Replace video track in all peer connections
      const videoTrack = this.screenStream.getVideoTracks()[0];
      
      for (const [userId, pc] of this.peerConnections) {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }

      // Handle screen share ended
      videoTrack.onended = () => {
        this.stopScreenShare();
      };

      return this.screenStream;
    } catch (error) {
      console.error('[VideoCall] Failed to start screen share:', error);
      throw error;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    if (!this.screenStream) return;

    // Stop screen stream
    this.screenStream.getTracks().forEach(track => track.stop());
    this.screenStream = null;

    // Restore camera video track
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      
      for (const [userId, pc] of this.peerConnections) {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
      }
    }
  }

  /**
   * Start recording the call
   */
  startRecording(): void {
    if (!this.localStream) return;

    try {
      // Create a new stream with all tracks
      const tracks: MediaStreamTrack[] = [];
      
      // Add local stream tracks
      this.localStream.getTracks().forEach(track => tracks.push(track));
      
      // Add remote stream tracks
      for (const participant of this.callState?.participants.values() || []) {
        if (participant.stream && participant.userId !== this.currentUserId) {
          participant.stream.getTracks().forEach(track => tracks.push(track));
        }
      }

      const recordStream = new MediaStream(tracks);
      
      this.mediaRecorder = new MediaRecorder(recordStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second

      if (this.callState) {
        this.callState.isRecording = true;
      }

      console.log('[VideoCall] Recording started');
    } catch (error) {
      console.error('[VideoCall] Failed to start recording:', error);
    }
  }

  /**
   * Stop recording and download
   */
  stopRecording(): void {
    if (!this.mediaRecorder) return;

    this.mediaRecorder.stop();
    
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `call-${this.callState?.callId}-${Date.now()}.webm`;
      a.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
      this.recordedChunks = [];
    };

    if (this.callState) {
      this.callState.isRecording = false;
    }

    console.log('[VideoCall] Recording stopped');
  }

  /**
   * Get call state
   */
  getCallState(): CallState | null {
    return this.callState;
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get participant stream
   */
  getParticipantStream(userId: string): MediaStream | undefined {
    return this.callState?.participants.get(userId)?.stream;
  }

  /**
   * Handle participant disconnect
   */
  private handleParticipantDisconnect(userId: string): void {
    console.log(`[VideoCall] Participant disconnected: ${userId}`);
    this.handleParticipantLeave({ userId });
  }

  /**
   * Leave call
   */
  leaveCall(): void {
    if (!this.callState) return;

    const callId = this.callState.callId;

    // Call onCallEnded before cleanup
    if (this.handlers.onCallEnded) {
      this.handlers.onCallEnded(callId);
    }

    // Notify others
    this.wsClient.send('call_leave', {
      callId: callId,
      userId: this.currentUserId,
      timestamp: Date.now()
    });

    this.cleanup();

    console.log('[VideoCall] Left call');
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    // Close all peer connections
    for (const pc of this.peerConnections.values()) {
      pc.close();
    }
    this.peerConnections.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Stop screen stream
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;
    }

    // Stop recording
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    // Remove message handler instead of unsubscribe
    if (this.wsClient.off) {
      this.wsClient.off('message', this.handleCallMessageBound);
    }

    this.callState = null;
    this.currentUserId = null;
    this.currentUserName = null;
    this.handlers = {};
  }

  /**
   * Destroy manager
   */
  destroy(): void {
    this.cleanup();
    // Remove all event listeners
    if (this.wsClient.off) {
      this.wsClient.off('message', this.handleCallMessageBound);
    }
    this.callState = null;
    this.currentUserId = null;
    this.currentUserName = null;
  }
}
