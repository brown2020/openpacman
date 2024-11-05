// components/GameBoard.tsx
import React from "react";
import {
  Position,
  Direction,
  Ghost as GhostType,
  MazeCell,
} from "../types/types";
import { CELL_SIZE, CELL_TYPES } from "../constants/gameConstants";

import { Ghost } from "./Ghost";
import { Pacman } from "./Pacman";

interface GameBoardProps {
  level: MazeCell[][];
  dots: Position[];
  ghosts: GhostType[];
  pacmanPos: Position;
  direction: Direction;
  mouthOpen: boolean;
  gameOver: boolean;
  gameWon: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  level,
  dots,
  ghosts,
  pacmanPos,
  direction,
  mouthOpen,
  gameOver,
  gameWon,
}) => {
  // Calculate board dimensions
  const width = level[0].length * CELL_SIZE;
  const height = level.length * CELL_SIZE;

  // Helper function to render walls
  const renderWalls = () => {
    return level.map((row, y) =>
      row.map((cell, x) => {
        if (cell === CELL_TYPES.WALL) {
          return (
            <div
              key={`wall-${x}-${y}`}
              className="absolute bg-blue-900 border border-blue-800"
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
              }}
            />
          );
        }
        return null;
      })
    );
  };

  // Helper function to render dots
  const renderDots = () => {
    return dots.map((dot) => (
      <div
        key={`dot-${dot.x}-${dot.y}`}
        className="absolute bg-yellow-200 rounded-full"
        style={{
          width: 6,
          height: 6,
          left: dot.x * CELL_SIZE + CELL_SIZE / 2 - 3,
          top: dot.y * CELL_SIZE + CELL_SIZE / 2 - 3,
        }}
      />
    ));
  };

  // Helper function to render ghosts
  const renderGhosts = () => {
    return ghosts.map((ghost, index) => (
      <Ghost
        key={`ghost-${index}`}
        position={ghost.position}
        color={ghost.color}
      />
    ));
  };

  // Helper function to render overlay
  const renderOverlay = () => {
    if (!gameOver && !gameWon) return null;

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="text-4xl font-bold text-white mb-4">
          {gameOver ? "Game Over!" : "Level Complete!"}
        </div>
        <div className="text-xl text-yellow-400">
          {gameOver ? "Try again!" : "Get ready for next level..."}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Game board container */}
      <div
        className="relative bg-black rounded-lg overflow-hidden"
        style={{
          width,
          height,
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Game elements */}
        {renderWalls()}
        {renderDots()}
        {renderGhosts()}

        {/* Pacman */}
        {!gameOver && (
          <Pacman
            position={pacmanPos}
            direction={direction}
            mouthOpen={mouthOpen}
          />
        )}

        {/* Overlay for game over or level complete */}
        {renderOverlay()}
      </div>
    </div>
  );
};
