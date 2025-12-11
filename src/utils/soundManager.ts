// utils/soundManager.ts
import { SOUND } from "../constants/gameConstants";

interface WebAudioAPI extends Window {
  webkitAudioContext: typeof AudioContext;
}

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private isMuted = false;
  private masterGain: GainNode | null = null;

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

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : SOUND.VOLUME.MASTER;
    }
    return this.isMuted;
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volumeMultiplier = 1
  ): void {
    if (
      !this.ensureAudioContext() ||
      this.isMuted ||
      !this.audioContext ||
      !this.masterGain
    )
      return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );

    const volume = SOUND.VOLUME.EFFECTS * volumeMultiplier;
    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + duration
    );

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  public playDotSound(): void {
    this.playTone(
      SOUND.EFFECTS.DOT_FREQUENCY,
      SOUND.EFFECTS.DOT_DURATION,
      "sine",
      0.3
    );
  }

  public playDeathSound(): void {
    if (
      !this.ensureAudioContext() ||
      this.isMuted ||
      !this.audioContext ||
      !this.masterGain
    )
      return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(
      SOUND.EFFECTS.DEATH_START_FREQUENCY,
      this.audioContext.currentTime
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      SOUND.EFFECTS.DEATH_END_FREQUENCY,
      this.audioContext.currentTime + SOUND.EFFECTS.DEATH_DURATION
    );

    gainNode.gain.setValueAtTime(
      SOUND.VOLUME.EFFECTS * 0.5,
      this.audioContext.currentTime
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + SOUND.EFFECTS.DEATH_DURATION
    );

    oscillator.start();
    oscillator.stop(
      this.audioContext.currentTime + SOUND.EFFECTS.DEATH_DURATION
    );
  }

  public playPowerPelletSound(): void {
    if (
      !this.ensureAudioContext() ||
      this.isMuted ||
      !this.audioContext ||
      !this.masterGain
    )
      return;

    const frequencies = [262, 330, 392, 523];
    const noteDuration = 0.08;

    frequencies.forEach((freq, i) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(
        freq,
        this.audioContext!.currentTime + i * noteDuration
      );

      gainNode.gain.setValueAtTime(
        0,
        this.audioContext!.currentTime + i * noteDuration
      );
      gainNode.gain.linearRampToValueAtTime(
        SOUND.VOLUME.EFFECTS * 0.4,
        this.audioContext!.currentTime + i * noteDuration + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext!.currentTime + (i + 1) * noteDuration
      );

      oscillator.start(this.audioContext!.currentTime + i * noteDuration);
      oscillator.stop(
        this.audioContext!.currentTime + (i + 1) * noteDuration + 0.05
      );
    });
  }

  public playGhostEatSound(): void {
    if (
      !this.ensureAudioContext() ||
      this.isMuted ||
      !this.audioContext ||
      !this.masterGain
    )
      return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      800,
      this.audioContext.currentTime + 0.15
    );

    gainNode.gain.setValueAtTime(
      SOUND.VOLUME.EFFECTS * 0.4,
      this.audioContext.currentTime
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.2
    );

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  public cleanup(): void {
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

export default SoundManager;
