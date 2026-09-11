class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private shankhAudio: HTMLAudioElement | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Synthesize authentic resonant brass temple bell chime using Web Audio API
  playTempleBell() {
    try {
      this.initCtx();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const frequencies = [1200, 2410, 3620, 4850];
      const gains = [0.6, 0.3, 0.15, 0.08];

      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(gains[idx], now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 3.0);
      });
    } catch (e) {
      console.warn('Audio bell play failed', e);
    }
  }

  // Play uploaded Shankh audio file (/audio/shank.mp3 or /audio/shankh.mp3)
  playShankh() {
    if (this.isMuted) return;

    try {
      if (typeof window !== 'undefined') {
        // Stop previous Shankh sound if playing
        if (this.shankhAudio) {
          this.shankhAudio.pause();
          this.shankhAudio.currentTime = 0;
        }

        // Try user's uploaded shank.mp3 file first, then shankh.mp3
        const audio = new Audio('/audio/shank.mp3');
        this.shankhAudio = audio;

        audio.play().catch(() => {
          // If shank.mp3 fails, try shankh.mp3
          const fallbackAudio = new Audio('/audio/shankh.mp3');
          this.shankhAudio = fallbackAudio;
          fallbackAudio.play().catch(() => {
            // Fallback to Web Audio synthesis if file is unplayable
            this.playShankhSynth();
          });
        });

        return;
      }
    } catch (e) {
      console.warn('Shankh audio play failed, falling back to synth', e);
    }

    this.playShankhSynth();
  }

  // Synthesize Shankh sound fallback
  private playShankhSynth() {
    try {
      this.initCtx();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.8);
      osc.frequency.setValueAtTime(330, now + 1.5);
      osc.frequency.exponentialRampToValueAtTime(220, now + 2.5);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.6);
      gain.gain.linearRampToValueAtTime(0.3, now + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.8);
    } catch (e) {
      console.warn('Shankh audio play failed', e);
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.shankhAudio) {
      this.shankhAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }
}

export const audioEngine = new AudioEngine();
