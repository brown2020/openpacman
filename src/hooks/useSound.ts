import { useEffect, useRef, useCallback } from "react";
import { SoundManager } from "../utils/soundManager";

type SoundEffect = "dot" | "death" | "powerPellet" | "eatGhost" | "levelComplete" | "gameOver";

export const useSound = () => {
  const soundManagerRef = useRef<SoundManager | null>(null);
  const isMutedRef = useRef(false);

  useEffect(() => {
    // Initialize sound manager only on client side
    if (typeof window !== "undefined") {
      soundManagerRef.current = new SoundManager();
    }

    return () => {
      if (soundManagerRef.current) {
        soundManagerRef.current.cleanup();
      }
    };
  }, []);

  const playSound = useCallback((effect: SoundEffect) => {
    if (!soundManagerRef.current || isMutedRef.current) return;
    
    switch (effect) {
      case "dot":
        soundManagerRef.current.playDotSound();
        break;
      case "death":
        soundManagerRef.current.playDeathSound();
        break;
      case "powerPellet":
        soundManagerRef.current.playPowerPelletSound?.();
        break;
      case "eatGhost":
        soundManagerRef.current.playGhostEatSound?.();
        break;
      default:
        break;
    }
  }, []);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    if (soundManagerRef.current) {
      soundManagerRef.current.toggleMute();
    }
    return isMutedRef.current;
  }, []);

  return { playSound, toggleMute, isMuted: isMutedRef.current };
};
