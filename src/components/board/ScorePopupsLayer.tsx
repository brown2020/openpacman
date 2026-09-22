"use client";

import React, { memo } from "react";
import type { ScorePopup } from "../../types/types";
import { CELL_SIZE } from "../../constants/gameConstants";

const EMPTY_POPUPS: ScorePopup[] = [];

interface ScorePopupsLayerProps {
  scorePopups?: ScorePopup[];
}

export const ScorePopupsLayer = memo(function ScorePopupsLayer({
  scorePopups = EMPTY_POPUPS,
}: ScorePopupsLayerProps) {
  if (scorePopups.length === 0) return null;

  return (
    <>
      {scorePopups.map((popup) => (
        <div
          key={popup.id}
          className="absolute text-white font-bold text-sm score-popup"
          style={{
            left: popup.position.x * CELL_SIZE,
            top: popup.position.y * CELL_SIZE - 10,
            zIndex: 100,
            textShadow: "0 0 4px #00FFFF",
            animation: "score-float 1s ease-out forwards",
          }}
        >
          {popup.points}
        </div>
      ))}
    </>
  );
});

ScorePopupsLayer.displayName = "ScorePopupsLayer";
