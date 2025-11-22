import React, { memo } from "react";
import { Position, Direction, Ghost as GhostType } from "../../types/types";
import { Ghost } from "../Ghost";
import { Pacman } from "../Pacman";

interface EntitiesLayerProps {
  ghosts: GhostType[];
  pacmanPos: Position;
  direction: Direction;
  mouthOpen: boolean;
  gameOver: boolean;
}

export const EntitiesLayer: React.FC<EntitiesLayerProps> = memo(
  ({ ghosts, pacmanPos, direction, mouthOpen, gameOver }) => {
    return (
      <>
        {ghosts.map((ghost, index) => (
          <Ghost
            key={`ghost-${index}`}
            position={ghost.position}
            color={ghost.color}
          />
        ))}
        
        {!gameOver && (
          <Pacman
            position={pacmanPos}
            direction={direction}
            mouthOpen={mouthOpen}
          />
        )}
      </>
    );
  }
);

EntitiesLayer.displayName = "EntitiesLayer";

