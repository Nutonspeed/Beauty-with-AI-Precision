// Video Consultation Demo Page
// Full-featured demo of video call system with chat and recording

'use client';

import { useState } from 'react';
import { useVideoCall } from '@/hooks/use-video-call';
import { VideoConsultation } from '@/components/video-consultation';
import { ChatPanel } from '@/components/chat-panel';
import { Video, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function VideoConsultationDemoPage() {
  const [callId, setCallId] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [userRole, setUserRole] = useState<'doctor' | 'patient' | 'admin'>('patient');

  // Initialize video call
  const {
    callState,
    chatMessages,
    isInitialized,
    error,
    callDuration,
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
  } = useVideoCall({
    userId: `user-${Math.random().toString(36).substr(2, 9)}`,
    userName: 'Demo User',
    userRole,
    socketUrl: 'http://localhost:3001',
    autoInitialize: true,
  });

  /**
   * Handle start call
   */
  const handleStartCall = async () => {
    if (!callId.trim()) {
      alert('Please enter a call ID');
      return;
    }

    try {
      await startCall(callId);
    } catch (err) {
      console.error('Failed to start call:', err);
    }
  };

  /**
   * Handle end call
   */
  const handleEndCall = () => {
    endCall();
    setShowChat(false);
  };

  /**
   * Generate random call ID
   */
  const generateCallId = () => {
    const id = `call-${Math.random().toString(36).substr(2, 9)}`;
    setCallId(id);
  };

  /**
   * Format duration
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Video Consultation System
              </h1>
              <p className="text-gray-600 mt-1">
                WebRTC-powered video calls with screen sharing, recording, and chat
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Initialization Status */}
        {!isInitialized && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-semibold text-gray-900">Initializing...</h3>
                <p className="text-sm text-gray-600">
                  Setting up WebRTC connection
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Call Setup (when not in call) */}
        {isInitialized && callState.status === 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Start Call Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Start Video Consultation
              </h2>

              <div className="space-y-4">
                {/* User Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Role
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Call ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Call ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={callId}
                      onChange={(e) => setCallId(e.target.value)}
                      placeholder="Enter call ID or generate one"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={generateCallId}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                {/* Start Button */}
                <button
                  onClick={handleStartCall}
                  disabled={!callId.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  Start Consultation
                </button>
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Features
              </h2>

              <div className="space-y-3">
                <Feature
                  icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                  title="HD Video & Audio"
                  description="Crystal clear 720p video with echo cancellation"
                />
                <Feature
                  icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                  title="Screen Sharing"
                  description="Share medical reports and treatment plans"
                />
                <Feature
                  icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                  title="In-Call Chat"
                  description="Send messages during video consultation"
                />
                <Feature
                  icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                  title="Recording"
                  description="Record sessions for medical records"
                />
                <Feature
                  icon={<CheckCircle2 className="w-5 h-5 text-green-600" />}
                  title="WebRTC P2P"
                  description="Peer-to-peer connection for low latency"
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Call */}
        {(callState.status === 'connecting' || callState.status === 'connected') && (
          <div className="flex gap-4 h-[calc(100vh-250px)]">
            {/* Video Container */}
            <div className={`${showChat ? 'flex-1' : 'w-full'} transition-all`}>
              <VideoConsultation
                callState={callState}
                onToggleAudio={toggleAudio}
                onToggleVideo={toggleVideo}
                onStartScreenShare={startScreenShare}
                onStopScreenShare={stopScreenShare}
                onEndCall={handleEndCall}
                onOpenChat={() => setShowChat(true)}
                className="h-full"
              />
            </div>

            {/* Chat Panel */}
            {showChat && (
              <div className="w-96 h-full">
                <ChatPanel
                  messages={chatMessages}
                  currentUserId={`user-${Math.random().toString(36).substr(2, 9)}`}
                  onSendMessage={sendMessage}
                  onClose={() => setShowChat(false)}
                  className="h-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Additional Controls (when in call) */}
        {callState.status === 'connected' && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Controls
            </h3>

            <div className="flex gap-4">
              {/* Recording */}
              <button
                onClick={callState.isRecording ? stopRecording : startRecording}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  callState.isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {callState.isRecording ? 'Stop Recording' : 'Start Recording'}
              </button>

              {/* Call Duration */}
              <div className="flex items-center px-6 py-3 bg-gray-100 rounded-lg">
                <span className="text-gray-700 font-medium">
                  Duration: {formatDuration(callDuration)}
                </span>
              </div>

              {/* Participant Count */}
              <div className="flex items-center px-6 py-3 bg-gray-100 rounded-lg">
                <span className="text-gray-700 font-medium">
                  Participants: {callState.participants.length}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {callState.status === 'idle' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              How to Use
            </h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. Select your role (Patient/Doctor/Admin)</li>
              <li>2. Enter a call ID or generate a random one</li>
              <li>3. Share the call ID with other participants</li>
              <li>4. Click "Start Consultation" to begin</li>
              <li>5. Use controls to toggle audio/video, share screen, or record</li>
              <li>6. Open chat panel for text messaging during the call</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

// Feature Component
function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
