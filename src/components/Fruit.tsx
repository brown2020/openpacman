"use client";

import React, { memo } from "react";
import type { Fruit as FruitType } from "../types/types";
import { CELL_SIZE } from "../constants/gameConstants";

interface FruitProps {
  fruit: FruitType;
}

// Fruit colors and shapes
const FRUIT_CONFIG: Record<
  string,
  { color: string; secondaryColor?: string; emoji: string }
> = {
  cherry: { color: "#FF0000", secondaryColor: "#00FF00", emoji: "🍒" },
  strawberry: { color: "#FF0000", secondaryColor: "#00FF00", emoji: "🍓" },
  orange: { color: "#FFA500", emoji: "🍊" },
  apple: { color: "#FF0000", secondaryColor: "#00FF00", emoji: "🍎" },
  melon: { color: "#90EE90", secondaryColor: "#228B22", emoji: "🍈" },
  galaxian: { color: "#FFD700", secondaryColor: "#0000FF", emoji: "🚀" },
  bell: { color: "#FFD700", emoji: "🔔" },
  key: { color: "#00BFFF", emoji: "🔑" },
};

export const Fruit: React.FC<FruitProps> = memo(({ fruit }) => {
  if (!fruit.visible) return null;

  const config = FRUIT_CONFIG[fruit.type] || FRUIT_CONFIG.cherry;
  const size = CELL_SIZE * 0.8;
  const x = fruit.position.x * CELL_SIZE + CELL_SIZE / 2;
  const y = fruit.position.y * CELL_SIZE + CELL_SIZE / 2;

  // Render fruit as SVG shape
  const renderFruitShape = () => {
    switch (fruit.type) {
      case "cherry":
        return (
          <g>
            {/* Stem */}
            <path
              d={`M ${x - 2} ${y - size / 3} Q ${x} ${y - size / 2} ${x + 3} ${y - size / 2.5}`}
              stroke="#00AA00"
              strokeWidth="2"
              fill="none"
            />
            {/* Left cherry */}
            <circle cx={x - 3} cy={y + 1} r={size / 3} fill={config.color} />
            {/* Right cherry */}
            <circle cx={x + 3} cy={y + 2} r={size / 3} fill={config.color} />
            {/* Highlights */}
            <circle cx={x - 4} cy={y - 1} r={size / 8} fill="white" opacity="0.5" />
            <circle cx={x + 2} cy={y} r={size / 8} fill="white" opacity="0.5" />
          </g>
        );

      case "strawberry":
        return (
          <g>
            {/* Stem */}
            <ellipse cx={x} cy={y - size / 3} rx={size / 4} ry={size / 6} fill="#00AA00" />
            {/* Body */}
            <ellipse cx={x} cy={y + 2} rx={size / 3} ry={size / 2.5} fill={config.color} />
            {/* Seeds */}
            <circle cx={x - 2} cy={y} r={1} fill="#FFFF00" />
            <circle cx={x + 2} cy={y + 2} r={1} fill="#FFFF00" />
            <circle cx={x} cy={y + 4} r={1} fill="#FFFF00" />
          </g>
        );

      case "orange":
        return (
          <g>
            <circle cx={x} cy={y} r={size / 2.5} fill={config.color} />
            {/* Leaf */}
            <ellipse cx={x + 2} cy={y - size / 3} rx={size / 6} ry={size / 8} fill="#00AA00" />
            {/* Highlight */}
            <circle cx={x - 2} cy={y - 2} r={size / 6} fill="white" opacity="0.3" />
          </g>
        );

      case "apple":
        return (
          <g>
            {/* Body */}
            <circle cx={x} cy={y + 1} r={size / 2.5} fill={config.color} />
            {/* Stem */}
            <rect x={x - 1} y={y - size / 2.5} width={2} height={size / 5} fill="#8B4513" />
            {/* Leaf */}
            <ellipse cx={x + 3} cy={y - size / 3} rx={size / 5} ry={size / 8} fill="#00AA00" />
            {/* Highlight */}
            <circle cx={x - 2} cy={y - 1} r={size / 6} fill="white" opacity="0.4" />
          </g>
        );

      case "melon":
        return (
          <g>
            <ellipse cx={x} cy={y} rx={size / 2} ry={size / 2.8} fill={config.color} />
            {/* Stripes */}
            <path d={`M ${x - 3} ${y - 4} Q ${x - 2} ${y} ${x - 3} ${y + 4}`} stroke={config.secondaryColor} strokeWidth="1.5" fill="none" />
            <path d={`M ${x + 3} ${y - 4} Q ${x + 2} ${y} ${x + 3} ${y + 4}`} stroke={config.secondaryColor} strokeWidth="1.5" fill="none" />
          </g>
        );

      case "galaxian":
        return (
          <g>
            {/* Spaceship body */}
            <polygon
              points={`${x},${y - size / 2.5} ${x - size / 3},${y + size / 3} ${x + size / 3},${y + size / 3}`}
              fill={config.secondaryColor}
            />
            {/* Wings */}
            <polygon
              points={`${x - size / 3},${y} ${x - size / 2},${y + size / 3} ${x - size / 4},${y + size / 3}`}
              fill={config.color}
            />
            <polygon
              points={`${x + size / 3},${y} ${x + size / 2},${y + size / 3} ${x + size / 4},${y + size / 3}`}
              fill={config.color}
            />
          </g>
        );

      case "bell":
        return (
          <g>
            {/* Bell body */}
            <path
              d={`M ${x - size / 3} ${y + size / 4} Q ${x - size / 3} ${y - size / 3} ${x} ${y - size / 2.5} Q ${x + size / 3} ${y - size / 3} ${x + size / 3} ${y + size / 4} Z`}
              fill={config.color}
            />
            {/* Clapper */}
            <circle cx={x} cy={y + size / 4} r={size / 8} fill="#8B4513" />
            {/* Highlight */}
            <ellipse cx={x - 2} cy={y - 2} rx={size / 8} ry={size / 6} fill="white" opacity="0.4" />
          </g>
        );

      case "key":
        return (
          <g>
            {/* Key head */}
            <circle cx={x - size / 4} cy={y - size / 6} r={size / 4} fill={config.color} stroke="#0088CC" strokeWidth="2" />
            <circle cx={x - size / 4} cy={y - size / 6} r={size / 8} fill="#000033" />
            {/* Key shaft */}
            <rect x={x - size / 8} y={y - size / 6} width={size / 2} height={size / 6} fill={config.color} />
            {/* Key teeth */}
            <rect x={x + size / 6} y={y} width={size / 8} height={size / 6} fill={config.color} />
            <rect x={x + size / 4} y={y} width={size / 8} height={size / 8} fill={config.color} />
          </g>
        );

      default:
        return <circle cx={x} cy={y} r={size / 2.5} fill={config.color} />;
    }
  };

  return (
    <g className="fruit-bounce">
      {renderFruitShape()}
    </g>
  );
});

Fruit.displayName = "Fruit";
