// Voice-Guided AR Hook - Speech recognition for AR interactions
// Enables hands-free AR consultations

import { useState, useEffect, useRef, useCallback } from 'react'

interface VoiceCommand {
  command: string
  confidence: number
  timestamp: number
}

interface VoiceGuidanceOptions {
  language?: string
  continuous?: boolean
  enableFeedback?: boolean
}

export function useVoiceGuidedAR(options: VoiceGuidanceOptions = {}) {
  const { language = 'th-TH', continuous = true, enableFeedback = true } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check for browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      setIsSupported(true)

      const recognition = new SpeechRecognition()
      recognition.lang = language
      recognition.continuous = continuous
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        if (enableFeedback) {
          speak('เริ่มฟังคำสั่ง')
        }
      }

      recognition.onresult = (event) => {
        const results = event.results
        const lastResult = results[results.length - 1]

        if (lastResult.isFinal) {
          const command = lastResult[0].transcript.trim()
          const confidence = lastResult[0].confidence

          setTranscript(command)

          const voiceCommand: VoiceCommand = {
            command: command.toLowerCase(),
            confidence,
            timestamp: Date.now()
          }

          setLastCommand(voiceCommand)
          processVoiceCommand(voiceCommand)
        } else {
          // Interim results
          setTranscript(lastResult[0].transcript)
        }
      }

      recognition.onerror = (event) => {
        setError(event.error)
        setIsListening(false)
        if (enableFeedback) {
          speak(`เกิดข้อผิดพลาด: ${event.error}`)
        }
      }

      recognition.onend = () => {
        setIsListening(false)
        if (continuous && !error) {
          // Restart listening for continuous mode
          setTimeout(() => startListening(), 1000)
        }
      }

      recognitionRef.current = recognition
    } else {
      setError('Speech recognition not supported')
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [language, continuous, enableFeedback, error])

  // Voice command processing
  const processVoiceCommand = useCallback((command: VoiceCommand) => {
    const cmd = command.command

    // AR-specific voice commands
    if (cmd.includes('หมุน') || cmd.includes('rotate')) {
      return { action: 'rotate', direction: 'right' }
    }

    if (cmd.includes('ซูม') || cmd.includes('zoom')) {
      return { action: 'zoom', direction: cmd.includes('เข้า') ? 'in' : 'out' }
    }

    if (cmd.includes('แพน') || cmd.includes('เลื่อน') || cmd.includes('pan')) {
      return { action: 'pan', direction: extractDirection(cmd) }
    }

    if (cmd.includes('รีเซ็ต') || cmd.includes('reset')) {
      return { action: 'reset' }
    }

    if (cmd.includes('ถ่ายรูป') || cmd.includes('screenshot')) {
      return { action: 'screenshot' }
    }

    if (cmd.includes('หยุด') || cmd.includes('stop')) {
      return { action: 'stop_listening' }
    }

    // Fallback - general guidance
    return { action: 'unknown', command: cmd }
  }, [])

  const extractDirection = (command: string): string => {
    if (command.includes('ซ้าย') || command.includes('left')) return 'left'
    if (command.includes('ขวา') || command.includes('right')) return 'right'
    if (command.includes('ขึ้น') || command.includes('up')) return 'up'
    if (command.includes('ลง') || command.includes('down')) return 'down'
    return 'center'
  }

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return

    try {
      recognitionRef.current.start()
    } catch (err) {
      setError('Failed to start voice recognition')
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return

    recognitionRef.current.stop()
  }, [])

  const speak = useCallback((text: string, options: any = {}) => {
    if (!synthRef.current) return

    const utterance = new SpeechSynthesisUtterance(text)

    // Set voice preferences
    if (language.startsWith('th')) {
      // Try to find Thai voice
      const voices = synthRef.current.getVoices()
      const thaiVoice = voices.find((voice: any) => voice.lang.includes('th') || voice.name.includes('Thai'))
      if (thaiVoice) {
        utterance.voice = thaiVoice
      }
    }

    utterance.lang = language
    utterance.rate = options.rate ?? 1
    utterance.pitch = options.pitch ?? 1
    utterance.volume = options.volume ?? 1

    synthRef.current.speak(utterance)
  }, [language])

  const getVoices = useCallback(() => {
    if (!synthRef.current) return []
    return synthRef.current.getVoices()
  }, [])

  return {
    // State
    isListening,
    transcript,
    lastCommand,
    isSupported,
    error,

    // Methods
    startListening,
    stopListening,
    speak,
    getVoices,

    // Processed command result
    processedCommand: lastCommand ? processVoiceCommand(lastCommand) : null
  }
}
