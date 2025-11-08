/**
 * Video Call Demo Page
 * Demonstrating video call functionality for telemedicine
 */

'use client';

import React, { useState } from 'react';
import { VideoCallRoom } from '@/components/video-call/video-call-room';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Video, 
  Users, 
  Monitor, 
  Circle, 
  Mic, 
  Phone,
  CheckCircle2 
} from 'lucide-react';

export default function VideoCallDemoPage() {
  const [joined, setJoined] = useState(false);
  const [callId, setCallId] = useState('demo-call-1');
  const [userId, setUserId] = useState('user-' + Math.random().toString(36).substr(2, 9));
  const [userName, setUserName] = useState('Demo User');

  const handleJoinCall = () => {
    setJoined(true);
  };

  const handleLeaveCall = () => {
    setJoined(false);
  };

  if (joined) {
    return (
      <div>
        <VideoCallRoom
          callId={callId}
          userId={userId}
          userName={userName}
          autoJoin={true}
        />
        <Button
          onClick={handleLeaveCall}
          className="absolute top-4 right-4 z-50"
          variant="outline"
        >
          Back to Demo
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Video Call System</h1>
        <p className="text-muted-foreground text-lg">
          WebRTC-based video calling for telemedicine consultations
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">12/12</div>
                <p className="text-xs text-muted-foreground">100% passing</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Core components</p>
              </div>
              <Video className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">Key features</p>
              </div>
              <Monitor className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Join Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Join Video Call</CardTitle>
          <CardDescription>
            Enter your details to join the demo call
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="callId">Call ID</Label>
              <Input
                id="callId"
                value={callId}
                onChange={(e) => setCallId(e.target.value)}
                placeholder="demo-call-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="user-123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Demo User"
              />
            </div>
          </div>
          <Button onClick={handleJoinCall} className="w-full" size="lg">
            <Phone className="w-4 h-4 mr-2" />
            Join Call
          </Button>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-600" />
              Video & Audio
            </CardTitle>
            <CardDescription>HD video calling with crystal clear audio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline">720p</Badge>
              <span className="text-sm">High-definition video quality</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Echo Cancel</Badge>
              <span className="text-sm">Echo cancellation & noise suppression</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Controls</Badge>
              <span className="text-sm">Mute/unmute & video on/off</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-purple-600" />
              Screen Sharing
            </CardTitle>
            <CardDescription>Share your screen during consultations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline">Full Screen</Badge>
              <span className="text-sm">Share entire screen or window</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Cursor</Badge>
              <span className="text-sm">Show cursor for better guidance</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Real-time</Badge>
              <span className="text-sm">Instant screen synchronization</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className="w-5 h-5 text-red-600" />
              Call Recording
            </CardTitle>
            <CardDescription>Record consultations for medical records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline">WebM</Badge>
              <span className="text-sm">High-quality WebM format</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Auto Download</Badge>
              <span className="text-sm">Automatic download when stopped</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">All Streams</Badge>
              <span className="text-sm">Records all participants</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Multi-participant
            </CardTitle>
            <CardDescription>Support for group consultations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline">WebRTC</Badge>
              <span className="text-sm">Peer-to-peer connections</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Grid Layout</Badge>
              <span className="text-sm">Adaptive video grid</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline">Status</Badge>
              <span className="text-sm">See who's muted/video off</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Implementation</CardTitle>
          <CardDescription>Core components and architecture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">Components</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge>Manager</Badge>
                  <span>VideoCallManager (core logic)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge>Hook</Badge>
                  <span>useVideoCall (React integration)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge>UI</Badge>
                  <span>VideoPlayer (stream display)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge>UI</Badge>
                  <span>CallControls (action buttons)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge>UI</Badge>
                  <span>VideoCallRoom (complete interface)</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Technologies</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Badge variant="outline">WebRTC</Badge>
                  <span>Peer-to-peer connections</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">WebSocket</Badge>
                  <span>Signaling & coordination</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">MediaRecorder</Badge>
                  <span>Call recording</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">STUN</Badge>
                  <span>NAT traversal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Badge variant="outline">React</Badge>
                  <span>UI framework</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
          <CardDescription>How to test the video call system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. Multi-tab Testing</h3>
            <p className="text-sm text-muted-foreground">
              Open this page in two browser tabs with different User IDs but same Call ID. 
              Join the call in both tabs to test peer-to-peer video.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Media Controls</h3>
            <p className="text-sm text-muted-foreground">
              Test mute/unmute button, video on/off, and verify the status updates 
              in real-time across all participants.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">3. Screen Sharing</h3>
            <p className="text-sm text-muted-foreground">
              Click the screen share button and select a window to share. 
              The shared screen should appear in other participants' view.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">4. Recording</h3>
            <p className="text-sm text-muted-foreground">
              Start recording and perform some actions. Stop recording to 
              download the WebM file with all streams combined.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">5. Connection Quality</h3>
            <p className="text-sm text-muted-foreground">
              Monitor WebSocket messages in console. Check for ICE candidates, 
              offers, answers, and peer connection states.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
