/**
 * Notification Sound Manager
 * Uses Web Audio API to play notification sounds
 */

class NotificationSoundManager {
  private audioContext: AudioContext | null = null;
  private soundEnabled: boolean = true;

  /**
   * Initialize Audio Context (must be called after user interaction)
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (globalThis.AudioContext || (globalThis as any).webkitAudioContext)();
    }
  }

  /**
   * Play notification sound for critical priority
   */
  async playCriticalAlert(): Promise<void> {
    if (!this.soundEnabled) return;
    
    this.initAudioContext();
    if (!this.audioContext) return;

    try {
      // Create oscillator for beep sound
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // High-pitched urgent beep
      oscillator.frequency.value = 800; // Hz
      oscillator.type = 'sine';

      // Volume envelope (fade in/out)
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.2);

      oscillator.start(now);
      oscillator.stop(now + 0.2);

      // Play second beep
      setTimeout(() => {
        const oscillator2 = this.audioContext!.createOscillator();
        const gainNode2 = this.audioContext!.createGain();

        oscillator2.connect(gainNode2);
        gainNode2.connect(this.audioContext!.destination);

        oscillator2.frequency.value = 1000; // Hz
        oscillator2.type = 'sine';

        const now2 = this.audioContext!.currentTime;
        gainNode2.gain.setValueAtTime(0, now2);
        gainNode2.gain.linearRampToValueAtTime(0.3, now2 + 0.01);
        gainNode2.gain.linearRampToValueAtTime(0.3, now2 + 0.1);
        gainNode2.gain.linearRampToValueAtTime(0, now2 + 0.2);

        oscillator2.start(now2);
        oscillator2.stop(now2 + 0.2);
      }, 250);
    } catch (error) {
      console.error('[NotificationSound] Error playing critical alert:', error);
    }
  }

  /**
   * Play notification sound for high priority
   */
  async playHighAlert(): Promise<void> {
    if (!this.soundEnabled) return;
    
    this.initAudioContext();
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Medium-pitched beep
      oscillator.frequency.value = 600; // Hz
      oscillator.type = 'sine';

      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.15);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.25);

      oscillator.start(now);
      oscillator.stop(now + 0.25);
    } catch (error) {
      console.error('[NotificationSound] Error playing high alert:', error);
    }
  }

  /**
   * Play notification sound for medium/low priority
   */
  async playStandardAlert(): Promise<void> {
    if (!this.soundEnabled) return;
    
    this.initAudioContext();
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Gentle beep
      oscillator.frequency.value = 400; // Hz
      oscillator.type = 'sine';

      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.2);

      oscillator.start(now);
      oscillator.stop(now + 0.2);
    } catch (error) {
      console.error('[NotificationSound] Error playing standard alert:', error);
    }
  }

  /**
   * Play sound based on priority level
   */
  async playNotification(priority: 'critical' | 'high' | 'medium' | 'low'): Promise<void> {
    switch (priority) {
      case 'critical':
        await this.playCriticalAlert();
        break;
      case 'high':
        await this.playHighAlert();
        break;
      default:
        await this.playStandardAlert();
        break;
    }
  }

  /**
   * Enable notification sounds
   */
  enable(): void {
    this.soundEnabled = true;
    console.log('[NotificationSound] Enabled');
  }

  /**
   * Disable notification sounds
   */
  disable(): void {
    this.soundEnabled = false;
    console.log('[NotificationSound] Disabled');
  }

  /**
   * Toggle notification sounds
   */
  toggle(): boolean {
    this.soundEnabled = !this.soundEnabled;
    console.log('[NotificationSound]', this.soundEnabled ? 'Enabled' : 'Disabled');
    return this.soundEnabled;
  }

  /**
   * Check if sound is enabled
   */
  isEnabled(): boolean {
    return this.soundEnabled;
  }
}

// Singleton instance
const notificationSound = new NotificationSoundManager();

export default notificationSound;
