import { useEffect, useRef, useCallback } from "react";
import { SoundManager } from "../utils/soundManager";

export const useSound = () => {
  const soundManagerRef = useRef<SoundManager | null>(null);

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

  const playSound = useCallback((effect: "dot" | "death") => {
    if (!soundManagerRef.current) return;
    if (effect === "dot") {
      soundManagerRef.current.playDotSound();
    } else if (effect === "death") {
      soundManagerRef.current.playDeathSound();
    }
  }, []);

  return { playSound };
};

