// components/Ghost.tsx
import React from "react";
import { Position } from "../types/types";
import { CELL_SIZE } from "../constants/gameConstants";

interface GhostProps {
  position: Position;
  color: string;
}

export const Ghost: React.FC<GhostProps> = ({ position, color }) => {
  // Define ghost body dimensions
  const ghostWidth = CELL_SIZE;
  const ghostHeight = CELL_SIZE;
  const tentacleHeight = ghostHeight * 0.25;

  // Create wavy bottom edge path for ghost
  const createWavyBottom = () => {
    const segments = 4; // Number of waves at bottom
    const segmentWidth = ghostWidth / segments;

    let path = `M 0 ${ghostHeight - tentacleHeight}`; // Start at bottom-left of main body

    // Create wavy bottom edge
    for (let i = 0; i < segments; i++) {
      const x1 = (i + 0.5) * segmentWidth;
      const x2 = (i + 1) * segmentWidth;
      path += ` Q ${x1} ${ghostHeight} ${x2} ${ghostHeight - tentacleHeight}`;
    }

    // Complete the path back to top
    path += ` L ${ghostWidth} ${tentacleHeight}`; // Right side
    path += ` Q ${ghostWidth} 0 ${ghostWidth * 0.8} 0`; // Top-right curve
    path += ` L ${ghostWidth * 0.2} 0`; // Top
    path += ` Q 0 0 0 ${tentacleHeight}`; // Top-left curve
    path += " Z"; // Close path

    return path;
  };

  // Define ghost eyes
  const renderEyes = () => {
    const eyeWidth = ghostWidth * 0.2;
    const eyeHeight = eyeWidth * 1.2;
    const eyeY = ghostHeight * 0.3;
    const pupilSize = eyeWidth * 0.6;

    return (
      <>
        {/* Left eye - positioned at 30% of ghost width */}
        <ellipse
          cx={ghostWidth * 0.3}
          cy={eyeY}
          rx={eyeWidth / 2}
          ry={eyeHeight / 2}
          fill="white"
        />
        <circle cx={ghostWidth * 0.3} cy={eyeY} r={pupilSize / 2} fill="#333" />

        {/* Right eye - positioned at 70% of ghost width */}
        <ellipse
          cx={ghostWidth * 0.7}
          cy={eyeY}
          rx={eyeWidth / 2}
          ry={eyeHeight / 2}
          fill="white"
        />
        <circle cx={ghostWidth * 0.7} cy={eyeY} r={pupilSize / 2} fill="#333" />
      </>
    );
  };

  return (
    <div
      className="absolute transition-all duration-200 ease-in-out"
      style={{
        width: ghostWidth,
        height: ghostHeight,
        left: position.x * CELL_SIZE,
        top: position.y * CELL_SIZE,
      }}
    >
      {/* SVG container for ghost */}
      <svg
        width={ghostWidth}
        height={ghostHeight}
        viewBox={`0 0 ${ghostWidth} ${ghostHeight}`}
        className="overflow-visible"
      >
        {/* Ghost body with subtle gradient */}
        <defs>
          <linearGradient
            id={`ghostGradient-${color}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={`${color}dd`} />
          </linearGradient>
        </defs>

        {/* Main ghost body path */}
        <path
          d={createWavyBottom()}
          fill={`url(#ghostGradient-${color})`}
          className="drop-shadow-md"
        />

        {/* Eyes */}
        {renderEyes()}

        {/* Ghost hover animation */}
        <animate
          attributeName="transform"
          type="translate"
          values={`0 0; 0 ${-2}; 0 0`}
          dur="2s"
          repeatCount="indefinite"
        />
      </svg>
    </div>
  );
};

export default Ghost;
