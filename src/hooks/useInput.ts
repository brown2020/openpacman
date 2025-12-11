import { useEffect, useCallback, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "../stores/game-store";
import { isValidMove, getNextPosition } from "../utils/gameUtils";
import { LEVELS } from "../levels/gameLevels";
import { DIRECTIONS, TOUCH } from "../constants/gameConstants";
import type { Direction } from "../types/types";

export const useInput = () => {
  const { isPlaying, isPaused, gameOver, gameWon, level, pacmanPos } =
    useGameStore(
      useShallow((s) => ({
        isPlaying: s.gameState.isPlaying,
        isPaused: s.isPaused,
        gameOver: s.gameState.gameOver,
        gameWon: s.gameState.gameWon,
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
      if (!isPlaying || gameOver || gameWon || isPaused) return;

      const layout = LEVELS[level]?.layout || LEVELS[0].layout;
      const nextPos = getNextPosition(pacmanPos, newDir);

      if (isValidMove(nextPos, layout)) {
        setDirection(newDir);
      } else {
        setNextDirection(newDir);
      }
    },
    [
      isPlaying,
      isPaused,
      gameOver,
      gameWon,
      level,
      pacmanPos,
      setDirection,
      setNextDirection,
    ]
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

      if (!isPlaying || gameOver || gameWon || isPaused) return;

      const keyDirections: Record<string, Direction> = {
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
      };

      const newDirection = keyDirections[e.key];
      if (newDirection) {
        e.preventDefault();
        trySetDirection(newDirection);
      }
    },
    [isPlaying, isPaused, gameOver, gameWon, togglePause, trySetDirection]
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
      if (!touchStartRef.current || isPaused) return;

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
