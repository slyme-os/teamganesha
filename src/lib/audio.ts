class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private backgroundAudio: HTMLAudioElement | null = null;

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

      // Primary bell frequency (~1200 Hz with harmonic overtones)
      const frequencies = [1200, 2410, 3620, 4850];
      const gains = [0.6, 0.3, 0.15, 0.08];

      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Exponential decay for realistic bell resonance
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

  // Synthesize Conch Shell / Shankh sound
  playShankh() {
    try {
      this.initCtx();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      // Low resonant frequency swelling upwards
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
    if (this.backgroundAudio) {
      this.backgroundAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }

  getMuted(): boolean {
    return this.isMuted;
  }
}

export const audioEngine = new AudioEngine();
