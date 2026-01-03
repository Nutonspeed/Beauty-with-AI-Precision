/**
 * Video Call Manager Tests
 * Moderate testing approach - covering critical paths
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VideoCallManager } from '@/lib/video-call-manager';

// Mock WebSocketClient
vi.mock('@/lib/websocket-client', () => ({
  default: {
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
    send: vi.fn(),
    connect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn()
  },
  WebSocketClient: {
    getInstance: vi.fn(() => ({
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      send: vi.fn(),
      connect: vi.fn().mockResolvedValue(undefined),
      on: vi.fn()
    }))
  }
}));

// Mock navigator.mediaDevices
const mockGetUserMedia = vi.fn();
const mockGetDisplayMedia = vi.fn();

Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: mockGetUserMedia,
    getDisplayMedia: mockGetDisplayMedia
  }
});

// Mock MediaRecorder
class MockMediaRecorder {
  ondataavailable: ((event: any) => void) | null = null;
  onstop: (() => void) | null = null;
  state: string = 'inactive';

  constructor(public stream: MediaStream, public options: any) {}

  start(timeslice?: number) {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.onstop) this.onstop();
  }
}

(globalThis as any).MediaRecorder = MockMediaRecorder;

describe('VideoCallManager', () => {
  let manager: VideoCallManager;
  let mockStream: MediaStream;
  let mockVideoTrack: MediaStreamTrack;
  let mockAudioTrack: MediaStreamTrack;

  beforeEach(() => {
    manager = new VideoCallManager();

    // Create mock tracks
    mockVideoTrack = {
      kind: 'video',
      enabled: true,
      stop: vi.fn(),
      onended: null
    } as any;

    mockAudioTrack = {
      kind: 'audio',
      enabled: true,
      stop: vi.fn()
    } as any;

    // Create mock stream
    mockStream = {
      getTracks: vi.fn(() => [mockVideoTrack, mockAudioTrack]),
      getVideoTracks: vi.fn(() => [mockVideoTrack]),
      getAudioTracks: vi.fn(() => [mockAudioTrack])
    } as any;

    mockGetUserMedia.mockResolvedValue(mockStream);
    mockGetDisplayMedia.mockResolvedValue(mockStream);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize call successfully', async () => {
      const handlers = {
        onCallStarted: vi.fn()
      };

      await manager.initializeCall('call-1', 'user-1', 'Test User', handlers);

      expect(mockGetUserMedia).toHaveBeenCalledWith({
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

      expect(handlers.onCallStarted).toHaveBeenCalledWith('call-1');

      const state = manager.getCallState();
      expect(state).toBeTruthy();
      expect(state?.callId).toBe('call-1');
      expect(state?.isActive).toBe(true);
    });

    it('should handle media access error', async () => {
      const error = new Error('Permission denied');
      mockGetUserMedia.mockRejectedValue(error);

      const handlers = {
        onError: vi.fn()
      };

      await expect(
        manager.initializeCall('call-1', 'user-1', 'Test User', handlers)
      ).rejects.toThrow();

      expect(handlers.onError).toHaveBeenCalled();
    });
  });

  describe('Media Controls', () => {
    beforeEach(async () => {
      await manager.initializeCall('call-1', 'user-1', 'Test User', {});
    });

    it('should toggle mute', () => {
      const isMuted = manager.toggleMute();
      
      expect(isMuted).toBe(true);
      expect(mockAudioTrack.enabled).toBe(false);

      const isUnmuted = manager.toggleMute();
      expect(isUnmuted).toBe(false);
      expect(mockAudioTrack.enabled).toBe(true);
    });

    it('should toggle video', () => {
      const isVideoOff = manager.toggleVideo();
      
      expect(isVideoOff).toBe(true);
      expect(mockVideoTrack.enabled).toBe(false);

      const isVideoOn = manager.toggleVideo();
      expect(isVideoOn).toBe(false);
      expect(mockVideoTrack.enabled).toBe(true);
    });
  });

  describe('Screen Sharing', () => {
    beforeEach(async () => {
      await manager.initializeCall('call-1', 'user-1', 'Test User', {});
    });

    it('should start screen share', async () => {
      const screenStream = await manager.startScreenShare();
      
      expect(mockGetDisplayMedia).toHaveBeenCalledWith({
        video: true,
        audio: false
      });
      
      expect(screenStream).toBeTruthy();
    });

    it('should stop screen share', async () => {
      await manager.startScreenShare();
      await manager.stopScreenShare();
      
      expect(mockVideoTrack.stop).toHaveBeenCalled();
    });
  });

  describe('Recording', () => {
    beforeEach(async () => {
      await manager.initializeCall('call-1', 'user-1', 'Test User', {});
    });

    it('should start recording', () => {
      manager.startRecording();
      
      const state = manager.getCallState();
      expect(state?.isRecording).toBe(true);
    });

    it('should stop recording', () => {
      manager.startRecording();
      manager.stopRecording();
      
      const state = manager.getCallState();
      expect(state?.isRecording).toBe(false);
    });
  });

  describe('Call Management', () => {
    it('should leave call and cleanup', async () => {
      const handlers = {
        onCallEnded: vi.fn()
      };

      await manager.initializeCall('call-1', 'user-1', 'Test User', handlers);
      
      manager.leaveCall();

      expect(handlers.onCallEnded).toHaveBeenCalledWith('call-1');
      expect(mockVideoTrack.stop).toHaveBeenCalled();
      expect(mockAudioTrack.stop).toHaveBeenCalled();
      
      const state = manager.getCallState();
      expect(state).toBeNull();
    });

    it('should get local stream', async () => {
      await manager.initializeCall('call-1', 'user-1', 'Test User', {});
      
      const stream = manager.getLocalStream();
      expect(stream).toBe(mockStream);
    });
  });

  describe('Participants', () => {
    it('should track participants in call state', async () => {
      await manager.initializeCall('call-1', 'user-1', 'Test User', {});
      
      const state = manager.getCallState();
      expect(state?.participants.size).toBe(1);
      
      const participant = state?.participants.get('user-1');
      expect(participant).toBeTruthy();
      expect(participant?.userName).toBe('Test User');
      expect(participant?.isMuted).toBe(false);
      expect(participant?.isVideoOff).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should destroy manager and cleanup resources', async () => {
      await manager.initializeCall('call-1', 'user-1', 'Test User', {});
      
      manager.destroy();
      
      expect(mockVideoTrack.stop).toHaveBeenCalled();
      expect(mockAudioTrack.stop).toHaveBeenCalled();
      
      const state = manager.getCallState();
      expect(state).toBeNull();
    });
  });
});
