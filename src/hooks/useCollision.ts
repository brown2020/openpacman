import { useEffect } from "react";
import { useGameStore } from "../stores/game-store";
import { LEVELS } from "../levels/gameLevels";
import { useSound } from "./useSound";

export const useCollision = () => {
  const gameState = useGameStore((s) => s.gameState);
  const pacmanPos = useGameStore((s) => s.pacmanPos);
  const ghosts = useGameStore((s) => s.ghosts);
  const dots = useGameStore((s) => s.dots);
  
  const setDots = useGameStore((s) => s.setDots);
  const setGameOver = useGameStore((s) => s.setGameOver);
  const incrementScoreForDot = useGameStore((s) => s.incrementScoreForDot);
  const updateGameState = useGameStore((s) => s.updateGameState);
  const resetEntitiesAfterDeath = useGameStore((s) => s.resetEntitiesAfterDeath);
  const startGame = useGameStore((s) => s.startGame);

  const { playSound } = useSound();

  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon) return;

    // Check ghost collisions
    const checkCollision = ghosts.some(
      (ghost) =>
        ghost.position.x === pacmanPos.x && ghost.position.y === pacmanPos.y
    );

    if (checkCollision && !gameState.powerPelletActive) {
      playSound("death");

      const newLives = gameState.lives - 1;
      if (newLives <= 0) {
        setGameOver();
      } else {
        updateGameState((prev) => ({
          ...prev,
          lives: newLives,
        }));
        resetEntitiesAfterDeath();
      }
      return;
    }

    // Check dot collection
    const remainingDots = dots.filter(
      (dot) => dot.x !== pacmanPos.x || dot.y !== pacmanPos.y
    );

    if (remainingDots.length < dots.length) {
      playSound("dot");
      incrementScoreForDot();
      setDots(remainingDots);

      if (remainingDots.length === 0) {
        if (gameState.level === LEVELS.length - 1) {
          updateGameState((prev) => ({
            ...prev,
            gameWon: true,
            isPlaying: false,
            gameStateType: "GAME_WON",
          }));
        } else {
          updateGameState((prev) => ({
            ...prev,
            gameWon: true,
            gameStateType: "LEVEL_COMPLETE",
          }));
          setTimeout(() => startGame(gameState.level + 1), 2000);
        }
      }
    }
  }, [
    pacmanPos,
    dots,
    ghosts,
    gameState.isPlaying,
    gameState.gameOver,
    gameState.gameWon,
    gameState.powerPelletActive,
    gameState.lives,
    gameState.level,
    playSound,
    setGameOver,
    updateGameState,
    resetEntitiesAfterDeath,
    incrementScoreForDot,
    setDots,
    startGame,
  ]);
};

