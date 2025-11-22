"use client";
import React from "react";
import { GameBoard } from "./GameBoard";
import { StartScreen } from "./StartScreen";
import { LEVELS } from "../levels/gameLevels";
import { useGameStore } from "../stores/game-store";
import { useGameLoop } from "../hooks/useGameLoop";
import { useInput } from "../hooks/useInput";
import { useCollision } from "../hooks/useCollision";

export const PacmanGame: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const pacmanPos = useGameStore((s) => s.pacmanPos);
  const direction = useGameStore((s) => s.direction);
  const dots = useGameStore((s) => s.dots);
  const ghosts = useGameStore((s) => s.ghosts);
  const mouthOpen = useGameStore((s) => s.mouthOpen);
  const highScores = useGameStore((s) => s.highScores);
  const startGame = useGameStore((s) => s.startGame);
  
  // Use extracted hooks
  useGameLoop();
  const { handleTouchStart } = useInput();
  useCollision();

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
      className="flex flex-col items-center gap-4 p-4 select-none"
      onTouchStart={handleTouchStart}
    >
      <div className="flex gap-8 text-2xl font-bold text-white">
        <div>Level: {gameState.level + 1}</div>
        <div>Score: {gameState.score}</div>
        <div>Lives: {gameState.lives}</div>
      </div>

      <GameBoard
        level={LEVELS[gameState.level]?.layout || LEVELS[0].layout}
        dots={dots}
        ghosts={ghosts}
        pacmanPos={pacmanPos}
        direction={direction}
        mouthOpen={mouthOpen}
        gameOver={gameState.gameOver}
        gameWon={gameState.gameWon}
      />

      <div className="text-sm text-gray-400">
        {!gameState.gameOver && !gameState.gameWon
          ? "Use arrow keys or swipe to move"
          : "Press Start to play again"}
      </div>
    </div>
  );
};

export default PacmanGame;
