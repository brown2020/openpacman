import React from "react";
import {
  Position,
  Direction,
  Ghost as GhostType,
  MazeCell,
} from "../types/types";
import { CELL_SIZE } from "../constants/gameConstants";
import { WallsLayer } from "./board/WallsLayer";
import { DotsLayer } from "./board/DotsLayer";
import { EntitiesLayer } from "./board/EntitiesLayer";

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
  if (!level || level.length === 0) return null;

  // Calculate board dimensions
  const width = level[0].length * CELL_SIZE;
  const height = level.length * CELL_SIZE;

  // Helper function to render overlay
  const renderOverlay = () => {
    if (!gameOver && !gameWon) return null;

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-50">
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
        <WallsLayer level={level} />
        <DotsLayer dots={dots} />
        <EntitiesLayer
          ghosts={ghosts}
          pacmanPos={pacmanPos}
          direction={direction}
          mouthOpen={mouthOpen}
          gameOver={gameOver}
        />
        {renderOverlay()}
      </div>
    </div>
  );
};
