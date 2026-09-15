// Web Audio API Synthesizer & BGM Manager for Spider-Man Portfolio
type SoundListener = (isEnabled: boolean) => void;

class SoundFX {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private listeners: Set<SoundListener> = new Set();
  private playPromise: Promise<void> | null = null;
  public enabled: boolean = false;
  public isBgmPlaying: boolean = false;

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.enabled);
      } catch (e) {
        console.error("Sound listener error:", e);
      }
    });
  }

  public subscribe(listener: SoundListener): () => void {
    this.listeners.add(listener);
    listener(this.enabled);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.enabled ? 1.0 : 0.0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private initBgm() {
    if (typeof window === "undefined" || this.bgmAudio) return;
    try {
      this.bgmAudio = new Audio("/audio/spiderman.mp3");
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.45;
      this.bgmAudio.muted = !this.enabled;

      this.bgmAudio.addEventListener("play", () => {
        this.isBgmPlaying = true;
        this.notify();
      });

      this.bgmAudio.addEventListener("pause", () => {
        this.isBgmPlaying = false;
        this.notify();
      });

      this.bgmAudio.addEventListener("ended", () => {
        this.isBgmPlaying = false;
        this.notify();
      });

      this.bgmAudio.addEventListener("error", (e) => {
        console.warn("Audio error encountered:", e);
        this.isBgmPlaying = false;
        this.notify();
      });
    } catch {
      // Audio not supported
    }
  }

  public async playBgm() {
    this.initBgm();
    this.getContext();
    if (!this.bgmAudio) return;

    this.bgmAudio.muted = false;
    try {
      this.playPromise = this.bgmAudio.play();
      await this.playPromise;
      this.isBgmPlaying = true;
      this.notify();
    } catch (err) {
      console.warn("Audio play prevented or interrupted:", err);
      this.isBgmPlaying = false;
      this.notify();
    } finally {
      this.playPromise = null;
    }
  }

  public async pauseBgm() {
    if (!this.bgmAudio) return;

    this.bgmAudio.muted = true;
    if (this.playPromise) {
      try {
        await this.playPromise;
      } catch {
        // Ignored
      }
    }

    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
    this.isBgmPlaying = false;
    this.notify();
  }

  public unmute(): void {
    this.enabled = true;
    const ctx = this.getContext();
    if (this.masterGain && ctx) {
      this.masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
    }
    this.playHudBeep(1200);
    this.playBgm();
    this.notify();
  }

  public mute(): void {
    this.enabled = false;
    const ctx = this.getContext();
    if (this.masterGain && ctx) {
      this.masterGain.gain.setValueAtTime(0.0, ctx.currentTime);
    }
    this.pauseBgm();
    this.notify();
  }

  public toggleBgm(): boolean {
    if (this.enabled) {
      this.mute();
      return false;
    } else {
      this.unmute();
      return true;
    }
  }

  // Web Shooter "THWIP!" sound
  public playThwip() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // White noise burst for the air release
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(3200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    noiseFilter.Q.setValueAtTime(4, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);

    // High snap oscillator
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

    oscGain.gain.setValueAtTime(0.18, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Spider-Sense intuitive chime/hum
  public playSpiderSense() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";

    // Modulated chord
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(987.77, now + 0.25);

    osc2.frequency.setValueAtTime(783.99, now);
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  // High-tech HUD Click/Hover
  public playHudBeep(freq = 900) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Suit Activate Sound
  public playSuitPower() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 0.4);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.45);
  }
}

export const soundManager = new SoundFX();
