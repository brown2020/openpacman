import React, { memo } from "react";
import { MazeCell } from "../../types/types";
import { CELL_SIZE, CELL_TYPES } from "../../constants/gameConstants";

interface WallsLayerProps {
  level: MazeCell[][];
}

export const WallsLayer: React.FC<WallsLayerProps> = memo(({ level }) => {
  return (
    <>
      {level.map((row, y) =>
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
      )}
    </>
  );
});

WallsLayer.displayName = "WallsLayer";

