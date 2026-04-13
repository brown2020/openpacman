import { useEffect, useRef, useCallback } from "react";
import { SoundManager } from "../utils/soundManager";

type SoundEffect =
  | "dot"
  | "death"
  | "powerPellet"
  | "eatGhost"
  | "fruit"
  | "extraLife"
  | "intro";

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
      dot: () => soundManagerRef.current?.playWakaSound(),
      death: () => soundManagerRef.current?.playDeathSound(),
      powerPellet: () => soundManagerRef.current?.playPowerPelletSound(),
      eatGhost: () => soundManagerRef.current?.playGhostEatSound(),
      fruit: () => soundManagerRef.current?.playFruitSound(),
      extraLife: () => soundManagerRef.current?.playExtraLifeSound(),
      intro: () => soundManagerRef.current?.playIntroJingle(),
    };

    sounds[effect]?.();
  }, []);

  const startSiren = useCallback((speed = 1) => {
    if (!soundManagerRef.current || isMutedRef.current) return;
    soundManagerRef.current.startSiren(speed);
  }, []);

  const stopSiren = useCallback(() => {
    soundManagerRef.current?.stopSiren();
  }, []);

  const startFrightenedSiren = useCallback(() => {
    if (!soundManagerRef.current || isMutedRef.current) return;
    soundManagerRef.current.startFrightenedSiren();
  }, []);

  const updateSirenSpeed = useCallback((speed: number) => {
    soundManagerRef.current?.updateSirenSpeed(speed);
  }, []);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    soundManagerRef.current?.toggleMute();
    return isMutedRef.current;
  }, []);

  return {
    playSound,
    toggleMute,
    startSiren,
    stopSiren,
    startFrightenedSiren,
    updateSirenSpeed,
  };
};
