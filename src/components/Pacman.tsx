// components/Pacman.tsx
import React from "react";
import { Position, Direction } from "../types/types";
import { CELL_SIZE } from "../constants/gameConstants";

interface PacmanProps {
  position: Position;
  direction: Direction;
  mouthOpen: boolean;
}

export const Pacman: React.FC<PacmanProps> = ({
  position,
  direction,
  mouthOpen,
}) => {
  const getPacmanRotation = () => {
    switch (direction) {
      case "right":
        return 0;
      case "down":
        return 90;
      case "left":
        return 180;
      case "up":
        return 270;
      default:
        return 0;
    }
  };

  // SVG path for Pacman shape
  const getPacmanPath = () => {
    const radius = CELL_SIZE / 2;
    const centerX = radius;
    const centerY = radius;
    const mouthAngle = mouthOpen ? 45 : 10; // Degrees
    const startAngle = mouthAngle / 2;
    const endAngle = 360 - mouthAngle / 2;

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate path points
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY - radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY - radius * Math.sin(endRad);

    // Create SVG path
    return `
      M ${centerX},${centerY}
      L ${x1},${y1}
      A ${radius},${radius} 0 1,0 ${x2},${y2}
      Z
    `;
  };

  return (
    <div
      className="absolute transition-transform duration-100 ease-in-out"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        left: position.x * CELL_SIZE,
        top: position.y * CELL_SIZE,
        transform: `rotate(${getPacmanRotation()}deg)`,
      }}
    >
      <svg
        width={CELL_SIZE}
        height={CELL_SIZE}
        viewBox={`0 0 ${CELL_SIZE} ${CELL_SIZE}`}
        className="overflow-visible"
      >
        {/* Gradient definition for 3D effect */}
        <defs>
          <linearGradient id="pacmanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA500" />
          </linearGradient>

          {/* Drop shadow filter */}
          <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
            <feOffset dx="0.5" dy="0.5" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main Pacman body */}
        <path
          d={getPacmanPath()}
          fill="url(#pacmanGradient)"
          filter="url(#dropShadow)"
          className="transition-all duration-100 ease-in-out"
        >
          {/* Chomp animation */}
          <animate
            attributeName="d"
            values={`
              ${getPacmanPath()};
              ${getPacmanPath()};
            `}
            dur="0.2s"
            repeatCount="indefinite"
          />
        </path>

        {/* Eye */}
        <circle
          cx={CELL_SIZE * 0.6}
          cy={CELL_SIZE * 0.3}
          r={CELL_SIZE * 0.08}
          fill="#111"
        />
      </svg>
    </div>
  );
};
