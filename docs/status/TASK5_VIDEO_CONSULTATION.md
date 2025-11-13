# Task 5: Video Consultation System - Complete Documentation

## Overview
Full-featured video consultation system using WebRTC for real-time peer-to-peer video calls, screen sharing, recording, and in-call chat.

## Architecture

### Core Components

1. **VideoCallManager** (`lib/video/video-call-manager.ts`)
   - WebRTC peer connection management
   - Socket.IO signaling server integration
   - Media stream handling (audio/video/screen)
   - Recording with MediaRecorder API
   - Chat message routing

2. **useVideoCall Hook** (`hooks/use-video-call.ts`)
   - React state management for call lifecycle
   - Event handling and callbacks
   - Auto-initialization support
   - Call duration tracking

3. **VideoConsultation Component** (`components/video-consultation.tsx`)
   - Main video call UI
   - Local and remote video streams
   - Call controls (mute, camera, screen share, hang up)
   - Participant status display

4. **ChatPanel Component** (`components/chat-panel.tsx`)
   - In-call text messaging
   - System notifications
   - Message history
   - Real-time updates

5. **Demo Page** (`app/video-consultation-demo/page.tsx`)
   - Full feature showcase
   - Call setup interface
   - Role selection (doctor/patient/admin)
   - Recording controls

## Features

### 1. HD Video & Audio
- **Video Quality**: 720p @ 30fps
- **Audio Processing**:
  - Echo cancellation
  - Noise suppression
  - Auto gain control
- **Adaptive Bitrate**: Adjusts to network conditions

### 2. Screen Sharing
- Share entire screen or specific window
- Cursor visibility
- Automatic fallback to camera when stopped
- Visual indicator for participants

### 3. In-Call Chat
- Real-time text messaging
- System notifications (join/leave)
- Message history
- Timestamp display

### 4. Recording
- Local recording using MediaRecorder API
- WebM video format with VP9 codec
- 2.5 Mbps bitrate
- Automatic download on stop
- Recording indicator

### 5. Call Controls
- Toggle audio (mute/unmute)
- Toggle video (camera on/off)
- Screen share start/stop
- End call
- Recording start/stop

### 6. WebRTC Features
- Peer-to-peer connections (low latency)
- STUN servers for NAT traversal
- TURN server support for restricted networks
- Connection state monitoring
- Automatic reconnection

## Technical Stack

### WebRTC
- **simple-peer**: Simplified WebRTC wrapper
  - Handles peer connection setup
  - Manages ICE candidate exchange
  - Simplifies signaling process

### Real-Time Communication
- **Socket.IO Client**: Signaling server communication
  - Room management
  - Peer discovery
  - Message passing
  - Connection state sync

### Media APIs
- **getUserMedia**: Camera and microphone access
- **getDisplayMedia**: Screen sharing
- **MediaRecorder**: Video recording
- **RTCPeerConnection**: WebRTC connections

## Setup & Installation

### 1. Install Dependencies
\`\`\`bash
pnpm add simple-peer socket.io-client
\`\`\`

### 2. Signaling Server (Required)
Create a Socket.IO server for signaling:

\`\`\`javascript
// server.js
const io = require('socket.io')(3001, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userId, userName, userRole }) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', { userId, userName, userRole });
  });

  // Leave room
  socket.on('leave-room', ({ roomId, userId }) => {
    socket.to(roomId).emit('user-left', { userId });
    socket.leave(roomId);
  });

  // WebRTC signaling
  socket.on('signal', ({ to, signal }) => {
    io.to(to).emit('signal', { from: socket.id, signal });
  });

  // Chat messages
  socket.on('chat-message', ({ roomId, message }) => {
    io.to(roomId).emit('chat-message', message);
  });

  // Media state changes
  socket.on('media-state-change', ({ roomId, userId, type, enabled }) => {
    socket.to(roomId).emit('media-state-changed', { userId, type, enabled });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

console.log('Signaling server running on port 3001');
\`\`\`

### 3. Run Signaling Server
\`\`\`bash
node server.js
\`\`\`

### 4. Browser Permissions
Grant camera and microphone permissions when prompted.

## Usage

### Basic Implementation

\`\`\`typescript
import { useVideoCall } from '@/hooks/use-video-call';
import { VideoConsultation } from '@/components/video-consultation';

function VideoCallPage() {
  const {
    callState,
    chatMessages,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    sendMessage,
  } = useVideoCall({
    userId: 'user-123',
    userName: 'John Doe',
    userRole: 'patient',
    socketUrl: 'http://localhost:3001',
    autoInitialize: true,
  });

  return (
    <VideoConsultation
      callState={callState}
      onToggleAudio={toggleAudio}
      onToggleVideo={toggleVideo}
      onStartScreenShare={startScreenShare}
      onStopScreenShare={stopScreenShare}
      onEndCall={endCall}
      onOpenChat={() => {/* show chat */}}
    />
  );
}
\`\`\`

### Starting a Call

\`\`\`typescript
// Generate call ID
const callId = `consultation-${Date.now()}`;

// Start call
await startCall(callId);

// Share call ID with other participants
shareCallId(callId);
\`\`\`

### Handling Events

\`\`\`typescript
const { manager } = useVideoCall({
  userId: 'user-123',
  userName: 'Dr. Smith',
  userRole: 'doctor',
});

// Access manager for advanced features
if (manager) {
  const state = manager.getCallState();
  const duration = manager.getCallDuration();
}
\`\`\`

## API Reference

### VideoCallManager Class

#### Constructor
\`\`\`typescript
new VideoCallManager(
  userId: string,
  userName: string,
  userRole: 'doctor' | 'patient' | 'admin',
  config?: VideoCallConfig,
  eventHandlers?: CallEventHandlers
)
\`\`\`

#### Methods
- `initialize()`: Connect to signaling server
- `startCall(callId: string)`: Start video call
- `endCall()`: End video call
- `toggleAudio()`: Mute/unmute microphone
- `toggleVideo()`: Turn camera on/off
- `startScreenShare()`: Start screen sharing
- `stopScreenShare()`: Stop screen sharing
- `startRecording()`: Start recording
- `stopRecording()`: Stop recording and download
- `sendChatMessage(message: string)`: Send chat message
- `getCallState()`: Get current call state
- `getCallDuration()`: Get call duration in seconds
- `destroy()`: Cleanup resources

#### Static Methods
- `isSupported()`: Check WebRTC browser support

### useVideoCall Hook

#### Parameters
\`\`\`typescript
interface UseVideoCallOptions {
  userId: string;
  userName: string;
  userRole: 'doctor' | 'patient' | 'admin';
  socketUrl?: string;
  autoInitialize?: boolean;
}
\`\`\`

#### Return Value
\`\`\`typescript
interface UseVideoCallReturn {
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

  // Manager
  manager: VideoCallManager | null;
}
\`\`\`

### CallState Interface

\`\`\`typescript
interface CallState {
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
\`\`\`

## Testing

### Manual Testing

1. **Single User Test**
   - Open demo page
   - Generate call ID
   - Start call
   - Test controls (mute, camera, screen share)

2. **Multi-User Test**
   - Open demo in two browser tabs
   - Use same call ID
   - Test peer-to-peer connection
   - Verify audio/video streams

3. **Chat Test**
   - Send messages between participants
   - Verify message delivery
   - Check system notifications

4. **Recording Test**
   - Start recording
   - Speak for 10 seconds
   - Stop recording
   - Verify download

### Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Video Call | ✅ | ✅ | ✅ | ✅ |
| Screen Share | ✅ | ✅ | ⚠️ | ✅ |
| Recording | ✅ | ✅ | ❌ | ✅ |

⚠️ = Limited support
❌ = Not supported

## Production Deployment

### 1. Environment Variables
\`\`\`env
NEXT_PUBLIC_SIGNALING_SERVER_URL=wss://your-signaling-server.com
\`\`\`

### 2. HTTPS Required
WebRTC requires HTTPS in production (except localhost).

### 3. TURN Server
Configure TURN servers for restricted networks:

\`\`\`typescript
const config: VideoCallConfig = {
  turnServers: [
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'username',
      credential: 'password',
    },
  ],
};
\`\`\`

### 4. Scaling Considerations
- Use multiple signaling servers for load balancing
- Implement connection pooling
- Monitor active connections
- Set max participants per room

## Integration with Existing Features

### Booking System
\`\`\`typescript
// Link consultation to booking
const booking = await createBooking({
  patientId: 'patient-123',
  doctorId: 'doctor-456',
  appointmentDate: new Date(),
  consultationType: 'video',
  callId: 'call-abc123', // Store call ID
});
\`\`\`

### Admin Dashboard
\`\`\`typescript
// View consultation history
const consultations = await getConsultationHistory({
  doctorId: 'doctor-456',
  dateRange: { start, end },
});
\`\`\`

### Multi-language Support
\`\`\`typescript
// Translate UI
const t = useTranslations('videoCall');

<button>{t('mute')}</button>
<button>{t('camera')}</button>
<button>{t('screenShare')}</button>
\`\`\`

### PWA Integration
\`\`\`typescript
// Enable video calls in installed PWA
if (window.matchMedia('(display-mode: standalone)').matches) {
  // App is installed, enable offline features
  enableOfflineCallHistory();
}
\`\`\`

## Troubleshooting

### Connection Issues
- **Problem**: Cannot connect to signaling server
- **Solution**: Check server URL and CORS configuration

### No Video/Audio
- **Problem**: Black screen or no sound
- **Solution**: Check browser permissions, verify getUserMedia support

### Screen Share Fails
- **Problem**: Screen share not starting
- **Solution**: Safari has limited support, use Chrome/Firefox

### Recording Not Working
- **Problem**: Recording fails or downloads corrupted file
- **Solution**: Check MediaRecorder browser support, use Chrome/Firefox

## Performance Optimization

### 1. Video Quality
- Lower resolution for slow connections
- Adjust frame rate dynamically
- Disable video for audio-only calls

### 2. Memory Management
- Clean up streams on disconnect
- Remove event listeners
- Destroy peer connections properly

### 3. Network Optimization
- Use TURN servers for NAT traversal
- Implement bandwidth estimation
- Add connection quality indicators

## Security Considerations

### 1. Encryption
- WebRTC uses DTLS-SRTP for media encryption
- End-to-end encrypted by default

### 2. Authentication
- Validate user IDs on signaling server
- Use JWT tokens for room access
- Implement rate limiting

### 3. Privacy
- Disable recording for sensitive consultations
- Auto-delete recordings after retention period
- Notify participants when recording starts

## Future Enhancements

1. **Virtual Backgrounds**: Blur or replace background
2. **Noise Cancellation**: Advanced audio processing
3. **Transcription**: Real-time speech-to-text
4. **AI Assistant**: Treatment recommendations during call
5. **Multi-Party Calls**: Support 3+ participants
6. **Breakout Rooms**: Separate consultation spaces
7. **Waiting Room**: Queue management for doctors
8. **Session Notes**: Doctor notes during consultation

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `lib/video/video-call-manager.ts` | 680 | WebRTC manager class |
| `hooks/use-video-call.ts` | 360 | React hook for video calls |
| `components/video-consultation.tsx` | 280 | Main video UI component |
| `components/chat-panel.tsx` | 200 | In-call chat component |
| `app/video-consultation-demo/page.tsx` | 350 | Demo page |
| `docs/TASK5_VIDEO_CONSULTATION.md` | 600+ | Documentation |

**Total: 6 files, ~2,470 lines**

## Conclusion

The video consultation system provides enterprise-grade WebRTC capabilities for remote healthcare. With features like screen sharing, recording, and in-call chat, it enables seamless doctor-patient consultations from anywhere.

**Task 5 Status: ✅ COMPLETED**
