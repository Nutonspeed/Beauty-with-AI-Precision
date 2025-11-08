/**
 * Voice Recognition Manager
 * Web Speech API integration for Thai voice-to-text input
 */

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => unknown) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => unknown) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => unknown) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => unknown) | null;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type VoiceRecognitionStatus = 
  | 'idle'          // Not started
  | 'listening'     // Actively listening
  | 'processing'    // Processing speech
  | 'error';        // Error occurred

export type VoiceRecognitionError = 
  | 'not-supported'      // Browser doesn't support Speech API
  | 'no-speech'          // No speech detected
  | 'audio-capture'      // Microphone not available
  | 'not-allowed'        // Permission denied
  | 'network'            // Network error
  | 'aborted'            // Recognition aborted
  | 'unknown';           // Unknown error

export interface VoiceRecognitionCallbacks {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onStatusChange?: (status: VoiceRecognitionStatus) => void;
  onError?: (error: VoiceRecognitionError, message: string) => void;
  onEnd?: () => void;
}

class VoiceRecognitionManager {
  private recognition: SpeechRecognition | null = null;
  private isSupported = false;
  private currentStatus: VoiceRecognitionStatus = 'idle';
  private callbacks: VoiceRecognitionCallbacks = {};

  constructor() {
    this.initRecognition();
  }

  /**
   * Initialize Speech Recognition API
   */
  private initRecognition(): void {
    if (typeof globalThis.window === 'undefined') {
      console.warn('[VoiceRecognition] Not running in browser environment');
      return;
    }

    const SpeechRecognitionAPI = 
      globalThis.window.SpeechRecognition || 
      globalThis.window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn('[VoiceRecognition] Speech Recognition API not supported');
      this.isSupported = false;
      return;
    }

    try {
      this.recognition = new SpeechRecognitionAPI();
      this.setupRecognition();
      this.isSupported = true;
      console.log('[VoiceRecognition] Speech Recognition initialized');
    } catch (error) {
      console.error('[VoiceRecognition] Failed to initialize:', error);
      this.isSupported = false;
    }
  }

  /**
   * Configure recognition settings
   */
  private setupRecognition(): void {
    if (!this.recognition) return;

    // Recognition settings
    this.recognition.continuous = false;          // Stop after one result
    this.recognition.interimResults = true;       // Get partial results
    this.recognition.lang = 'th-TH';              // Thai language
    this.recognition.maxAlternatives = 1;         // Only need best match

    // Event handlers
    this.recognition.onstart = () => {
      console.log('[VoiceRecognition] Started listening');
      this.updateStatus('listening');
    };

    this.recognition.onaudiostart = () => {
      console.log('[VoiceRecognition] Audio capture started');
    };

    this.recognition.onspeechstart = () => {
      console.log('[VoiceRecognition] Speech detected');
      this.updateStatus('processing');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript;
      const isFinal = result.isFinal;

      console.log('[VoiceRecognition] Transcript:', { transcript, isFinal, confidence: result[0].confidence });
      
      if (this.callbacks.onTranscript) {
        this.callbacks.onTranscript(transcript, isFinal);
      }

      // Auto-stop on final result
      if (isFinal) {
        this.stop();
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('[VoiceRecognition] Error:', event.error, event.message);
      
      let errorType: VoiceRecognitionError;
      switch (event.error) {
        case 'no-speech':
          errorType = 'no-speech';
          break;
        case 'audio-capture':
          errorType = 'audio-capture';
          break;
        case 'not-allowed':
          errorType = 'not-allowed';
          break;
        case 'network':
          errorType = 'network';
          break;
        case 'aborted':
          errorType = 'aborted';
          break;
        default:
          errorType = 'unknown';
      }

      this.updateStatus('error');
      
      if (this.callbacks.onError) {
        this.callbacks.onError(errorType, event.message || event.error);
      }
    };

    this.recognition.onend = () => {
      console.log('[VoiceRecognition] Recognition ended');
      this.updateStatus('idle');
      
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd();
      }
    };
  }

  /**
   * Update status and notify callback
   */
  private updateStatus(status: VoiceRecognitionStatus): void {
    this.currentStatus = status;
    
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(status);
    }
  }

  /**
   * Check if Speech Recognition is supported
   */
  public isBrowserSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Start voice recognition
   */
  public start(callbacks: VoiceRecognitionCallbacks = {}): boolean {
    if (!this.isSupported || !this.recognition) {
      if (callbacks.onError) {
        callbacks.onError('not-supported', 'Speech Recognition API is not supported in this browser');
      }
      return false;
    }

    if (this.currentStatus === 'listening' || this.currentStatus === 'processing') {
      console.warn('[VoiceRecognition] Already listening');
      return false;
    }

    this.callbacks = callbacks;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('[VoiceRecognition] Failed to start:', error);
      
      if (callbacks.onError) {
        callbacks.onError('unknown', error instanceof Error ? error.message : 'Unknown error');
      }
      
      return false;
    }
  }

  /**
   * Stop voice recognition
   */
  public stop(): void {
    if (!this.recognition) return;

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('[VoiceRecognition] Failed to stop:', error);
    }
  }

  /**
   * Abort voice recognition
   */
  public abort(): void {
    if (!this.recognition) return;

    try {
      this.recognition.abort();
      this.updateStatus('idle');
    } catch (error) {
      console.error('[VoiceRecognition] Failed to abort:', error);
    }
  }

  /**
   * Get current status
   */
  public getStatus(): VoiceRecognitionStatus {
    return this.currentStatus;
  }

  /**
   * Check if currently listening
   */
  public isListening(): boolean {
    return this.currentStatus === 'listening' || this.currentStatus === 'processing';
  }

  /**
   * Change language
   */
  public setLanguage(lang: string): void {
    if (!this.recognition) return;
    this.recognition.lang = lang;
    console.log('[VoiceRecognition] Language set to:', lang);
  }

  /**
   * Get user-friendly error message
   */
  public getErrorMessage(error: VoiceRecognitionError): string {
    return VoiceRecognitionManager.getErrorMessage(error);
  }

  /**
   * Get user-friendly error message (static)
   */
  public static getErrorMessage(error: VoiceRecognitionError): string {
    switch (error) {
      case 'not-supported':
        return 'เบราว์เซอร์นี้ไม่รองรับการพูดเป็นข้อความ กรุณาใช้ Chrome, Edge หรือ Safari';
      case 'no-speech':
        return 'ไม่ได้ยินเสียงพูด กรุณาลองอีกครั้ง';
      case 'audio-capture':
        return 'ไม่พบไมโครโฟน กรุณาตรวจสอบอุปกรณ์';
      case 'not-allowed':
        return 'กรุณาอนุญาตการเข้าถึงไมโครโฟนในการตั้งค่าเบราว์เซอร์';
      case 'network':
        return 'เกิดข้อผิดพลาดเครือข่าย กรุณาตรวจสอบการเชื่อมต่อ';
      case 'aborted':
        return 'ยกเลิกการบันทึกเสียง';
      default:
        return 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
    }
  }
}

// Singleton instance
export const voiceRecognition = new VoiceRecognitionManager();
