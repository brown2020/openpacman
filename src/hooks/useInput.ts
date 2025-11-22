import { useEffect, useCallback } from "react";
import { useGameStore } from "../stores/game-store";
import { isValidMove } from "../utils/gameUtils";
import { LEVELS } from "../levels/gameLevels";

export const useInput = () => {
  const gameState = useGameStore((s) => s.gameState);
  const pacmanPos = useGameStore((s) => s.pacmanPos);
  const setDirection = useGameStore((s) => s.setDirection);
  const setPacmanPos = useGameStore((s) => s.setPacmanPos);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon) return;

      let newPos = { ...pacmanPos };
      let newDirection = null;

      switch (e.key) {
        case "ArrowLeft":
          newPos = { ...pacmanPos, x: pacmanPos.x - 1 };
          newDirection = "left" as const;
          break;
        case "ArrowRight":
          newPos = { ...pacmanPos, x: pacmanPos.x + 1 };
          newDirection = "right" as const;
          break;
        case "ArrowUp":
          newPos = { ...pacmanPos, y: pacmanPos.y - 1 };
          newDirection = "up" as const;
          break;
        case "ArrowDown":
          newPos = { ...pacmanPos, y: pacmanPos.y + 1 };
          newDirection = "down" as const;
          break;
        default:
          return;
      }

      if (isValidMove(newPos, LEVELS[gameState.level].layout)) {
        if (newDirection) setDirection(newDirection);
        setPacmanPos(newPos);
      }
    },
    [gameState, pacmanPos, setDirection, setPacmanPos]
  );

  // Touch handling
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon) return;

      const touch = e.touches[0];
      const touchStartX = touch.clientX;
      const touchStartY = touch.clientY;

      const handleTouchMove = (evt: TouchEvent) => {
        const moveTouch = evt.touches[0];
        const deltaX = moveTouch.clientX - touchStartX;
        const deltaY = moveTouch.clientY - touchStartY;

        // Threshold for swipe
        if (Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) return;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          handleKeyPress(
            new KeyboardEvent("keydown", {
              key: deltaX > 0 ? "ArrowRight" : "ArrowLeft",
            })
          );
        } else {
          handleKeyPress(
            new KeyboardEvent("keydown", {
              key: deltaY > 0 ? "ArrowDown" : "ArrowUp",
            })
          );
        }
        // Remove listener after one valid swipe to prevent continuous movement from one swipe
        document.removeEventListener("touchmove", handleTouchMove);
      };

      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener(
        "touchend",
        () => {
          document.removeEventListener("touchmove", handleTouchMove);
        },
        { once: true }
      );
    },
    [gameState.isPlaying, gameState.gameOver, gameState.gameWon, handleKeyPress]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  return { handleTouchStart };
};

