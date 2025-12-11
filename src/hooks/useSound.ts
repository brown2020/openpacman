import { useEffect, useRef, useCallback } from "react";
import { SoundManager } from "../utils/soundManager";

type SoundEffect = "dot" | "death" | "powerPellet" | "eatGhost";

export const useSound = () => {
  const soundManagerRef = useRef<SoundManager | null>(null);
  const isMutedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      soundManagerRef.current = new SoundManager();
    }

    return () => {
      soundManagerRef.current?.cleanup();
    };
  }, []);

  const playSound = useCallback((effect: SoundEffect) => {
    if (!soundManagerRef.current || isMutedRef.current) return;

    const sounds: Record<SoundEffect, () => void> = {
      dot: () => soundManagerRef.current?.playDotSound(),
      death: () => soundManagerRef.current?.playDeathSound(),
      powerPellet: () => soundManagerRef.current?.playPowerPelletSound(),
      eatGhost: () => soundManagerRef.current?.playGhostEatSound(),
    };

    sounds[effect]?.();
  }, []);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    soundManagerRef.current?.toggleMute();
    return isMutedRef.current;
  }, []);

  return { playSound, toggleMute, isMuted: isMutedRef.current };
};
