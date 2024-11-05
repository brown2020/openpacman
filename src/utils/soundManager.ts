// utils/soundManager.ts
import { SOUND } from "../constants/gameConstants";

// Add type for browser audio context
interface WebAudioAPI extends Window {
  webkitAudioContext: typeof AudioContext;
}

interface AudioTrack {
  oscillator: OscillatorNode | null;
  gainNode: GainNode | null;
  duration: number;
}

export class SoundManager {
  private audioContext: AudioContext | null;
  private isMuted: boolean;
  private readonly masterVolume: number;
  private tracks: Map<string, AudioTrack>;
  private backgroundMusic: AudioBufferSourceNode | null;
  private musicGainNode: GainNode | null;

  constructor() {
    this.audioContext = null;
    this.isMuted = false;
    this.masterVolume = SOUND.VOLUME.MASTER;
    this.tracks = new Map();
    this.backgroundMusic = null;
    this.musicGainNode = null;

    if (typeof window !== "undefined") {
      this.initializeAudioContext();
    }
  }

  private initializeAudioContext(): void {
    try {
      // Check for different browser implementations with proper typing
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as WebAudioAPI).webkitAudioContext;

      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.createMasterVolumeControl();
      } else {
        console.warn("Web Audio API is not supported in this browser");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error initializing Audio Context:", error.message);
      } else {
        console.error("Unknown error initializing Audio Context");
      }
    }
  }

  private createMasterVolumeControl(): void {
    if (!this.audioContext) return;

    this.musicGainNode = this.audioContext.createGain();
    this.musicGainNode.connect(this.audioContext.destination);
    this.setMasterVolume(this.masterVolume);
  }

  public setMasterVolume(volume: number): void {
    const safeVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = safeVolume;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = this.isMuted ? 0 : this.masterVolume;
    }
    return this.isMuted;
  }

  public playDotSound(): void {
    if (!this.audioContext || this.isMuted) return;

    const track = this.createTrack();

    if (track.oscillator && track.gainNode) {
      track.oscillator.frequency.setValueAtTime(
        SOUND.EFFECTS.DOT_FREQUENCY,
        this.audioContext.currentTime
      );

      track.gainNode.gain.setValueAtTime(
        SOUND.VOLUME.EFFECTS * this.masterVolume,
        this.audioContext.currentTime
      );

      track.oscillator.start();
      track.oscillator.stop(
        this.audioContext.currentTime + SOUND.EFFECTS.DOT_DURATION
      );

      track.oscillator.onended = () => {
        this.cleanupTrack(track);
      };
    }
  }

  public playDeathSound(): void {
    if (!this.audioContext || this.isMuted) return;

    const track = this.createTrack();

    if (track.oscillator && track.gainNode) {
      track.oscillator.frequency.setValueAtTime(
        SOUND.EFFECTS.DEATH_START_FREQUENCY,
        this.audioContext.currentTime
      );

      track.gainNode.gain.setValueAtTime(
        SOUND.VOLUME.EFFECTS * this.masterVolume,
        this.audioContext.currentTime
      );

      track.oscillator.frequency.linearRampToValueAtTime(
        SOUND.EFFECTS.DEATH_END_FREQUENCY,
        this.audioContext.currentTime + SOUND.EFFECTS.DEATH_DURATION
      );

      track.oscillator.start();
      track.oscillator.stop(
        this.audioContext.currentTime + SOUND.EFFECTS.DEATH_DURATION
      );

      track.oscillator.onended = () => {
        this.cleanupTrack(track);
      };
    }
  }

  private createTrack(): AudioTrack {
    if (!this.audioContext) {
      return { oscillator: null, gainNode: null, duration: 0 };
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.musicGainNode || this.audioContext.destination);

    return { oscillator, gainNode, duration: 0 };
  }

  private cleanupTrack(track: AudioTrack): void {
    if (track.oscillator) {
      track.oscillator.disconnect();
    }
    if (track.gainNode) {
      track.gainNode.disconnect();
    }
  }

  public cleanup(): void {
    this.tracks.forEach((track) => {
      this.cleanupTrack(track);
    });
    this.tracks.clear();

    if (this.backgroundMusic) {
      this.backgroundMusic.disconnect();
      this.backgroundMusic = null;
    }

    if (this.musicGainNode) {
      this.musicGainNode.disconnect();
      this.musicGainNode = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default SoundManager;
