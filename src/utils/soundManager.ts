// utils/soundManager.ts
import { SOUND } from "../constants/gameConstants";

interface WebAudioAPI extends Window {
  webkitAudioContext: typeof AudioContext;
}

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private isMuted = false;
  private masterGain: GainNode | null = null;

  // Siren state
  private sirenOscillator: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenSpeed = 1;

  // Waka alternation
  private wakaAlternate = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initializeAudioContext();
    }
  }

  private initializeAudioContext(): void {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as WebAudioAPI).webkitAudioContext;

      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = SOUND.VOLUME.MASTER;
      }
    } catch (error) {
      console.warn("Web Audio API not supported:", error);
    }
  }

  private ensureAudioContext(): boolean {
    if (!this.audioContext) return false;

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    return true;
  }

  private withAudioContext(
    fn: (ctx: AudioContext, gain: GainNode) => void
  ): void {
    if (
      !this.ensureAudioContext() ||
      this.isMuted ||
      !this.audioContext ||
      !this.masterGain
    ) {
      return;
    }
    fn(this.audioContext, this.masterGain);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : SOUND.VOLUME.MASTER;
    }
    if (this.isMuted) {
      this.stopSiren();
    }
    return this.isMuted;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volumeMultiplier = 1
  ): void {
    this.withAudioContext((ctx, masterGain) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      const volume = SOUND.VOLUME.EFFECTS * volumeMultiplier;
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    });
  }

  /**
   * Play waka-waka sound (alternating tones)
   */
  public playWakaSound(): void {
    const freq = this.wakaAlternate
      ? SOUND.EFFECTS.WAKA_FREQ_1
      : SOUND.EFFECTS.WAKA_FREQ_2;
    this.wakaAlternate = !this.wakaAlternate;
    this.playTone(freq, SOUND.EFFECTS.WAKA_DURATION, "sine", 0.3);
  }

  /**
   * Play death sound - multi-stage descending melody
   */
  public playDeathSound(): void {
    this.withAudioContext((ctx, masterGain) => {
      const duration = SOUND.EFFECTS.DEATH_DURATION;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      oscillator.type = "sawtooth";

      // Create descending death melody
      const startFreq = SOUND.EFFECTS.DEATH_START_FREQUENCY;
      const endFreq = SOUND.EFFECTS.DEATH_END_FREQUENCY;

      oscillator.frequency.setValueAtTime(startFreq, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        startFreq * 0.7,
        ctx.currentTime + duration * 0.3
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        startFreq * 0.5,
        ctx.currentTime + duration * 0.5
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        endFreq,
        ctx.currentTime + duration
      );

      gainNode.gain.setValueAtTime(SOUND.VOLUME.EFFECTS * 0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    });
  }

  /**
   * Play power pellet collection sound
   */
  public playPowerPelletSound(): void {
    this.withAudioContext((ctx, masterGain) => {
      const frequencies = SOUND.EFFECTS.POWER_FREQUENCIES;
      const noteDuration = 0.08;

      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(
          freq,
          ctx.currentTime + i * noteDuration
        );

        gainNode.gain.setValueAtTime(0, ctx.currentTime + i * noteDuration);
        gainNode.gain.linearRampToValueAtTime(
          SOUND.VOLUME.EFFECTS * 0.4,
          ctx.currentTime + i * noteDuration + 0.01
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + (i + 1) * noteDuration
        );

        oscillator.start(ctx.currentTime + i * noteDuration);
        oscillator.stop(ctx.currentTime + (i + 1) * noteDuration + 0.05);
      });
    });
  }

  /**
   * Play ghost eaten sound
   */
  public playGhostEatSound(): void {
    this.withAudioContext((ctx, masterGain) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(
        SOUND.EFFECTS.GHOST_EAT_START_FREQ,
        ctx.currentTime
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        SOUND.EFFECTS.GHOST_EAT_END_FREQ,
        ctx.currentTime + 0.15
      );

      gainNode.gain.setValueAtTime(SOUND.VOLUME.EFFECTS * 0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.2);
    });
  }

  /**
   * Play fruit eaten sound
   */
  public playFruitSound(): void {
    this.withAudioContext((ctx, masterGain) => {
      // Ascending arpeggio
      const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6
      const noteDuration = 0.06;

      frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
          freq,
          ctx.currentTime + i * noteDuration
        );

        gainNode.gain.setValueAtTime(0, ctx.currentTime + i * noteDuration);
        gainNode.gain.linearRampToValueAtTime(
          SOUND.VOLUME.EFFECTS * 0.4,
          ctx.currentTime + i * noteDuration + 0.01
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + (i + 1) * noteDuration
        );

        oscillator.start(ctx.currentTime + i * noteDuration);
        oscillator.stop(ctx.currentTime + (i + 1) * noteDuration + 0.05);
      });
    });
  }

  /**
   * Play extra life sound
   */
  public playExtraLifeSound(): void {
    this.withAudioContext((ctx, masterGain) => {
      const melody = [523, 659, 784, 659, 784, 1047]; // Happy ascending melody
      const noteDuration = 0.1;

      melody.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(
          freq,
          ctx.currentTime + i * noteDuration
        );

        gainNode.gain.setValueAtTime(0, ctx.currentTime + i * noteDuration);
        gainNode.gain.linearRampToValueAtTime(
          SOUND.VOLUME.EFFECTS * 0.3,
          ctx.currentTime + i * noteDuration + 0.01
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + (i + 1) * noteDuration
        );

        oscillator.start(ctx.currentTime + i * noteDuration);
        oscillator.stop(ctx.currentTime + (i + 1) * noteDuration + 0.05);
      });
    });
  }

  /**
   * Play intro/ready jingle
   */
  public playIntroJingle(): void {
    this.withAudioContext((ctx, masterGain) => {
      // Classic Pac-Man intro melody (simplified)
      const melody = [
        { freq: 493.88, duration: 0.15 }, // B4
        { freq: 987.77, duration: 0.15 }, // B5
        { freq: 739.99, duration: 0.15 }, // F#5
        { freq: 622.25, duration: 0.15 }, // Eb5
        { freq: 987.77, duration: 0.1 }, // B5
        { freq: 739.99, duration: 0.3 }, // F#5
        { freq: 622.25, duration: 0.4 }, // Eb5
      ];

      let time = ctx.currentTime;

      melody.forEach(({ freq, duration }) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(masterGain);

        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(freq, time);

        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(
          SOUND.VOLUME.EFFECTS * 0.35,
          time + 0.02
        );
        gainNode.gain.setValueAtTime(
          SOUND.VOLUME.EFFECTS * 0.35,
          time + duration - 0.02
        );
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

        oscillator.start(time);
        oscillator.stop(time + duration);

        time += duration;
      });
    });
  }

  /**
   * Start the background siren sound
   */
  public startSiren(speed = 1): void {
    if (this.sirenOscillator || this.isMuted) return;

    this.withAudioContext((ctx, masterGain) => {
      this.sirenOscillator = ctx.createOscillator();
      this.sirenGain = ctx.createGain();

      this.sirenOscillator.connect(this.sirenGain);
      this.sirenGain.connect(masterGain);

      this.sirenOscillator.type = "sine";
      this.sirenSpeed = speed;

      // Create wobbling siren effect
      const baseFreq =
        SOUND.EFFECTS.SIREN_BASE_FREQ +
        (SOUND.EFFECTS.SIREN_MAX_FREQ - SOUND.EFFECTS.SIREN_BASE_FREQ) *
          (speed - 1) *
          0.5;

      this.sirenOscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);

      this.sirenGain.gain.setValueAtTime(
        SOUND.VOLUME.SIREN * 0.3,
        ctx.currentTime
      );

      this.sirenOscillator.start();

      // Create wobble effect with LFO
      this.updateSirenFrequency();
    });
  }

  /**
   * Update siren frequency based on speed
   */
  public updateSirenSpeed(speed: number): void {
    this.sirenSpeed = speed;
    this.updateSirenFrequency();
  }

  private updateSirenFrequency(): void {
    if (!this.sirenOscillator || !this.audioContext) return;

    const baseFreq =
      SOUND.EFFECTS.SIREN_BASE_FREQ +
      (SOUND.EFFECTS.SIREN_MAX_FREQ - SOUND.EFFECTS.SIREN_BASE_FREQ) *
        Math.min(this.sirenSpeed - 1, 1);

    this.sirenOscillator.frequency.setValueAtTime(
      baseFreq,
      this.audioContext.currentTime
    );
  }

  /**
   * Stop the siren
   */
  public stopSiren(): void {
    if (this.sirenOscillator) {
      try {
        this.sirenOscillator.stop();
      } catch {
        // Already stopped
      }
      this.sirenOscillator = null;
    }
    if (this.sirenGain) {
      this.sirenGain = null;
    }
  }

  /**
   * Start frightened mode siren (different sound)
   */
  public startFrightenedSiren(): void {
    this.stopSiren();

    if (this.isMuted) return;

    this.withAudioContext((ctx, masterGain) => {
      this.sirenOscillator = ctx.createOscillator();
      this.sirenGain = ctx.createGain();

      this.sirenOscillator.connect(this.sirenGain);
      this.sirenGain.connect(masterGain);

      // Higher frequency, more urgent sound
      this.sirenOscillator.type = "triangle";
      this.sirenOscillator.frequency.setValueAtTime(220, ctx.currentTime);

      this.sirenGain.gain.setValueAtTime(
        SOUND.VOLUME.SIREN * 0.25,
        ctx.currentTime
      );

      this.sirenOscillator.start();
    });
  }

  public cleanup(): void {
    this.stopSiren();

    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
