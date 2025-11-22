import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "../stores/game-store";
import { GHOST_MOVEMENT_INTERVAL, MOUTH_ANIMATION_INTERVAL } from "../constants/gameConstants";

export const useGameLoop = () => {
  const isPlaying = useGameStore((s) => s.gameState.isPlaying);
  const gameOver = useGameStore((s) => s.gameState.gameOver);
  const gameWon = useGameStore((s) => s.gameState.gameWon);
  const moveGhosts = useGameStore((s) => s.moveGhosts);
  const toggleMouth = useGameStore((s) => s.toggleMouth);

  const ghostIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mouthIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopLoop = useCallback(() => {
    if (ghostIntervalRef.current) {
      clearInterval(ghostIntervalRef.current);
      ghostIntervalRef.current = null;
    }
    if (mouthIntervalRef.current) {
      clearInterval(mouthIntervalRef.current);
      mouthIntervalRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    stopLoop(); // Ensure clean start

    if (isPlaying && !gameOver && !gameWon) {
      ghostIntervalRef.current = setInterval(() => {
        moveGhosts();
      }, GHOST_MOVEMENT_INTERVAL);

      mouthIntervalRef.current = setInterval(() => {
        toggleMouth();
      }, MOUTH_ANIMATION_INTERVAL);
    }
  }, [isPlaying, gameOver, gameWon, moveGhosts, toggleMouth, stopLoop]);

  useEffect(() => {
    startLoop();
    return () => stopLoop();
  }, [startLoop, stopLoop]);

  return { startLoop, stopLoop };
};

