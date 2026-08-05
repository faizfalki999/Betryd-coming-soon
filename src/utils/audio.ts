// Sound Engine playing custom user audio assets
const LOGO_SPIN_AUDIO_URL = '/assets/logo spin.mp3.mpeg';
const POPUP_AUDIO_URL = '/assets/Pop up.mp3.mpeg';

class SoundEngine {
  public enabled: boolean = true;
  private logoSpinAudio: HTMLAudioElement | null = null;
  private popUpAudio: HTMLAudioElement | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.logoSpinAudio = new Audio(LOGO_SPIN_AUDIO_URL);
        this.logoSpinAudio.preload = 'auto';

        this.popUpAudio = new Audio(POPUP_AUDIO_URL);
        this.popUpAudio.preload = 'auto';
      } catch (err) {
        console.warn('Audio preloading notice:', err);
      }
    }
  }

  // Play logo spin audio effect when user interacts / spins the logo
  playLogoSpinSound() {
    if (!this.enabled) return;
    try {
      if (this.logoSpinAudio) {
        this.logoSpinAudio.currentTime = 0;
        this.logoSpinAudio.volume = 0.85;
        this.logoSpinAudio.play().catch(() => {});
      } else {
        const audio = new Audio(LOGO_SPIN_AUDIO_URL);
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
        this.popUpAudio.volume = 0.9;
        this.popUpAudio.play().catch(() => {});
      } else {
        const audio = new Audio(POPUP_AUDIO_URL);
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
