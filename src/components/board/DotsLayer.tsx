import React, { memo } from "react";
import { Position } from "../../types/types";
import { CELL_SIZE } from "../../constants/gameConstants";

interface DotsLayerProps {
  dots: Position[];
}

export const DotsLayer: React.FC<DotsLayerProps> = memo(({ dots }) => {
  return (
    <>
      {dots.map((dot) => (
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
      ))}
    </>
  );
});

DotsLayer.displayName = "DotsLayer";

