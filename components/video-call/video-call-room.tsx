// @ts-nocheck
/**
 * Video Call Room Component
 * Complete video call interface
 */

'use client';

import React from 'react';
import { useVideoCall } from '@/hooks/use-video-call';
import { VideoPlayer } from './video-player';
import { CallControls } from './call-controls';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock } from 'lucide-react';

interface VideoCallRoomProps {
  callId: string;
  userId: string;
  userName: string;
  autoJoin?: boolean;
}

export function VideoCallRoom({ callId, userId, userName, autoJoin = true }: VideoCallRoomProps) {
  const {
    participants,
    localStream,
    isActive,
    isRecording,
    isMuted,
    isVideoOff,
    isScreenSharing,
    error,
    callDuration,
    participantCount,
    joinCall,
    leaveCall,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    startRecording,
    stopRecording,
    formatDuration
  } = useVideoCall({ callId, userId, userName, autoJoin });

  const handleToggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Get current user participant
  const currentUser = participants.get(userId);
  
  // Get other participants
  const otherParticipants = Array.from(participants.values()).filter(p => p.userId !== userId);

  if (!isActive) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Video Call Room</h2>
          <p className="text-muted-foreground mb-6">
            Call ID: {callId}
          </p>
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error.message}</p>
            </div>
          )}
          <button
            onClick={joinCall}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Join Call
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Video Call</h1>
            <Badge variant="outline" className="text-white border-white">
              <Users className="w-3 h-3 mr-1" />
              {participantCount} participant{participantCount !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-white border-white">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(callDuration)}
            </Badge>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse">
                ● Recording
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={`grid gap-4 h-full ${
          otherParticipants.length === 0 ? 'grid-cols-1' :
          otherParticipants.length === 1 ? 'grid-cols-2' :
          otherParticipants.length === 2 ? 'grid-cols-2' :
          otherParticipants.length === 3 ? 'grid-cols-2 grid-rows-2' :
          'grid-cols-3'
        }`}>
          {/* Local video */}
          {currentUser && (
            <VideoPlayer
              stream={localStream}
              userName={currentUser.userName}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              isLocal={true}
              className="h-full min-h-[300px]"
            />
          )}

          {/* Remote videos */}
          {otherParticipants.map(participant => (
            <VideoPlayer
              key={participant.userId}
              stream={participant.stream}
              userName={participant.userName}
              isMuted={participant.isMuted}
              isVideoOff={participant.isVideoOff}
              isLocal={false}
              className="h-full min-h-[300px]"
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 border-t border-gray-800 p-6">
        <CallControls
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          isRecording={isRecording}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onToggleRecording={handleToggleRecording}
          onEndCall={leaveCall}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {error.message}
        </div>
      )}
    </div>
  );
}
