// components/Ghost.tsx
import React, { memo, useMemo } from "react";
import type { Position, Direction } from "../types/types";
import { GhostMode } from "../types/types";
import {
  CELL_SIZE,
  GHOST_FRIGHTENED_COLOR,
  GHOST_FRIGHTENED_FLASH_THRESHOLD,
} from "../constants/gameConstants";

interface GhostProps {
  position: Position;
  color: string;
  mode?: GhostMode;
  frightenedTimeLeft?: number;
  direction?: Direction;
  pacmanPos?: Position;
}

export const Ghost: React.FC<GhostProps> = memo(
  ({
    position,
    color,
    mode = GhostMode.CHASE,
    frightenedTimeLeft = 0,
    pacmanPos,
  }) => {
    const isFlashing =
      mode === GhostMode.FRIGHTENED &&
      frightenedTimeLeft < GHOST_FRIGHTENED_FLASH_THRESHOLD;
    const isFrightened = mode === GhostMode.FRIGHTENED;
    const isEaten = mode === GhostMode.EATEN;

    const currentColor = useMemo(() => {
      if (isEaten) return "rgba(255, 255, 255, 0.3)";
      if (isFrightened) return GHOST_FRIGHTENED_COLOR;
      return color;
    }, [color, isFrightened, isEaten]);

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
    }, [pacmanPos, position.x, position.y]);

    const ghostPath = useMemo(() => {
      const segments = 4;
      const segmentWidth = CELL_SIZE / segments;
      const bodyHeight = CELL_SIZE * 0.75;
      const tentacleHeight = CELL_SIZE * 0.25;
      const cornerRadius = CELL_SIZE * 0.4;

      let path = `M 0 ${bodyHeight}`;

      for (let i = 0; i < segments; i++) {
        const x1 = (i + 0.5) * segmentWidth;
        const x2 = (i + 1) * segmentWidth;
        const waveY = CELL_SIZE - (i % 2 === 0 ? 0 : tentacleHeight * 0.6);
        path += ` Q ${x1} ${CELL_SIZE} ${x2} ${waveY}`;
      }

      path += ` L ${CELL_SIZE} ${cornerRadius}`;
      path += ` Q ${CELL_SIZE} 0 ${CELL_SIZE - cornerRadius} 0`;
      path += ` L ${cornerRadius} 0`;
      path += ` Q 0 0 0 ${cornerRadius}`;
      path += " Z";

      return path;
    }, []);

    // Generate stable gradient ID based on ghost name/color
    const gradientId = `ghostGradient-${color.replace("#", "")}`;

    return (
      <div
        className="absolute entity-smooth z-10 ghost-float"
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          left: position.x * CELL_SIZE,
          top: position.y * CELL_SIZE,
          opacity: isEaten ? 0.4 : 1,
        }}
      >
        <svg
          width={CELL_SIZE}
          height={CELL_SIZE}
          viewBox={`0 0 ${CELL_SIZE} ${CELL_SIZE}`}
          className="overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={currentColor} stopOpacity="1" />
              <stop offset="100%" stopColor={currentColor} stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Ghost body glow */}
          <path
            d={ghostPath}
            fill={currentColor}
            opacity="0.3"
            style={{ filter: "blur(4px)" }}
          />

          {/* Main ghost body */}
          <path
            d={ghostPath}
            fill={`url(#${gradientId})`}
            className={isFlashing ? "ghost-frightened-flash" : ""}
          />

          {/* Eyes */}
          {!isEaten && (
            <>
              <ellipse
                cx={CELL_SIZE * 0.32}
                cy={CELL_SIZE * 0.35}
                rx={CELL_SIZE * 0.13}
                ry={CELL_SIZE * 0.16}
                fill="white"
              />
              <circle
                cx={CELL_SIZE * 0.32 + eyeOffset.x}
                cy={CELL_SIZE * 0.38 + eyeOffset.y}
                r={CELL_SIZE * 0.07}
                fill={isFrightened ? "#FF0000" : "#111"}
              />
              <ellipse
                cx={CELL_SIZE * 0.68}
                cy={CELL_SIZE * 0.35}
                rx={CELL_SIZE * 0.13}
                ry={CELL_SIZE * 0.16}
                fill="white"
              />
              <circle
                cx={CELL_SIZE * 0.68 + eyeOffset.x}
                cy={CELL_SIZE * 0.38 + eyeOffset.y}
                r={CELL_SIZE * 0.07}
                fill={isFrightened ? "#FF0000" : "#111"}
              />
            </>
          )}

          {/* Frightened mouth */}
          {isFrightened && !isEaten && (
            <path
              d={`M ${CELL_SIZE * 0.25} ${CELL_SIZE * 0.58} 
                  Q ${CELL_SIZE * 0.35} ${CELL_SIZE * 0.52} ${
                CELL_SIZE * 0.45
              } ${CELL_SIZE * 0.58}
                  Q ${CELL_SIZE * 0.55} ${CELL_SIZE * 0.64} ${
                CELL_SIZE * 0.65
              } ${CELL_SIZE * 0.58}
                  Q ${CELL_SIZE * 0.75} ${CELL_SIZE * 0.52} ${
                CELL_SIZE * 0.75
              } ${CELL_SIZE * 0.58}`}
              stroke="white"
              strokeWidth="2"
              fill="none"
            />
          )}

          {/* Eaten ghost - just eyes */}
          {isEaten && (
            <>
              <ellipse
                cx={CELL_SIZE * 0.32}
                cy={CELL_SIZE * 0.4}
                rx={CELL_SIZE * 0.15}
                ry={CELL_SIZE * 0.18}
                fill="white"
              />
              <circle
                cx={CELL_SIZE * 0.32 + eyeOffset.x}
                cy={CELL_SIZE * 0.42 + eyeOffset.y}
                r={CELL_SIZE * 0.08}
                fill="#111"
              />
              <ellipse
                cx={CELL_SIZE * 0.68}
                cy={CELL_SIZE * 0.4}
                rx={CELL_SIZE * 0.15}
                ry={CELL_SIZE * 0.18}
                fill="white"
              />
              <circle
                cx={CELL_SIZE * 0.68 + eyeOffset.x}
                cy={CELL_SIZE * 0.42 + eyeOffset.y}
                r={CELL_SIZE * 0.08}
                fill="#111"
              />
            </>
          )}
        </svg>
      </div>
    );
  }
);

Ghost.displayName = "Ghost";

export default Ghost;
