// components/Ghost.tsx
import React, { memo, useMemo } from "react";
import { Position, GhostMode } from "../types/types";
import { CELL_SIZE, GHOST_FRIGHTENED_COLOR, GHOST_FRIGHTENED_FLASH_COLOR } from "../constants/gameConstants";

interface GhostProps {
  position: Position;
  color: string;
  mode?: GhostMode;
  frightenedTimeLeft?: number;
  direction?: string;
  pacmanPos?: Position;
}

export const Ghost: React.FC<GhostProps> = memo(({
  position,
  color,
  mode = GhostMode.CHASE,
  frightenedTimeLeft = 0,
  pacmanPos,
}) => {
  const ghostWidth = CELL_SIZE;
  const ghostHeight = CELL_SIZE;

  // Determine if ghost should be flashing (near end of frightened mode)
  const isFlashing = mode === GhostMode.FRIGHTENED && frightenedTimeLeft < 2000;
  const isFrightened = mode === GhostMode.FRIGHTENED;
  const isEaten = mode === GhostMode.EATEN;

  // Get current color based on mode
  const currentColor = useMemo(() => {
    if (isEaten) return "rgba(255, 255, 255, 0.3)";
    if (isFrightened) return GHOST_FRIGHTENED_COLOR;
    return color;
  }, [color, isFrightened, isEaten]);

  // Calculate eye direction based on Pacman position
  const eyeOffset = useMemo(() => {
    if (!pacmanPos) return { x: 0, y: 0 };
    
    const dx = pacmanPos.x - position.x;
    const dy = pacmanPos.y - position.y;
    const maxOffset = 1.5;
    
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    return {
      x: (dx / length) * maxOffset,
      y: (dy / length) * maxOffset,
    };
  }, [pacmanPos, position]);

  // Create wavy bottom path for ghost body
  const createGhostPath = () => {
    const segments = 4;
    const segmentWidth = ghostWidth / segments;
    const bodyHeight = ghostHeight * 0.75;
    const tentacleHeight = ghostHeight * 0.25;
    const cornerRadius = ghostWidth * 0.4;

    let path = `M 0 ${bodyHeight}`;

    // Wavy bottom
    for (let i = 0; i < segments; i++) {
      const x1 = (i + 0.5) * segmentWidth;
      const x2 = (i + 1) * segmentWidth;
      const waveY = ghostHeight - (i % 2 === 0 ? 0 : tentacleHeight * 0.6);
      path += ` Q ${x1} ${ghostHeight} ${x2} ${waveY}`;
    }

    // Right side and top curve
    path += ` L ${ghostWidth} ${cornerRadius}`;
    path += ` Q ${ghostWidth} 0 ${ghostWidth - cornerRadius} 0`;
    path += ` L ${cornerRadius} 0`;
    path += ` Q 0 0 0 ${cornerRadius}`;
    path += " Z";

    return path;
  };

  return (
    <div
      className={`absolute entity-smooth z-10 ghost-float`}
      style={{
        width: ghostWidth,
        height: ghostHeight,
        left: position.x * CELL_SIZE,
        top: position.y * CELL_SIZE,
        opacity: isEaten ? 0.4 : 1,
      }}
    >
      <svg
        width={ghostWidth}
        height={ghostHeight}
        viewBox={`0 0 ${ghostWidth} ${ghostHeight}`}
        className="overflow-visible"
      >
        <defs>
          {/* Body gradient */}
          <linearGradient
            id={`ghostGradient-${color.replace('#', '')}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={currentColor} stopOpacity="1" />
            <stop offset="100%" stopColor={currentColor} stopOpacity="0.8" />
          </linearGradient>

          {/* Frightened gradient */}
          <linearGradient id="frightenedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3333FF" />
            <stop offset="100%" stopColor="#1111AA" />
          </linearGradient>

          {/* Glow filter */}
          <filter id={`ghostGlow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feFlood floodColor={currentColor} floodOpacity="0.5" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ghost body glow */}
        <path
          d={createGhostPath()}
          fill={currentColor}
          opacity="0.3"
          style={{ filter: 'blur(4px)' }}
        />

        {/* Main ghost body */}
        <path
          d={createGhostPath()}
          fill={`url(#ghostGradient-${color.replace('#', '')})`}
          className={isFlashing ? 'ghost-frightened-flash' : ''}
        />

        {/* Eyes - only show if not eaten */}
        {!isEaten && (
          <>
            {/* Left eye white */}
            <ellipse
              cx={ghostWidth * 0.32}
              cy={ghostHeight * 0.35}
              rx={ghostWidth * 0.13}
              ry={ghostHeight * 0.16}
              fill="white"
            />
            {/* Left eye pupil */}
            <circle
              cx={ghostWidth * 0.32 + eyeOffset.x}
              cy={ghostHeight * 0.38 + eyeOffset.y}
              r={ghostWidth * 0.07}
              fill={isFrightened ? "#FF0000" : "#111"}
              className="ghost-eyes"
            />

            {/* Right eye white */}
            <ellipse
              cx={ghostWidth * 0.68}
              cy={ghostHeight * 0.35}
              rx={ghostWidth * 0.13}
              ry={ghostHeight * 0.16}
              fill="white"
            />
            {/* Right eye pupil */}
            <circle
              cx={ghostWidth * 0.68 + eyeOffset.x}
              cy={ghostHeight * 0.38 + eyeOffset.y}
              r={ghostWidth * 0.07}
              fill={isFrightened ? "#FF0000" : "#111"}
              className="ghost-eyes"
            />
          </>
        )}

        {/* Frightened mouth (wavy line) */}
        {isFrightened && !isEaten && (
          <path
            d={`M ${ghostWidth * 0.25} ${ghostHeight * 0.58} 
                Q ${ghostWidth * 0.35} ${ghostHeight * 0.52} ${ghostWidth * 0.45} ${ghostHeight * 0.58}
                Q ${ghostWidth * 0.55} ${ghostHeight * 0.64} ${ghostWidth * 0.65} ${ghostHeight * 0.58}
                Q ${ghostWidth * 0.75} ${ghostHeight * 0.52} ${ghostWidth * 0.75} ${ghostHeight * 0.58}`}
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        )}

        {/* Eaten ghost - just eyes returning home */}
        {isEaten && (
          <>
            {/* Left eye */}
            <ellipse
              cx={ghostWidth * 0.32}
              cy={ghostHeight * 0.4}
              rx={ghostWidth * 0.15}
              ry={ghostHeight * 0.18}
              fill="white"
            />
            <circle
              cx={ghostWidth * 0.32 + eyeOffset.x}
              cy={ghostHeight * 0.42 + eyeOffset.y}
              r={ghostWidth * 0.08}
              fill="#111"
            />

            {/* Right eye */}
            <ellipse
              cx={ghostWidth * 0.68}
              cy={ghostHeight * 0.4}
              rx={ghostWidth * 0.15}
              ry={ghostHeight * 0.18}
              fill="white"
            />
            <circle
              cx={ghostWidth * 0.68 + eyeOffset.x}
              cy={ghostHeight * 0.42 + eyeOffset.y}
              r={ghostWidth * 0.08}
              fill="#111"
            />
          </>
        )}
      </svg>
    </div>
  );
});

Ghost.displayName = "Ghost";

export default Ghost;
