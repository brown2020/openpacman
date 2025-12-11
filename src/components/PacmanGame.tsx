"use client";
import React, { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { GameBoard } from "./GameBoard";
import { StartScreen } from "./StartScreen";
import { LEVELS } from "../levels/gameLevels";
import { useGameStore } from "../stores/game-store";
import { useGameLoop } from "../hooks/useGameLoop";
import { useInput } from "../hooks/useInput";

export const PacmanGame: React.FC = () => {
  // Grouped state selectors for better performance
  const {
    gameState,
    pacmanPos,
    pacmanPrevPos,
    direction,
    dots,
    powerPellets,
    ghosts,
    mouthOpen,
    highScores,
    isPaused,
  } = useGameStore(
    useShallow((s) => ({
      gameState: s.gameState,
      pacmanPos: s.pacmanPos,
      pacmanPrevPos: s.pacmanPrevPos,
      direction: s.direction,
      dots: s.dots,
      powerPellets: s.powerPellets,
      ghosts: s.ghosts,
      mouthOpen: s.mouthOpen,
      highScores: s.highScores,
      isPaused: s.isPaused,
    }))
  );

  // Actions (stable references)
  const { startGame, togglePause } = useGameStore(
    useShallow((s) => ({
      startGame: s.startGame,
      togglePause: s.togglePause,
    }))
  );

  // Hooks
  useGameLoop();
  const { handleTouchStart } = useInput();

  // Memoize current level
  const currentLevel = useMemo(
    () => LEVELS[gameState.level]?.layout || LEVELS[0].layout,
    [gameState.level]
  );

  // Calculate progress
  const progress = useMemo(() => {
    const totalItems = gameState.totalDots;
    const remaining = dots.length + powerPellets.length;
    return totalItems > 0
      ? Math.round(((totalItems - remaining) / totalItems) * 100)
      : 0;
  }, [gameState.totalDots, dots.length, powerPellets.length]);

  // Show start screen when not playing
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
      className="flex flex-col items-center justify-center min-h-screen arcade-bg select-none p-4"
      onTouchStart={handleTouchStart}
    >
      {/* Header Stats */}
      <div className="flex flex-wrap justify-center gap-6 mb-6 text-center">
        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Level
          </span>
          <span className="text-2xl font-bold text-blue-400 font-arcade text-glow-blue">
            {gameState.level + 1}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Score
          </span>
          <span className="text-2xl font-bold text-yellow-400 font-arcade text-glow-yellow">
            {gameState.score.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            High Score
          </span>
          <span className="text-2xl font-bold text-green-400 font-arcade text-glow-green">
            {gameState.highScore.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Lives
          </span>
          <div className="flex gap-1">
            {Array.from({ length: gameState.lives }).map((_, i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#FFE135" />
                <path d="M 12,12 L 22,8 A 10,10 0 1,0 22,16 Z" fill="#000" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #FFE135 0%, #FF6B00 100%)",
              boxShadow: "0 0 10px rgba(255, 225, 53, 0.5)",
            }}
          />
        </div>
      </div>

      {/* Game Board */}
      <GameBoard
        level={currentLevel}
        dots={dots}
        powerPellets={powerPellets}
        ghosts={ghosts}
        pacmanPos={pacmanPos}
        pacmanPrevPos={pacmanPrevPos}
        direction={direction}
        mouthOpen={mouthOpen}
        gameOver={gameState.gameOver}
        gameWon={gameState.gameWon}
        isPaused={isPaused}
        isPowerMode={gameState.powerPelletActive}
      />

      {/* Controls hint */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <div className="text-sm text-gray-500">
          {!gameState.gameOver && !gameState.gameWon ? (
            <>
              <span className="hidden md:inline">
                Arrow keys or WASD to move •{" "}
              </span>
              <span className="md:hidden">Swipe to move • </span>
              <span>ESC/P to pause</span>
            </>
          ) : (
            "Press Start to play again"
          )}
        </div>

        <button
          onClick={togglePause}
          className="md:hidden px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg 
                     hover:bg-gray-800 active:bg-gray-700 transition-colors"
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
      </div>

      {/* Power Mode Indicator */}
      {gameState.powerPelletActive && (
        <div
          className="mt-4 px-4 py-2 rounded-full text-sm font-bold"
          style={{
            background: "linear-gradient(90deg, #2121DE 0%, #5555FF 100%)",
            boxShadow: "0 0 20px rgba(33, 33, 222, 0.6)",
            animation: "pulse 0.5s ease-in-out infinite",
          }}
        >
          ⚡ POWER MODE ACTIVE ⚡
        </div>
      )}
    </div>
  );
};

export default PacmanGame;
