// Video Consultation Component
// Main UI for video calls with remote/local streams and controls

'use client';

import { useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Monitor, Phone, MessageCircle } from 'lucide-react';
import { CallState } from '@/lib/video/video-call-manager';

interface VideoConsultationProps {
  callState: CallState;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onEndCall: () => void;
  onOpenChat: () => void;
  className?: string;
}

export function VideoConsultation({
  callState,
  onToggleAudio,
  onToggleVideo,
  onStartScreenShare,
  onStopScreenShare,
  onEndCall,
  onOpenChat,
  className = '',
}: VideoConsultationProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  /**
   * Setup local video stream
   */
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream;
    }
  }, [callState.localStream]);

  /**
   * Format call duration
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

  /**
   * Get call duration
   */
  const getCallDuration = (): number => {
    if (!callState.startTime) return 0;
    return Math.floor((Date.now() - callState.startTime) / 1000);
  };

  return (
    <div className={`flex flex-col h-full bg-gray-900 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Video Consultation
          </h2>
          <p className="text-sm text-gray-400">
            {callState.status === 'connected' && callState.participants.length > 0
              ? `${callState.participants.length} participant${callState.participants.length > 1 ? 's' : ''}`
              : 'Waiting for participants...'}
          </p>
        </div>

        {/* Call duration */}
        {callState.status === 'connected' && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-medium">
              {formatDuration(getCallDuration())}
            </span>
          </div>
        )}

        {/* Recording indicator */}
        {callState.isRecording && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-white font-medium">REC</span>
          </div>
        )}
      </div>

      {/* Video Grid */}
      <div className="flex-1 relative p-4">
        {/* Remote participants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {callState.participants.length === 0 ? (
            <div className="flex items-center justify-center bg-gray-800 rounded-lg">
              <div className="text-center">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Waiting for participants to join...</p>
              </div>
            </div>
          ) : (
            callState.participants.map((participant) => (
              <div
                key={participant.id}
                className="relative bg-gray-800 rounded-lg overflow-hidden"
              >
                {/* Remote video */}
                <video
                  ref={(el) => {
                    if (el && participant.stream) {
                      el.srcObject = participant.stream;
                      remoteVideoRefs.current.set(participant.id, el);
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Participant info */}
                <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {participant.name}
                    </span>
                    <span className="text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded">
                      {participant.role}
                    </span>
                  </div>
                </div>

                {/* Media status icons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {!participant.isAudioEnabled && (
                    <div className="p-2 bg-red-600 rounded-lg">
                      <MicOff className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {!participant.isVideoEnabled && (
                    <div className="p-2 bg-red-600 rounded-lg">
                      <VideoOff className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {participant.isScreenSharing && (
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Monitor className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Local video (picture-in-picture) */}
        <div className="absolute bottom-8 right-8 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />

          {/* Local user label */}
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
            You {callState.isScreenSharing && '(Screen)'}
          </div>

          {/* Local media status */}
          <div className="absolute top-2 right-2 flex gap-1">
            {!callState.isAudioEnabled && (
              <div className="p-1 bg-red-600 rounded">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            )}
            {!callState.isVideoEnabled && (
              <div className="p-1 bg-red-600 rounded">
                <VideoOff className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-center gap-4">
          {/* Toggle audio */}
          <button
            onClick={onToggleAudio}
            className={`p-4 rounded-full transition-colors ${
              callState.isAudioEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={callState.isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {callState.isAudioEnabled ? (
              <Mic className="w-6 h-6 text-white" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Toggle video */}
          <button
            onClick={onToggleVideo}
            className={`p-4 rounded-full transition-colors ${
              callState.isVideoEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={callState.isVideoEnabled ? 'Stop video' : 'Start video'}
          >
            {callState.isVideoEnabled ? (
              <Video className="w-6 h-6 text-white" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Screen share */}
          <button
            onClick={callState.isScreenSharing ? onStopScreenShare : onStartScreenShare}
            className={`p-4 rounded-full transition-colors ${
              callState.isScreenSharing
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={callState.isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <Monitor className="w-6 h-6 text-white" />
          </button>

          {/* Chat */}
          <button
            onClick={onOpenChat}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Open chat"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </button>

          {/* End call */}
          <button
            onClick={onEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
            title="End call"
          >
            <Phone className="w-6 h-6 text-white transform rotate-135" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
