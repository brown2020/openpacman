// utils/soundManager.ts
import { SOUND } from "../constants/gameConstants";

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
      }
    }
  }

  private createMasterVolumeControl(): void {
    if (!this.audioContext) return;

    this.musicGainNode = this.audioContext.createGain();
    this.musicGainNode.connect(this.audioContext.destination);
    this.setMasterVolume(this.masterVolume);
  }

  private ensureAudioContext(): boolean {
    if (!this.audioContext) return false;

    // Resume audio context if suspended (required for user interaction)
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    return true;
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

  public playDotSound(): void {
    if (!this.ensureAudioContext() || this.isMuted || !this.audioContext)
      return;

    const track = this.createTrack();

    if (track.oscillator && track.gainNode) {
      track.oscillator.type = "sine";
      track.oscillator.frequency.setValueAtTime(
        SOUND.EFFECTS.DOT_FREQUENCY,
        this.audioContext.currentTime
      );

      track.gainNode.gain.setValueAtTime(
        SOUND.VOLUME.EFFECTS * this.masterVolume * 0.3,
        this.audioContext.currentTime
      );
      track.gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + SOUND.EFFECTS.DOT_DURATION
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
    if (!this.ensureAudioContext() || this.isMuted || !this.audioContext)
      return;

    const track = this.createTrack();

    if (track.oscillator && track.gainNode) {
      track.oscillator.type = "sawtooth";
      track.oscillator.frequency.setValueAtTime(
        SOUND.EFFECTS.DEATH_START_FREQUENCY,
        this.audioContext.currentTime
      );

      track.gainNode.gain.setValueAtTime(
        SOUND.VOLUME.EFFECTS * this.masterVolume * 0.5,
        this.audioContext.currentTime
      );

      track.oscillator.frequency.exponentialRampToValueAtTime(
        SOUND.EFFECTS.DEATH_END_FREQUENCY,
        this.audioContext.currentTime + SOUND.EFFECTS.DEATH_DURATION
      );
      track.gainNode.gain.exponentialRampToValueAtTime(
        0.001,
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

  public playPowerPelletSound(): void {
    if (!this.ensureAudioContext() || this.isMuted || !this.audioContext)
      return;

    // Create an ascending arpeggio effect
    const frequencies = [262, 330, 392, 523]; // C, E, G, C
    const noteDuration = 0.08;

    frequencies.forEach((freq, i) => {
      const track = this.createTrack();
      if (track.oscillator && track.gainNode && this.audioContext) {
        track.oscillator.type = "square";
        track.oscillator.frequency.setValueAtTime(
          freq,
          this.audioContext.currentTime + i * noteDuration
        );

        track.gainNode.gain.setValueAtTime(
          0,
          this.audioContext.currentTime + i * noteDuration
        );
        track.gainNode.gain.linearRampToValueAtTime(
          SOUND.VOLUME.EFFECTS * this.masterVolume * 0.4,
          this.audioContext.currentTime + i * noteDuration + 0.01
        );
        track.gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioContext.currentTime + (i + 1) * noteDuration
        );

        track.oscillator.start(
          this.audioContext.currentTime + i * noteDuration
        );
        track.oscillator.stop(
          this.audioContext.currentTime + (i + 1) * noteDuration + 0.05
        );

        track.oscillator.onended = () => {
          this.cleanupTrack(track);
        };
      }
    });
  }

  public playGhostEatSound(): void {
    if (!this.ensureAudioContext() || this.isMuted || !this.audioContext)
      return;

    const track = this.createTrack();

    if (track.oscillator && track.gainNode) {
      track.oscillator.type = "square";
      track.oscillator.frequency.setValueAtTime(
        100,
        this.audioContext.currentTime
      );
      track.oscillator.frequency.exponentialRampToValueAtTime(
        800,
        this.audioContext.currentTime + 0.15
      );

      track.gainNode.gain.setValueAtTime(
        SOUND.VOLUME.EFFECTS * this.masterVolume * 0.4,
        this.audioContext.currentTime
      );
      track.gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        this.audioContext.currentTime + 0.2
      );

      track.oscillator.start();
      track.oscillator.stop(this.audioContext.currentTime + 0.2);

      track.oscillator.onended = () => {
        this.cleanupTrack(track);
      };
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
