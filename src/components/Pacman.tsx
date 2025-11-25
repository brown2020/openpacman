// components/Pacman.tsx
import React, { memo, useMemo } from "react";
import { Position, Direction } from "../types/types";
import { CELL_SIZE } from "../constants/gameConstants";

interface PacmanProps {
  position: Position;
  prevPosition?: Position;
  direction: Direction;
  mouthOpen: boolean;
  isPowerMode?: boolean;
}

export const Pacman: React.FC<PacmanProps> = memo(({
  position,
  direction,
  mouthOpen,
  isPowerMode = false,
}) => {
  const rotation = useMemo(() => {
    switch (direction) {
      case "right": return 0;
      case "down": return 90;
      case "left": return 180;
      case "up": return 270;
      default: return 0;
    }
  }, [direction]);

  const mouthAngle = mouthOpen ? 40 : 5;
  const startAngle = mouthAngle;
  const endAngle = 360 - mouthAngle;

  // Create arc path for Pacman body
  const createArcPath = () => {
    const radius = CELL_SIZE / 2 - 2;
    const centerX = CELL_SIZE / 2;
    const centerY = CELL_SIZE / 2;
    
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY - radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY - radius * Math.sin(endRad);

    return `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 1,0 ${x2},${y2} Z`;
  };

  return (
    <div
      className="absolute entity-smooth z-20"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        left: position.x * CELL_SIZE,
        top: position.y * CELL_SIZE,
      }}
    >
      <svg
        width={CELL_SIZE}
        height={CELL_SIZE}
        viewBox={`0 0 ${CELL_SIZE} ${CELL_SIZE}`}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
      >
        <defs>
          {/* Gradient for 3D effect */}
          <radialGradient id="pacmanGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFE86C" />
            <stop offset="50%" stopColor="#FFE135" />
            <stop offset="100%" stopColor="#E5A800" />
          </radialGradient>
          
          {/* Power mode gradient */}
          <radialGradient id="pacmanPowerGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#FFE135" />
            <stop offset="100%" stopColor="#FF6B00" />
          </radialGradient>
          
          {/* Glow filter */}
          <filter id="pacmanGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feFlood floodColor="#FFE135" floodOpacity="0.6" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow layer */}
        <circle
          cx={CELL_SIZE / 2}
          cy={CELL_SIZE / 2}
          r={CELL_SIZE / 2 - 1}
          fill="none"
          stroke={isPowerMode ? "#FF6B00" : "#FFE135"}
          strokeWidth="2"
          opacity="0.4"
          style={{
            filter: 'blur(3px)',
          }}
        />

        {/* Main Pacman body */}
        <path
          d={createArcPath()}
          fill={isPowerMode ? "url(#pacmanPowerGradient)" : "url(#pacmanGradient)"}
          filter="url(#pacmanGlow)"
        />

        {/* Eye */}
        <circle
          cx={CELL_SIZE * 0.55}
          cy={CELL_SIZE * 0.32}
          r={CELL_SIZE * 0.08}
          fill="#111"
        />
        
        {/* Eye highlight */}
        <circle
          cx={CELL_SIZE * 0.53}
          cy={CELL_SIZE * 0.30}
          r={CELL_SIZE * 0.03}
          fill="#FFF"
        />
      </svg>
    </div>
  );
});

Pacman.displayName = "Pacman";
