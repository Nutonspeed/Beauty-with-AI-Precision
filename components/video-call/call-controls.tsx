/**
 * Call Controls Component
 * Control panel for video call actions
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Monitor, 
  MonitorOff,
  Circle,
  Square
} from 'lucide-react';

interface CallControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onEndCall: () => void;
  className?: string;
}

export function CallControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isRecording,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleRecording,
  onEndCall,
  className = ''
}: CallControlsProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {/* Mute/Unmute */}
      <Button
        variant={isMuted ? 'destructive' : 'secondary'}
        size="lg"
        onClick={onToggleMute}
        className="rounded-full w-14 h-14"
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>

      {/* Video On/Off */}
      <Button
        variant={isVideoOff ? 'destructive' : 'secondary'}
        size="lg"
        onClick={onToggleVideo}
        className="rounded-full w-14 h-14"
      >
        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </Button>

      {/* Screen Share */}
      <Button
        variant={isScreenSharing ? 'default' : 'secondary'}
        size="lg"
        onClick={onToggleScreenShare}
        className="rounded-full w-14 h-14"
      >
        {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
      </Button>

      {/* Recording */}
      <Button
        variant={isRecording ? 'default' : 'secondary'}
        size="lg"
        onClick={onToggleRecording}
        className="rounded-full w-14 h-14"
      >
        {isRecording ? (
          <Square className="w-5 h-5 fill-current" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </Button>

      {/* End Call */}
      <Button
        variant="destructive"
        size="lg"
        onClick={onEndCall}
        className="rounded-full w-14 h-14 bg-red-600 hover:bg-red-700"
      >
        <Phone className="w-5 h-5 rotate-[135deg]" />
      </Button>
    </div>
  );
}
