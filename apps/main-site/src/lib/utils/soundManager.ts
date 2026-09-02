class SoundManager {
  private static instance: SoundManager;
  private isMuted: boolean = false;
  private lastPlayTime: number = 0;
  private audioContext: AudioContext | null = null;
  private isAutoplayAllowed: boolean = true;

  private constructor() {
    if (typeof window !== "undefined") {
      this.isMuted = localStorage.getItem("h4s_pms_muted") === "true";
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initializes the AudioContext on user interaction to satisfy browser autoplay policies
   */
  public init(): void {
    if (typeof window === "undefined") return;
    if (!this.audioContext) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      } catch (err) {
        console.warn("Web Audio API not supported by browser", err);
      }
    }

    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume().then(() => {
        this.isAutoplayAllowed = true;
      }).catch(() => {
        this.isAutoplayAllowed = false;
      });
    }
  }

  /**
   * Play a luxurious, synthesized double-tone notification chime
   */
  public playAlert(): void {
    if (typeof window === "undefined" || this.isMuted) return;

    // Deduplication check: Avoid repeat alert spam (throttle 2 seconds)
    const now = Date.now();
    if (now - this.lastPlayTime < 2000) return;
    this.lastPlayTime = now;

    this.init();

    if (!this.audioContext) return;

    try {
      const ctx = this.audioContext;
      
      // Tone 1 (Soft futuristic chime - E.g. Note G5 at 784 Hz)
      this.synthesizeTone(ctx, 783.99, 0.0, 0.4);
      
      // Tone 2 (Soft ascending confirmation chime - E.g. Note C6 at 1046.5 Hz)
      setTimeout(() => {
        this.synthesizeTone(ctx, 1046.50, 0.0, 0.5);
      }, 150);

    } catch (err) {
      console.warn("Chime synthesis blocked or failed due to browser policies:", err);
      this.isAutoplayAllowed = false;
    }
  }

  private synthesizeTone(ctx: AudioContext, frequency: number, delay: number, duration: number): void {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Sinusoidal waves create premium, round flute-like chimes
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Luxurious volume fade-out decay envelope to sound extremely clean
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.02); // max volume peak
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration + 0.05);
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("h4s_pms_muted", String(muted));
    }
  }

  public getMuteStatus(): boolean {
    return this.isMuted;
  }

  public checkAutoplayPermission(): boolean {
    return this.isAutoplayAllowed;
  }
}

export const soundManager = SoundManager.getInstance();
