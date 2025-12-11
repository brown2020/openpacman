import React, { memo } from "react";
import type {
  Position,
  Direction,
  Ghost as GhostType,
} from "../../types/types";
import { Ghost } from "../Ghost";
import { Pacman } from "../Pacman";

interface EntitiesLayerProps {
  ghosts: GhostType[];
  pacmanPos: Position;
  pacmanPrevPos?: Position;
  direction: Direction;
  mouthOpen: boolean;
  gameOver: boolean;
  isPowerMode?: boolean;
}

export const EntitiesLayer: React.FC<EntitiesLayerProps> = memo(
  ({
    ghosts,
    pacmanPos,
    pacmanPrevPos,
    direction,
    mouthOpen,
    gameOver,
    isPowerMode,
  }) => {
    return (
      <>
        {/* Render ghosts */}
        {ghosts.map((ghost) => (
          <Ghost
            key={`ghost-${ghost.name}`}
            position={ghost.position}
            color={ghost.color}
            mode={ghost.mode}
            frightenedTimeLeft={ghost.frightenedTimeLeft}
            direction={ghost.direction}
            pacmanPos={pacmanPos}
          />
        ))}

        {/* Render Pacman if game is not over */}
        {!gameOver && (
          <Pacman
            position={pacmanPos}
            prevPosition={pacmanPrevPos}
            direction={direction}
            mouthOpen={mouthOpen}
            isPowerMode={isPowerMode}
          />
        )}
      </>
    );
  }
);

EntitiesLayer.displayName = "EntitiesLayer";
