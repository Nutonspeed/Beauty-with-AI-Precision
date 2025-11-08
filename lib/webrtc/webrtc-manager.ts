/**
 * WebRTC Stream Manager
 * จัดการ WebRTC connections สำหรับ live streaming และ video calls
 */

export interface RTCConfig {
  iceServers: RTCIceServer[]
  iceTransportPolicy?: RTCIceTransportPolicy
  bundlePolicy?: RTCBundlePolicy
}

export interface StreamOptions {
  video: boolean | MediaTrackConstraints
  audio: boolean | MediaTrackConstraints
}

export type ConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed'

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  
  private onConnectionStateChange?: (state: ConnectionState) => void
  private onRemoteStream?: (stream: MediaStream) => void
  private onError?: (error: Error) => void

  private readonly defaultConfig: RTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  }

  /**
   * เริ่มต้น local media stream
   */
  async startLocalStream(options: StreamOptions = { video: true, audio: false }): Promise<MediaStream> {
    try {
      console.log('[WebRTC] Starting local stream...')
      
      this.localStream = await navigator.mediaDevices.getUserMedia(options)
      
      console.log('[WebRTC] ✅ Local stream started:', {
        videoTracks: this.localStream.getVideoTracks().length,
        audioTracks: this.localStream.getAudioTracks().length
      })
      
      return this.localStream
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to get user media')
      console.error('[WebRTC] Failed to start local stream:', err)
      
      if (this.onError) {
        this.onError(err)
      }
      
      throw err
    }
  }

  /**
   * หยุด local stream
   */
  stopLocalStream(): void {
    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        track.stop()
      }
      this.localStream = null
      console.log('[WebRTC] Local stream stopped')
    }
  }

  /**
   * สร้าง peer connection
   */
  createPeerConnection(config?: Partial<RTCConfig>): RTCPeerConnection {
    const fullConfig = { ...this.defaultConfig, ...config }
    
    this.peerConnection = new RTCPeerConnection(fullConfig)
    
    // Connection state handling
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState as ConnectionState
      console.log('[WebRTC] Connection state:', state)
      
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(state)
      }
    }
    
    // ICE candidate handling
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] New ICE candidate:', event.candidate.candidate)
        // Send to remote peer via signaling server
      }
    }
    
    // Remote stream handling
    this.peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Remote track received:', event.track.kind)
      
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream()
      }
      
      this.remoteStream.addTrack(event.track)
      
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream)
      }
    }
    
    // Add local stream tracks
    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        this.peerConnection.addTrack(track, this.localStream)
      }
    }
    
    console.log('[WebRTC] ✅ Peer connection created')
    
    return this.peerConnection
  }

  /**
   * สร้าง offer (caller side)
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }
    
    try {
      console.log('[WebRTC] Creating offer...')
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      })
      
      await this.peerConnection.setLocalDescription(offer)
      
      console.log('[WebRTC] ✅ Offer created')
      
      return offer
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create offer')
      console.error('[WebRTC] Failed to create offer:', err)
      throw err
    }
  }

  /**
   * สร้าง answer (callee side)
   */
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }
    
    try {
      console.log('[WebRTC] Creating answer...')
      
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      
      const answer = await this.peerConnection.createAnswer()
      
      await this.peerConnection.setLocalDescription(answer)
      
      console.log('[WebRTC] ✅ Answer created')
      
      return answer
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to create answer')
      console.error('[WebRTC] Failed to create answer:', err)
      throw err
    }
  }

  /**
   * Set remote description (answer)
   */
  async setRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }
    
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
      console.log('[WebRTC] ✅ Remote answer set')
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to set remote answer')
      console.error('[WebRTC] Failed to set remote answer:', err)
      throw err
    }
  }

  /**
   * เพิ่ม ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }
    
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      console.log('[WebRTC] ICE candidate added')
      
    } catch (error) {
      console.error('[WebRTC] Failed to add ICE candidate:', error)
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  /**
   * Get connection stats
   */
  async getStats(): Promise<RTCStatsReport | null> {
    if (!this.peerConnection) {
      return null
    }
    
    try {
      return await this.peerConnection.getStats()
    } catch (error) {
      console.error('[WebRTC] Failed to get stats:', error)
      return null
    }
  }

  /**
   * Toggle video track
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks()
      for (const track of videoTracks) {
        track.enabled = enabled
      }
      console.log('[WebRTC] Video toggled:', enabled)
    }
  }

  /**
   * Toggle audio track
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks()
      for (const track of audioTracks) {
        track.enabled = enabled
      }
      console.log('[WebRTC] Audio toggled:', enabled)
    }
  }

  /**
   * Set callbacks
   */
  setCallbacks(callbacks: {
    onConnectionStateChange?: (state: ConnectionState) => void
    onRemoteStream?: (stream: MediaStream) => void
    onError?: (error: Error) => void
  }): void {
    this.onConnectionStateChange = callbacks.onConnectionStateChange
    this.onRemoteStream = callbacks.onRemoteStream
    this.onError = callbacks.onError
  }

  /**
   * ปิด connection
   */
  close(): void {
    console.log('[WebRTC] Closing connection...')
    
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
    
    this.stopLocalStream()
    
    if (this.remoteStream) {
      for (const track of this.remoteStream.getTracks()) {
        track.stop()
      }
      this.remoteStream = null
    }
    
    console.log('[WebRTC] ✅ Connection closed')
  }
}

// Singleton instance
let webRTCInstance: WebRTCManager | null = null

export function getWebRTCManager(): WebRTCManager {
  if (!webRTCInstance) {
    webRTCInstance = new WebRTCManager()
  }
  return webRTCInstance
}
