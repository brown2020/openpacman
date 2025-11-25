import React, { memo, useMemo } from "react";
import { MazeCell } from "../../types/types";
import { CELL_SIZE, CELL_TYPES } from "../../constants/gameConstants";

interface WallsLayerProps {
  level: MazeCell[][];
}

interface WallNeighbors {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

const getWallNeighbors = (
  level: MazeCell[][],
  x: number,
  y: number
): WallNeighbors => {
  const isWall = (cellX: number, cellY: number): boolean => {
    if (cellY < 0 || cellY >= level.length) return true;
    if (cellX < 0 || cellX >= level[0].length) return true;
    return level[cellY][cellX] === CELL_TYPES.WALL;
  };

  return {
    top: isWall(x, y - 1),
    right: isWall(x + 1, y),
    bottom: isWall(x, y + 1),
    left: isWall(x - 1, y),
  };
};

const WallCell: React.FC<{ x: number; y: number; neighbors: WallNeighbors }> = memo(
  ({ x, y, neighbors }) => {
    // Calculate border radius based on neighbors
    const borderRadius = useMemo(() => {
      const radius = 4;
      return {
        borderTopLeftRadius: !neighbors.top && !neighbors.left ? radius : 0,
        borderTopRightRadius: !neighbors.top && !neighbors.right ? radius : 0,
        borderBottomLeftRadius: !neighbors.bottom && !neighbors.left ? radius : 0,
        borderBottomRightRadius: !neighbors.bottom && !neighbors.right ? radius : 0,
      };
    }, [neighbors]);

    // Calculate border visibility
    const borders = useMemo(() => ({
      borderTop: !neighbors.top ? '2px solid #4444FF' : 'none',
      borderRight: !neighbors.right ? '2px solid #4444FF' : 'none',
      borderBottom: !neighbors.bottom ? '2px solid #4444FF' : 'none',
      borderLeft: !neighbors.left ? '2px solid #4444FF' : 'none',
    }), [neighbors]);

    return (
      <div
        className="absolute"
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          left: x * CELL_SIZE,
          top: y * CELL_SIZE,
          background: 'linear-gradient(135deg, #1B1464 0%, #0D0D2B 100%)',
          ...borderRadius,
          ...borders,
          boxSizing: 'border-box',
        }}
      >
        {/* Inner glow effect */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(68, 68, 255, 0.15) 0%, transparent 60%)',
            ...borderRadius,
          }}
        />
      </div>
    );
  }
);

WallCell.displayName = "WallCell";

export const WallsLayer: React.FC<WallsLayerProps> = memo(({ level }) => {
  const walls = useMemo(() => {
    const wallElements: Array<{
      key: string;
      x: number;
      y: number;
      neighbors: WallNeighbors;
    }> = [];

    level.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === CELL_TYPES.WALL) {
          wallElements.push({
            key: `wall-${x}-${y}`,
            x,
            y,
            neighbors: getWallNeighbors(level, x, y),
          });
        }
      });
    });

    return wallElements;
  }, [level]);

  return (
    <>
      {walls.map(({ key, x, y, neighbors }) => (
        <WallCell key={key} x={x} y={y} neighbors={neighbors} />
      ))}
    </>
  );
});

WallsLayer.displayName = "WallsLayer";
