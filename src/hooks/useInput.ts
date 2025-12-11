import { useEffect, useCallback, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore, selectCanPlay } from "../stores/game-store";
import { isValidMove, getNextPosition } from "../utils/gameUtils";
import { getLayout } from "../levels/gameLevels";
import { DIRECTIONS, TOUCH } from "../constants/gameConstants";
import type { Direction } from "../types/types";

// Static key-to-direction mapping (hoisted for performance)
const KEY_DIRECTIONS: Readonly<Record<string, Direction>> = {
  ArrowLeft: DIRECTIONS.LEFT,
  a: DIRECTIONS.LEFT,
  A: DIRECTIONS.LEFT,
  ArrowRight: DIRECTIONS.RIGHT,
  d: DIRECTIONS.RIGHT,
  D: DIRECTIONS.RIGHT,
  ArrowUp: DIRECTIONS.UP,
  w: DIRECTIONS.UP,
  W: DIRECTIONS.UP,
  ArrowDown: DIRECTIONS.DOWN,
  s: DIRECTIONS.DOWN,
  S: DIRECTIONS.DOWN,
} as const;

export const useInput = () => {
  const { canPlay, isPlaying, gameOver, gameWon, isPaused, level, pacmanPos } =
    useGameStore(
      useShallow((s) => ({
        canPlay: selectCanPlay(s),
        isPlaying: s.gameState.isPlaying,
        gameOver: s.gameState.gameOver,
        gameWon: s.gameState.gameWon,
        isPaused: s.isPaused,
        level: s.gameState.level,
        pacmanPos: s.pacmanPos,
      }))
    );

  const { setDirection, setNextDirection, togglePause } = useGameStore(
    useShallow((s) => ({
      setDirection: s.setDirection,
      setNextDirection: s.setNextDirection,
      togglePause: s.togglePause,
    }))
  );

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const trySetDirection = useCallback(
    (newDir: Direction) => {
      if (!canPlay) return;

      const layout = getLayout(level);
      const nextPos = getNextPosition(pacmanPos, newDir);

      if (isValidMove(nextPos, layout)) {
        setDirection(newDir);
      } else {
        setNextDirection(newDir);
      }
    },
    [canPlay, level, pacmanPos, setDirection, setNextDirection]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        if (isPlaying && !gameOver && !gameWon) {
          e.preventDefault();
          togglePause();
        }
        return;
      }

      if (!canPlay) return;

      const newDirection = KEY_DIRECTIONS[e.key];
      if (newDirection) {
        e.preventDefault();
        trySetDirection(newDirection);
      }
    },
    [canPlay, isPlaying, gameOver, gameWon, togglePause, trySetDirection]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | TouchEvent) => {
      if (!isPlaying || gameOver || gameWon) return;

      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [isPlaying, gameOver, gameWon]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!touchStartRef.current || !canPlay) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      if (
        Math.abs(deltaX) < TOUCH.MIN_SWIPE_DISTANCE &&
        Math.abs(deltaY) < TOUCH.MIN_SWIPE_DISTANCE
      ) {
        return;
      }

      e.preventDefault();

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        trySetDirection(deltaX > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
      } else {
        trySetDirection(deltaY > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
      }

      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [isPaused, trySetDirection]
  );

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const options = { passive: false };
    document.addEventListener("touchmove", handleTouchMove, options);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return { handleTouchStart, handleTouchEnd };
};
