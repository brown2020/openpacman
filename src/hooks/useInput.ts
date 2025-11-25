import { useEffect, useCallback, useRef } from "react";
import { useGameStore } from "../stores/game-store";
import { isValidMove, getNextPosition } from "../utils/gameUtils";
import { LEVELS } from "../levels/gameLevels";
import { DIRECTIONS, TOUCH } from "../constants/gameConstants";
import type { Direction } from "../types/types";

export const useInput = () => {
  const isPlaying = useGameStore((s) => s.gameState.isPlaying);
  const isPaused = useGameStore((s) => s.isPaused);
  const gameOver = useGameStore((s) => s.gameState.gameOver);
  const gameWon = useGameStore((s) => s.gameState.gameWon);
  const level = useGameStore((s) => s.gameState.level);
  const pacmanPos = useGameStore((s) => s.pacmanPos);
  const direction = useGameStore((s) => s.direction);

  const setDirection = useGameStore((s) => s.setDirection);
  const setNextDirection = useGameStore((s) => s.setNextDirection);
  const togglePause = useGameStore((s) => s.togglePause);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const trySetDirection = useCallback((newDir: Direction) => {
    if (!isPlaying || gameOver || gameWon || isPaused) return;

    const layout = LEVELS[level]?.layout || LEVELS[0].layout;
    const nextPos = getNextPosition(pacmanPos, newDir);

    // If the move is immediately valid, set it as current direction
    if (isValidMove(nextPos, layout)) {
      setDirection(newDir);
    } else {
      // Queue it as next direction to try
      setNextDirection(newDir);
    }
  }, [isPlaying, isPaused, gameOver, gameWon, level, pacmanPos, setDirection, setNextDirection]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Handle pause with Escape or P
    if (e.key === "Escape" || e.key === "p" || e.key === "P") {
      if (isPlaying && !gameOver && !gameWon) {
        e.preventDefault();
        togglePause();
      }
      return;
    }

    if (!isPlaying || gameOver || gameWon || isPaused) return;

    let newDirection: Direction | null = null;

    switch (e.key) {
      case "ArrowLeft":
      case "a":
      case "A":
        newDirection = DIRECTIONS.LEFT;
        break;
      case "ArrowRight":
      case "d":
      case "D":
        newDirection = DIRECTIONS.RIGHT;
        break;
      case "ArrowUp":
      case "w":
      case "W":
        newDirection = DIRECTIONS.UP;
        break;
      case "ArrowDown":
      case "s":
      case "S":
        newDirection = DIRECTIONS.DOWN;
        break;
      default:
        return;
    }

    if (newDirection) {
      e.preventDefault();
      trySetDirection(newDirection);
    }
  }, [isPlaying, isPaused, gameOver, gameWon, togglePause, trySetDirection]);

  // Swipe handling for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!isPlaying || gameOver || gameWon) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }, [isPlaying, gameOver, gameWon]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current || isPaused) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Check if swipe is long enough
    if (Math.abs(deltaX) < TOUCH.MIN_SWIPE_DISTANCE && 
        Math.abs(deltaY) < TOUCH.MIN_SWIPE_DISTANCE) {
      return;
    }

    e.preventDefault();

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      trySetDirection(deltaX > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
    } else {
      trySetDirection(deltaY > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
    }

    // Reset touch start to allow continuous swiping
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }, [isPaused, trySetDirection]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  // Register keyboard listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Register touch listeners
  useEffect(() => {
    const options = { passive: false };
    document.addEventListener("touchmove", handleTouchMove, options);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return { 
    handleTouchStart,
    handleTouchEnd,
  };
};
