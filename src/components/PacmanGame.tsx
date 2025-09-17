// components/PacmanGame.tsx
"use client";
import React, { useEffect, useCallback, useRef } from "react";
import { GameBoard } from "./GameBoard";
import { StartScreen } from "./StartScreen";
import { GameScore } from "../types/types";
import { LEVELS } from "../levels/gameLevels";
import {
  GHOST_MOVEMENT_INTERVAL,
  MOUTH_ANIMATION_INTERVAL,
  STORAGE_KEYS,
} from "../constants/gameConstants";
import { isValidMove } from "../utils/gameUtils";
import { SoundManager } from "../utils/soundManager";
import { useGameStore } from "../stores/game-store";

export const PacmanGame: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const pacmanPos = useGameStore((s) => s.pacmanPos);
  const direction = useGameStore((s) => s.direction);
  const dots = useGameStore((s) => s.dots);
  const ghosts = useGameStore((s) => s.ghosts);
  const mouthOpen = useGameStore((s) => s.mouthOpen);
  const highScores = useGameStore((s) => s.highScores);
  const startGame = useGameStore((s) => s.startGame);
  const setPacmanPos = useGameStore((s) => s.setPacmanPos);
  const setDirection = useGameStore((s) => s.setDirection);
  const setGhosts = useGameStore((s) => s.setGhosts);
  const setDots = useGameStore((s) => s.setDots);
  const toggleMouth = useGameStore((s) => s.toggleMouth);
  const setHighScores = useGameStore((s) => s.setHighScores);
  const updateGameState = useGameStore((s) => s.updateGameState);
  const resetEntitiesAfterDeath = useGameStore(
    (s) => s.resetEntitiesAfterDeath
  );
  const incrementScoreForDot = useGameStore((s) => s.incrementScoreForDot);

  // Refs
  const soundManagerRef = useRef<SoundManager | null>(null);
  const ghostMoveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load high scores after mount
  useEffect(() => {
    const savedScores = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    if (savedScores) {
      try {
        setHighScores(JSON.parse(savedScores));
      } catch (e) {
        console.error("Error loading high scores:", e);
        setHighScores([]);
      }
    }
  }, [setHighScores]);

  // Initialize sound manager
  useEffect(() => {
    soundManagerRef.current = new SoundManager();
    return () => {
      if (soundManagerRef.current) {
        soundManagerRef.current.cleanup();
      }
    };
  }, []);

  // Sound effect helper
  const playSoundEffect = useCallback((effect: "dot" | "death") => {
    if (!soundManagerRef.current) return;
    if (effect === "dot") {
      soundManagerRef.current.playDotSound();
    } else if (effect === "death") {
      soundManagerRef.current.playDeathSound();
    }
  }, []);

  // Save high score
  const saveHighScore = useCallback(
    (score: number, level: number) => {
      const timestamp = Date.now();
      const newScore: GameScore = {
        score,
        level,
        date: timestamp,
        timestamp,
        completion: ((level + 1) / LEVELS.length) * 100,
        ghostsEaten: 0,
      };

      const newHighScores = [...highScores, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      localStorage.setItem(
        STORAGE_KEYS.HIGH_SCORES,
        JSON.stringify(newHighScores)
      );
      setHighScores(newHighScores);
    },
    [highScores, setHighScores]
  );

  // Ghost movement logic
  const updateGhosts = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon) return;

    const currentGhosts = useGameStore.getState().ghosts;
    const newGhosts = currentGhosts.map((ghost) => {
      const dx = pacmanPos.x - ghost.position.x;
      const dy = pacmanPos.y - ghost.position.y;

      const newPos = { ...ghost.position };

      if (Math.random() < 0.8) {
        if (Math.abs(dx) > Math.abs(dy)) {
          newPos.x += Math.sign(dx);
        } else {
          newPos.y += Math.sign(dy);
        }
      } else {
        const directions = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 },
        ];
        const randomDir =
          directions[Math.floor(Math.random() * directions.length)];
        newPos.x += randomDir.x;
        newPos.y += randomDir.y;
      }

      if (isValidMove(newPos, LEVELS[gameState.level].layout)) {
        return { ...ghost, position: newPos };
      }
      return ghost;
    });

    setGhosts(newGhosts);
  }, [
    gameState.isPlaying,
    gameState.gameOver,
    gameState.gameWon,
    gameState.level,
    pacmanPos,
    setGhosts,
  ]);

  // Ghost movement interval
  useEffect(() => {
    if (ghostMoveIntervalRef.current) {
      clearInterval(ghostMoveIntervalRef.current);
    }

    if (gameState.isPlaying && !gameState.gameOver && !gameState.gameWon) {
      ghostMoveIntervalRef.current = setInterval(() => {
        updateGhosts();
      }, GHOST_MOVEMENT_INTERVAL);
    }

    return () => {
      if (ghostMoveIntervalRef.current) {
        clearInterval(ghostMoveIntervalRef.current);
      }
    };
  }, [
    gameState.isPlaying,
    gameState.gameOver,
    gameState.gameWon,
    updateGhosts,
  ]);

  // Start game wrapper to clear ghost interval then delegate to store
  const startGameWrapped = useCallback(
    (level: number = 0) => {
      if (ghostMoveIntervalRef.current) {
        clearInterval(ghostMoveIntervalRef.current);
      }
      startGame(level);
    },
    [startGame]
  );

  // Mouth animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (gameState.isPlaying && !gameState.gameOver && !gameState.gameWon) {
      intervalId = setInterval(() => {
        toggleMouth();
      }, MOUTH_ANIMATION_INTERVAL);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [gameState.isPlaying, gameState.gameOver, gameState.gameWon, toggleMouth]);

  // Collision detection and game events
  useEffect(() => {
    if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon) return;

    // Check ghost collisions
    const checkCollision = ghosts.some(
      (ghost) =>
        ghost.position.x === pacmanPos.x && ghost.position.y === pacmanPos.y
    );

    if (checkCollision && !gameState.powerPelletActive) {
      playSoundEffect("death");

      const newLives = gameState.lives - 1;
      if (newLives <= 0) {
        updateGameState((prev) => ({
          ...prev,
          gameOver: true,
          isPlaying: false,
          gameStateType: "GAME_OVER",
          lives: 0,
        }));
        saveHighScore(gameState.score, gameState.level);
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
      playSoundEffect("dot");
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
          setTimeout(() => startGameWrapped(gameState.level + 1), 2000);
        }
      }
    }
  }, [
    pacmanPos,
    dots,
    ghosts,
    gameState,
    playSoundEffect,
    saveHighScore,
    startGameWrapped,
    updateGameState,
    resetEntitiesAfterDeath,
    incrementScoreForDot,
    setDots,
  ]);

  // Handle keyboard input
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon)
        return;

      let newPos = { ...pacmanPos };

      switch (e.key) {
        case "ArrowLeft":
          newPos = { ...pacmanPos, x: pacmanPos.x - 1 };
          setDirection("left");
          break;
        case "ArrowRight":
          newPos = { ...pacmanPos, x: pacmanPos.x + 1 };
          setDirection("right");
          break;
        case "ArrowUp":
          newPos = { ...pacmanPos, y: pacmanPos.y - 1 };
          setDirection("up");
          break;
        case "ArrowDown":
          newPos = { ...pacmanPos, y: pacmanPos.y + 1 };
          setDirection("down");
          break;
        default:
          return;
      }

      if (isValidMove(newPos, LEVELS[gameState.level].layout)) {
        setPacmanPos(newPos);
      }
    },
    [
      pacmanPos,
      gameState.isPlaying,
      gameState.gameOver,
      gameState.gameWon,
      gameState.level,
      setDirection,
      setPacmanPos,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Handle touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon)
        return;

      const touch = e.touches[0];
      const touchStartX = touch.clientX;
      const touchStartY = touch.clientY;

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

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

  if (!gameState.isPlaying) {
    return (
      <StartScreen
        onStart={() => startGameWrapped(0)}
        score={gameState.score}
        highScores={highScores}
        gameOver={gameState.gameOver}
        gameWon={gameState.gameWon}
      />
    );
  }

  return (
    <div
      className="flex flex-col items-center gap-4 p-4"
      onTouchStart={handleTouchStart}
    >
      <div className="text-2xl font-bold">Level: {gameState.level + 1}</div>
      <div className="text-2xl font-bold">Score: {gameState.score}</div>
      <div className="text-xl">Lives: {gameState.lives}</div>

      <GameBoard
        level={LEVELS[gameState.level].layout}
        dots={dots}
        ghosts={ghosts}
        pacmanPos={pacmanPos}
        direction={direction}
        mouthOpen={mouthOpen}
        gameOver={gameState.gameOver}
        gameWon={gameState.gameWon}
      />

      <div className="text-sm text-gray-600">
        {!gameState.gameOver && !gameState.gameWon
          ? "Use arrow keys or swipe to move"
          : "Press Start to play again"}
      </div>
    </div>
  );
};

export default PacmanGame;
