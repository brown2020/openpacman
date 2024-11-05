// components/PacmanGame.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { GameBoard } from "./GameBoard";
import { StartScreen } from "./StartScreen";
import {
  Position,
  Direction,
  Ghost,
  GameState,
  GameScore,
} from "../types/types";
import { LEVELS } from "../levels/gameLevels";
import {
  GHOST_MOVEMENT_INTERVAL,
  MOUTH_ANIMATION_INTERVAL,
  INITIAL_POSITION,
  STORAGE_KEYS,
} from "../constants/gameConstants";
import {
  isValidMove,
  getInitialDots,
  getInitialGhosts,
} from "../utils/gameUtils";
import { SoundManager } from "../utils/soundManager";

// Initial game state
const initialGameState: GameState = {
  isPlaying: false,
  gameOver: false,
  gameWon: false,
  level: 0,
  score: 0,
  highScore: 0,
  lives: 3,
  paused: false,
  gameStateType: "READY",
  powerPelletActive: false,
  dotsEaten: 0,
  totalDots: getInitialDots(LEVELS[0].layout).length,
  ghostsEaten: 0,
};

export const PacmanGame: React.FC = () => {
  // Game State
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [pacmanPos, setPacmanPos] = useState<Position>(INITIAL_POSITION);
  const [direction, setDirection] = useState<Direction>("right");
  const [dots, setDots] = useState<Position[]>([]);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [mouthOpen, setMouthOpen] = useState(true);
  const [highScores, setHighScores] = useState<GameScore[]>([]);

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
  }, []);

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
  const saveHighScore = useCallback((score: number, level: number) => {
    const timestamp = Date.now();
    const newScore: GameScore = {
      score,
      level,
      date: timestamp,
      timestamp,
      completion: ((level + 1) / LEVELS.length) * 100,
      ghostsEaten: 0,
    };

    setHighScores((prevScores) => {
      const newHighScores = [...prevScores, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      localStorage.setItem(
        STORAGE_KEYS.HIGH_SCORES,
        JSON.stringify(newHighScores)
      );
      return newHighScores;
    });
  }, []);

  // Ghost movement logic
  const updateGhosts = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon) return;

    setGhosts((currentGhosts) =>
      currentGhosts.map((ghost) => {
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
      })
    );
  }, [
    gameState.isPlaying,
    gameState.gameOver,
    gameState.gameWon,
    gameState.level,
    pacmanPos,
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

  // Start game
  const startGame = useCallback(
    (level: number = 0) => {
      if (ghostMoveIntervalRef.current) {
        clearInterval(ghostMoveIntervalRef.current);
      }

      const newGameState = {
        ...initialGameState,
        isPlaying: true,
        level,
        score: level === 0 ? 0 : gameState.score,
        highScore: gameState.highScore,
        totalDots: getInitialDots(LEVELS[level].layout).length,
      };

      setGameState(newGameState);
      setPacmanPos(INITIAL_POSITION);
      setDirection("right");
      setDots(getInitialDots(LEVELS[level].layout));
      setGhosts(getInitialGhosts());
      setMouthOpen(true);
    },
    [gameState.score, gameState.highScore]
  );

  // Mouth animation
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (gameState.isPlaying && !gameState.gameOver && !gameState.gameWon) {
      intervalId = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, MOUTH_ANIMATION_INTERVAL);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [gameState.isPlaying, gameState.gameOver, gameState.gameWon]);

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
        setGameState((prev) => ({
          ...prev,
          gameOver: true,
          isPlaying: false,
          gameStateType: "GAME_OVER",
          lives: 0,
        }));
        saveHighScore(gameState.score, gameState.level);
      } else {
        setGameState((prev) => ({
          ...prev,
          lives: newLives,
        }));
        setPacmanPos(INITIAL_POSITION);
        setGhosts(getInitialGhosts());
      }
      return;
    }

    // Check dot collection
    const remainingDots = dots.filter(
      (dot) => dot.x !== pacmanPos.x || dot.y !== pacmanPos.y
    );

    if (remainingDots.length < dots.length) {
      playSoundEffect("dot");
      setGameState((prev) => ({
        ...prev,
        score: prev.score + 10,
        dotsEaten: prev.dotsEaten + 1,
        highScore: Math.max(prev.highScore, prev.score + 10),
      }));
      setDots(remainingDots);

      if (remainingDots.length === 0) {
        if (gameState.level === LEVELS.length - 1) {
          setGameState((prev) => ({
            ...prev,
            gameWon: true,
            isPlaying: false,
            gameStateType: "GAME_WON",
          }));
        } else {
          setGameState((prev) => ({
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
    gameState,
    playSoundEffect,
    saveHighScore,
    startGame,
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
        onStart={() => startGame(0)}
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
