import React, { memo, useMemo } from "react";
import { Position } from "../../types/types";
import { CELL_SIZE } from "../../constants/gameConstants";

interface DotsLayerProps {
  dots: Position[];
  powerPellets?: Position[];
}

const Dot: React.FC<{ position: Position }> = memo(({ position }) => (
  <div
    className="absolute rounded-full dot-glow"
    style={{
      width: 6,
      height: 6,
      left: position.x * CELL_SIZE + CELL_SIZE / 2 - 3,
      top: position.y * CELL_SIZE + CELL_SIZE / 2 - 3,
      background: 'radial-gradient(circle at 30% 30%, #FFFFFF 0%, #FFB897 50%, #FF8844 100%)',
    }}
  />
));

Dot.displayName = "Dot";

const PowerPellet: React.FC<{ position: Position }> = memo(({ position }) => (
  <div
    className="absolute rounded-full power-pellet-pulse"
    style={{
      width: 14,
      height: 14,
      left: position.x * CELL_SIZE + CELL_SIZE / 2 - 7,
      top: position.y * CELL_SIZE + CELL_SIZE / 2 - 7,
      background: 'radial-gradient(circle at 30% 30%, #FFFFFF 0%, #FFB74D 40%, #FF6B00 100%)',
    }}
  />
));

PowerPellet.displayName = "PowerPellet";

export const DotsLayer: React.FC<DotsLayerProps> = memo(({ dots, powerPellets = [] }) => {
  // Memoize dot elements
  const dotElements = useMemo(() => 
    dots.map((dot) => (
      <Dot key={`dot-${dot.x}-${dot.y}`} position={dot} />
    )),
    [dots]
  );

  // Memoize power pellet elements
  const pelletElements = useMemo(() =>
    powerPellets.map((pellet) => (
      <PowerPellet key={`pellet-${pellet.x}-${pellet.y}`} position={pellet} />
    )),
    [powerPellets]
  );

  return (
    <>
      {dotElements}
      {pelletElements}
    </>
  );
});

DotsLayer.displayName = "DotsLayer";
