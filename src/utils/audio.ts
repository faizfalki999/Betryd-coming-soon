// Sound Engine playing custom user audio assets
const LOGO_SPIN_AUDIO_URL = '/assets/logo spin.mp3.mpeg';
const POPUP_AUDIO_URL = '/assets/Pop up.mp3.mpeg';

class SoundEngine {
  public enabled: boolean = true;
  public volume: number = 0.3; // 30% volume
  private logoSpinAudio: HTMLAudioElement | null = null;
  private popUpAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.logoSpinAudio = new Audio(LOGO_SPIN_AUDIO_URL);
        this.logoSpinAudio.volume = this.volume;
        this.logoSpinAudio.preload = 'auto';

        this.popUpAudio = new Audio(POPUP_AUDIO_URL);
        this.popUpAudio.volume = this.volume;
        this.popUpAudio.preload = 'auto';
      } catch (err) {
        console.warn('Audio preloading notice:', err);
      }
    }
  }

  // Set master volume for sound effects (0.0 to 1.0)
  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.logoSpinAudio) this.logoSpinAudio.volume = this.volume;
    if (this.popUpAudio) this.popUpAudio.volume = this.volume;
  }

  // Play logo spin audio effect when user interacts / spins the logo
  playLogoSpinSound() {
    if (!this.enabled) return;
    try {
      if (this.logoSpinAudio) {
        this.logoSpinAudio.currentTime = 0;
        this.logoSpinAudio.volume = this.volume;
        this.logoSpinAudio.play().catch(() => {});
      } else {
        const audio = new Audio(LOGO_SPIN_AUDIO_URL);
        audio.volume = this.volume;
        audio.play().catch(() => {});
      }
    } catch {
      // Audio swallow
    }
  }

  // Play pop up sound effect when the form opens
  playModalOpenSound() {
    if (!this.enabled) return;
    try {
      if (this.popUpAudio) {
        this.popUpAudio.currentTime = 0;
        this.popUpAudio.volume = this.volume;
        this.popUpAudio.play().catch(() => {});
      } else {
        const audio = new Audio(POPUP_AUDIO_URL);
        audio.volume = this.volume;
        audio.play().catch(() => {});
      }
    } catch {
      // Audio swallow
    }
  }

  // Soft grab / click interaction sound
  playGrabSound() {
    this.playLogoSpinSound();
  }

  // Soft release interaction sound
  playReleaseSound() {
    // Release swallow
  }

  // Soft click sound for UI buttons
  playClickSound() {
    this.playLogoSpinSound();
  }
}

export const sounds = new SoundEngine();

