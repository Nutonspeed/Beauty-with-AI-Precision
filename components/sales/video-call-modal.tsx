"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Loader2,
  Clock,
  Users,
  Signal,
} from "lucide-react"
import { toast } from "sonner"

interface VideoCallSession {
  id: string
  lead_id: string
  room_id: string
  status: "scheduled" | "active" | "ended" | "cancelled"
  scheduled_at?: string
  started_at?: string
  ended_at?: string
  duration_minutes?: number
  participants: VideoCallParticipant[]
}

interface VideoCallParticipant {
  id: string
  session_id: string
  user_id: string
  user_name: string
  joined_at?: string
  left_at?: string
  duration_minutes?: number
  connection_quality?: string
}

interface VideoCallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  leadId: string
  leadName?: string
  sessionId?: string
}

export function VideoCallModal({
  open,
  onOpenChange,
  leadId,
  leadName = "ลูกค้า",
  sessionId,
}: VideoCallModalProps) {
  const [session, setSession] = useState<VideoCallSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [inCall, setInCall] = useState(false)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionQuality, _setConnectionQuality] = useState<"excellent" | "good" | "poor">("good")

   
  useEffect(() => {
    if (open && sessionId) {
      loadSession()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionId])

  // Call duration timer
  useEffect(() => {
    if (!inCall) return

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [inCall])

  const loadSession = async () => {
    if (!sessionId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/sales/video-call?session_id=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data)
        setInCall(data.status === "active")
      }
    } catch (error) {
      console.error("Failed to load session:", error)
      toast.error("ไม่สามารถโหลดข้อมูล video call ได้")
    } finally {
      setLoading(false)
    }
  }

  const startCall = async () => {
    setLoading(true)
    try {
      // Create session if not exists
      let currentSession = session
      if (!currentSession) {
        const response = await fetch("/api/sales/video-call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead_id: leadId,
            room_id: `room-${leadId}-${Date.now()}`,
            status: "active",
            scheduled_at: new Date().toISOString(),
          }),
        })

        if (!response.ok) throw new Error("Failed to create session")
        currentSession = await response.json()
        setSession(currentSession)
      }

      // Update status to active
      const response = await fetch("/api/sales/video-call", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: currentSession!.id,
          status: "active",
          started_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to start call")

      setInCall(true)
      setCallDuration(0)
      toast.success("เริ่มต้น video call แล้ว")
    } catch (error) {
      console.error("Failed to start call:", error)
      toast.error("ไม่สามารถเริ่ม video call ได้")
    } finally {
      setLoading(false)
    }
  }

  const endCall = async () => {
    if (!session) return

    setLoading(true)
    try {
      const response = await fetch("/api/sales/video-call", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          status: "ended",
          ended_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) throw new Error("Failed to end call")

      setInCall(false)
      toast.success("สิ้นสุด video call แล้ว", {
        description: `ระยะเวลา ${formatDuration(callDuration)}`,
      })

      // Close modal after 1 second
      setTimeout(() => {
        onOpenChange(false)
      }, 1000)
    } catch (error) {
      console.error("Failed to end call:", error)
      toast.error("ไม่สามารถสิ้นสุด video call ได้")
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "poor":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "ดีเยี่ยม"
      case "good":
        return "ดี"
      case "poor":
        return "อ่อน"
      default:
        return "ปานกลาง"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Video Call - {leadName}
          </DialogTitle>
          <DialogDescription>
            {inCall ? "กำลังสนทนากับลูกค้า" : "เริ่มต้น video call กับลูกค้า"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Area */}
          <div className="relative aspect-video rounded-lg bg-gray-900">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : inCall ? (
              <>
                {/* Main video feed placeholder */}
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="mx-auto mb-2 h-16 w-16 opacity-50" />
                    <p className="text-sm opacity-75">Video Feed</p>
                    <p className="text-xs opacity-50">
                      (Integration with video service required)
                    </p>
                  </div>
                </div>

                {/* Call duration */}
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 text-white backdrop-blur-sm">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-sm">{formatDuration(callDuration)}</span>
                </div>

                {/* Connection quality */}
                <div className="absolute right-4 top-4 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 text-white backdrop-blur-sm">
                  <Signal className={`h-4 w-4 ${getQualityColor(connectionQuality)}`} />
                  <span className="text-sm">{getQualityLabel(connectionQuality)}</span>
                </div>

                {/* Self video preview */}
                <div className="absolute bottom-4 right-4 h-32 w-48 overflow-hidden rounded-lg border-2 border-white bg-gray-800">
                  <div className="flex h-full items-center justify-center text-white">
                    <div className="text-center">
                      <Video className="mx-auto mb-1 h-8 w-8 opacity-50" />
                      <p className="text-xs opacity-75">You</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-white">
                  <Video className="mx-auto mb-4 h-20 w-20 opacity-50" />
                  <p className="mb-2 text-lg font-medium">พร้อมที่จะเริ่มต้น?</p>
                  <p className="text-sm opacity-75">กดปุ่มด้านล่างเพื่อเริ่ม video call</p>
                </div>
              </div>
            )}
          </div>

          {/* Participants */}
          {session && session.participants.length > 0 && (
            <div className="rounded-lg border p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                ผู้เข้าร่วม ({session.participants.length})
              </div>
              <div className="space-y-2">
                {session.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between rounded-lg bg-muted p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{participant.user_name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{participant.user_name}</p>
                        {participant.duration_minutes && (
                          <p className="text-xs text-muted-foreground">
                            {participant.duration_minutes} นาที
                          </p>
                        )}
                      </div>
                    </div>
                    {participant.connection_quality && (
                      <Badge variant="outline" className="text-xs">
                        {getQualityLabel(participant.connection_quality)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {inCall ? (
              <>
                {/* Toggle video */}
                <Button
                  variant={videoEnabled ? "default" : "destructive"}
                  size="lg"
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  className="rounded-full"
                >
                  {videoEnabled ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </Button>

                {/* Toggle audio */}
                <Button
                  variant={audioEnabled ? "default" : "destructive"}
                  size="lg"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="rounded-full"
                >
                  {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                </Button>

                {/* End call */}
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={endCall}
                  disabled={loading}
                  className="rounded-full"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <PhoneOff className="h-5 w-5" />
                  )}
                </Button>
              </>
            ) : (
              <Button size="lg" onClick={startCall} disabled={loading} className="rounded-full">
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Phone className="mr-2 h-5 w-5" />
                )}
                เริ่ม Video Call
              </Button>
            )}
          </div>

          {/* Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            <p>
              💡 <strong>หมายเหตุ:</strong> เซสชัน video call จะถูกบันทึกลงในระบบ
              รวมถึงระยะเวลาและคุณภาพการเชื่อมต่อ (ต้องเชื่อมต่อกับ video service เช่น Agora, Twilio)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
