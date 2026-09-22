"use client";

import React, { memo } from "react";
import type {
  Position,
  Direction,
  Ghost as GhostType,
  CellType,
  Fruit as FruitType,
  ScorePopup,
} from "../types/types";
import { CELL_SIZE } from "../constants/gameConstants";
import { WallsLayer } from "./board/WallsLayer";
import { DotsLayer } from "./board/DotsLayer";
import { EntitiesLayer } from "./board/EntitiesLayer";
import { BoardOverlays } from "./board/BoardOverlays";
import { ScorePopupsLayer } from "./board/ScorePopupsLayer";
import { Fruit } from "./Fruit";

interface GameBoardProps {
  level: CellType[][];
  dots: Position[];
  powerPellets: Position[];
  ghosts: GhostType[];
  pacmanPos: Position;
  direction: Direction;
  mouthOpen: boolean;
  gameOver: boolean;
  gameWon: boolean;
  isPaused: boolean;
  isPowerMode: boolean;
  isReady?: boolean;
  fruit?: FruitType | null;
  scorePopups?: ScorePopup[];
  isTransitioning?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = memo(
  ({
    level,
    dots,
    powerPellets,
    ghosts,
    pacmanPos,
    direction,
    mouthOpen,
    gameOver,
    gameWon,
    isPaused,
    isPowerMode,
    isReady = false,
    fruit = null,
    scorePopups,
    isTransitioning = false,
  }) => {
    if (!level || level.length === 0) return null;

    const width = level[0].length * CELL_SIZE;
    const height = level.length * CELL_SIZE;

    return (
      <div className="relative">
        <div
          className={`relative rounded-lg overflow-hidden crt-glow scanlines ${
            isTransitioning ? "level-flash" : ""
          }`}
          style={{
            width,
            height,
            background:
              "linear-gradient(180deg, #0D0D2B 0%, #000000 50%, #0D0D2B 100%)",
          }}
          role="img"
          aria-label="Pac-Man game board"
        >
          <div
            className="absolute inset-0 grid-pattern pointer-events-none opacity-30"
            style={{ zIndex: 1 }}
          />

          <WallsLayer level={level} />
          <DotsLayer dots={dots} powerPellets={powerPellets} />

          {fruit && fruit.visible && (
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 15 }}
              width={width}
              height={height}
            >
              <Fruit fruit={fruit} />
            </svg>
          )}

          <EntitiesLayer
            ghosts={ghosts}
            pacmanPos={pacmanPos}
            direction={direction}
            mouthOpen={mouthOpen}
            gameOver={gameOver}
            isPowerMode={isPowerMode}
          />

          <ScorePopupsLayer scorePopups={scorePopups} />

          <BoardOverlays
            gameOver={gameOver}
            gameWon={gameWon}
            isPaused={isPaused}
            isReady={isReady}
            isPowerMode={isPowerMode}
          />
        </div>
      </div>
    );
  }
);

GameBoard.displayName = "GameBoard";
