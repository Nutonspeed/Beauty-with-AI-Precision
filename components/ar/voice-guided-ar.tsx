// Voice-Guided AR Component - Hands-free AR consultations
// Integrates speech recognition with AR interactions

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import { useVoiceGuidedAR } from "@/lib/hooks/use-voice-guided-ar"
import { useHaptic, HAPTIC_PATTERNS } from "@/lib/hooks/use-haptic"

interface VoiceGuidedARProps {
  onVoiceCommand?: (command: any) => void
  language?: string
  enableAudioFeedback?: boolean
}

export function VoiceGuidedAR({
  onVoiceCommand,
  language = 'th-TH',
  enableAudioFeedback = true
}: VoiceGuidedARProps) {
  const [isActive, setIsActive] = useState(false)
  const [lastAction, setLastAction] = useState<string>('')

  const haptic = useHaptic()
  const {
    isListening,
    transcript,
    processedCommand,
    startListening,
    stopListening,
    speak,
    error
  } = useVoiceGuidedAR({
    language,
    continuous: true,
    enableFeedback: enableAudioFeedback
  })

  // Handle voice commands
  useEffect(() => {
    if (processedCommand && processedCommand.action !== 'unknown') {
      setLastAction(`${processedCommand.action}: ${processedCommand.direction || ''}`.trim())

      // Trigger haptic feedback
      haptic.trigger(HAPTIC_PATTERNS.SUCCESS)

      // Execute AR action
      onVoiceCommand?.(processedCommand)

      // Audio feedback
      if (enableAudioFeedback) {
        const feedbackText = getFeedbackText(processedCommand)
        speak(feedbackText)
      }
    }
  }, [processedCommand, onVoiceCommand, haptic, enableAudioFeedback, speak])

  const getFeedbackText = (command: any): string => {
    switch (command.action) {
      case 'rotate':
        return 'หมุนโมเดลเรียบร้อยแล้ว'
      case 'zoom':
        return `ซูม${command.direction === 'in' ? 'เข้า' : 'ออก'}เรียบร้อยแล้ว`
      case 'pan':
        return `เลื่อนไปทาง${getDirectionText(command.direction)}เรียบร้อยแล้ว`
      case 'reset':
        return 'รีเซ็ตตำแหน่งเรียบร้อยแล้ว'
      case 'screenshot':
        return 'ถ่ายภาพหน้าจอเรียบร้อยแล้ว'
      default:
        return 'คำสั่งไม่เข้าใจ'
    }
  }

  const getDirectionText = (direction: string): string => {
    switch (direction) {
      case 'left': return 'ซ้าย'
      case 'right': return 'ขวา'
      case 'up': return 'ขึ้น'
      case 'down': return 'ลง'
      default: return ''
    }
  }

  const toggleVoiceControl = () => {
    if (isActive) {
      stopListening()
      setIsActive(false)
      haptic.trigger(HAPTIC_PATTERNS.BUTTON_TAP)
      if (enableAudioFeedback) {
        speak('ปิดการควบคุมด้วยเสียง')
      }
    } else {
      startListening()
      setIsActive(true)
      haptic.trigger(HAPTIC_PATTERNS.SUCCESS)
      if (enableAudioFeedback) {
        speak('เปิดการควบคุมด้วยเสียงแล้ว พูดคำสั่งได้เลย')
      }
    }
  }

  const getStatusColor = () => {
    if (error) return 'destructive'
    if (isListening) return 'default'
    return 'secondary'
  }

  const getStatusText = () => {
    if (error) return 'เกิดข้อผิดพลาด'
    if (isListening) return 'กำลังฟัง...'
    return 'พร้อมใช้งาน'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isActive ? (
              <Mic className="w-5 h-5 text-green-500" />
            ) : (
              <MicOff className="w-5 h-5 text-gray-400" />
            )}
            Voice-Guided AR
          </div>

          <Badge variant={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Voice Control Toggle */}
          <div className="flex items-center justify-center">
            <Button
              onClick={toggleVoiceControl}
              variant={isActive ? "default" : "outline"}
              size="lg"
              className="w-full max-w-xs"
            >
              {isActive ? (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  ปิด Voice Control
                </>
              ) : (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  เปิด Voice Control
                </>
              )}
            </Button>
          </div>

          {/* Status Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Transcript</div>
              <div className="mt-1 p-2 bg-muted rounded text-sm min-h-[2rem] flex items-center">
                {transcript || 'ยังไม่มีคำพูด...'}
              </div>
            </div>

            <div>
              <div className="font-medium text-muted-foreground">Last Action</div>
              <div className="mt-1 p-2 bg-muted rounded text-sm min-h-[2rem] flex items-center">
                {lastAction || 'ยังไม่มีคำสั่ง...'}
              </div>
            </div>
          </div>

          {/* Voice Commands Guide */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">คำสั่งเสียงที่รองรับ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium text-green-600 mb-1">การเคลื่อนไหว</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "หมุน" - หมุนโมเดล</li>
                  <li>• "ซูมเข้า/ออก" - ซูม</li>
                  <li>• "เลื่อนซ้าย/ขวา" - เลื่อนตำแหน่ง</li>
                </ul>
              </div>

              <div>
                <div className="font-medium text-blue-600 mb-1">การควบคุม</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "รีเซ็ต" - รีเซ็ตตำแหน่ง</li>
                  <li>• "ถ่ายรูป" - ถ่ายภาพหน้าจอ</li>
                  <li>• "หยุด" - หยุดฟังคำสั่ง</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2">
                <VolumeX className="w-4 h-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            </div>
          )}

          {/* Audio Feedback Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm">เสียงตอบกลับ</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (enableAudioFeedback) {
                  speak('ปิดเสียงตอบกลับ')
                }
              }}
            >
              {enableAudioFeedback ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
