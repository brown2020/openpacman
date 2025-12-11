import React, { memo } from "react";
import type {
  Position,
  Direction,
  Ghost as GhostType,
  CellType,
} from "../types/types";
import { CELL_SIZE } from "../constants/gameConstants";
import { WallsLayer } from "./board/WallsLayer";
import { DotsLayer } from "./board/DotsLayer";
import { EntitiesLayer } from "./board/EntitiesLayer";

interface GameBoardProps {
  level: CellType[][];
  dots: Position[];
  powerPellets: Position[];
  ghosts: GhostType[];
  pacmanPos: Position;
  pacmanPrevPos?: Position;
  direction: Direction;
  mouthOpen: boolean;
  gameOver: boolean;
  gameWon: boolean;
  isPaused: boolean;
  isPowerMode: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = memo(
  ({
    level,
    dots,
    powerPellets,
    ghosts,
    pacmanPos,
    pacmanPrevPos,
    direction,
    mouthOpen,
    gameOver,
    gameWon,
    isPaused,
    isPowerMode,
  }) => {
    if (!level || level.length === 0) return null;

    const width = level[0].length * CELL_SIZE;
    const height = level.length * CELL_SIZE;

    return (
      <div className="relative">
        {/* Game board container with CRT effect */}
        <div
          className="relative rounded-lg overflow-hidden crt-glow scanlines"
          style={{
            width,
            height,
            background:
              "linear-gradient(180deg, #0D0D2B 0%, #000000 50%, #0D0D2B 100%)",
          }}
        >
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 grid-pattern pointer-events-none opacity-30"
            style={{ zIndex: 1 }}
          />

          {/* Walls Layer */}
          <WallsLayer level={level} />

          {/* Dots and Power Pellets Layer */}
          <DotsLayer dots={dots} powerPellets={powerPellets} />

          {/* Entities Layer (Ghosts + Pacman) */}
          <EntitiesLayer
            ghosts={ghosts}
            pacmanPos={pacmanPos}
            pacmanPrevPos={pacmanPrevPos}
            direction={direction}
            mouthOpen={mouthOpen}
            gameOver={gameOver}
            isPowerMode={isPowerMode}
          />

          {/* Pause Overlay */}
          {isPaused && !gameOver && !gameWon && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
              <div className="pause-text text-4xl font-bold text-yellow-400 mb-4 tracking-wider">
                PAUSED
              </div>
              <div className="text-lg text-gray-400">
                Press ESC or P to resume
              </div>
            </div>
          )}

          {/* Game Over / Level Complete Overlay */}
          {(gameOver || gameWon) && (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 ${
                gameOver ? "game-over-shake" : "level-flash"
              }`}
            >
              <div
                className={`text-4xl font-bold mb-4 tracking-wider ${
                  gameOver ? "text-red-500" : "text-green-400"
                }`}
                style={{
                  textShadow: gameOver
                    ? "0 0 20px rgba(255, 0, 0, 0.8)"
                    : "0 0 20px rgba(0, 255, 0, 0.8)",
                }}
              >
                {gameOver ? "GAME OVER" : "LEVEL COMPLETE!"}
              </div>
              <div className="text-xl text-gray-300">
                {gameOver ? "Press Start to try again" : "Get ready..."}
              </div>
            </div>
          )}

          {/* Power Mode Overlay Effect */}
          {isPowerMode && !gameOver && !gameWon && (
            <div
              className="absolute inset-0 pointer-events-none z-5"
              style={{
                background:
                  "radial-gradient(circle at center, transparent 30%, rgba(0, 0, 255, 0.1) 100%)",
                animation: "pulse 0.5s ease-in-out infinite",
              }}
            />
          )}
        </div>
      </div>
    );
  }
);

GameBoard.displayName = "GameBoard";
