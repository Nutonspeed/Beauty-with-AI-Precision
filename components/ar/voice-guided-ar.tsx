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

import { useTranslations } from "next-intl"

export function VoiceGuidedAR({
  onVoiceCommand,
  language = 'th-TH',
  enableAudioFeedback = true
}: VoiceGuidedARProps) {
  const t = useTranslations()
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
        return t('voiceGuidedAR.feedback.rotate')
      case 'zoom':
        return t('voiceGuidedAR.feedback.zoom', { direction: t(`voiceGuidedAR.directions.${command.direction}` as any) })
      case 'pan':
        return t('voiceGuidedAR.feedback.pan', { direction: t(`voiceGuidedAR.directions.${command.direction}` as any) })
      case 'reset':
        return t('voiceGuidedAR.feedback.reset')
      case 'screenshot':
        return t('voiceGuidedAR.feedback.screenshot')
      default:
        return t('voiceGuidedAR.feedback.unknown')
    }
  }

  const getDirectionText = (direction: string): string => {
    return t(`voiceGuidedAR.directions.${direction}` as any)
  }

  const toggleVoiceControl = () => {
    if (isActive) {
      stopListening()
      setIsActive(false)
      haptic.trigger(HAPTIC_PATTERNS.BUTTON_TAP)
      if (enableAudioFeedback) {
        speak(t('voiceGuidedAR.controls.speakOff'))
      }
    } else {
      startListening()
      setIsActive(true)
      haptic.trigger(HAPTIC_PATTERNS.SUCCESS)
      if (enableAudioFeedback) {
        speak(t('voiceGuidedAR.controls.speakOn'))
      }
    }
  }

  const getStatusColor = () => {
    if (error) return 'destructive'
    if (isListening) return 'default'
    return 'secondary'
  }

  const getStatusText = () => {
    if (error) return t('voiceGuidedAR.status.error')
    if (isListening) return t('voiceGuidedAR.status.listening')
    return t('voiceGuidedAR.status.ready')
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
            {t('voiceGuidedAR.title')}
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
                  {t('voiceGuidedAR.controls.turnOff')}
                </>
              ) : (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  {t('voiceGuidedAR.controls.turnOn')}
                </>
              )}
            </Button>
          </div>

          {/* Status Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">{t('voiceGuidedAR.transcript')}</div>
              <div className="mt-1 p-2 bg-muted rounded text-sm min-h-[2rem] flex items-center">
                {transcript || t('voiceGuidedAR.noSpeech')}
              </div>
            </div>

            <div>
              <div className="font-medium text-muted-foreground">{t('voiceGuidedAR.lastAction')}</div>
              <div className="mt-1 p-2 bg-muted rounded text-sm min-h-[2rem] flex items-center">
                {lastAction || t('voiceGuidedAR.noCommand')}
              </div>
            </div>
          </div>

          {/* Voice Commands Guide */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">{t('voiceGuidedAR.guide.title')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="font-medium text-green-600 mb-1">{t('voiceGuidedAR.guide.movement')}</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "{t('voiceGuidedAR.guide.rotate')}" - {t('voiceGuidedAR.feedback.rotate')}</li>
                  <li>• "{t('voiceGuidedAR.guide.zoom')}" - {t('voiceGuidedAR.feedback.zoom', { direction: '' })}</li>
                  <li>• "{t('voiceGuidedAR.guide.pan')}" - {t('voiceGuidedAR.feedback.pan', { direction: '' })}</li>
                </ul>
              </div>

              <div>
                <div className="font-medium text-blue-600 mb-1">{t('voiceGuidedAR.guide.control')}</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• "{t('voiceGuidedAR.guide.reset')}" - {t('voiceGuidedAR.guide.reset')}</li>
                  <li>• "{t('voiceGuidedAR.guide.screenshot')}" - {t('voiceGuidedAR.guide.screenshot')}</li>
                  <li>• "{t('voiceGuidedAR.guide.stop')}" - {t('voiceGuidedAR.guide.stop')}</li>
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
            <span className="text-sm">{t('voiceGuidedAR.controls.audioFeedback')}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (enableAudioFeedback) {
                  speak(t('voiceGuidedAR.controls.speakOff'))
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
