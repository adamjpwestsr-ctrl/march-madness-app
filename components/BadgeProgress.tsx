"use client";

import React from "react";
import { getBadgeGoal, getBadgeTier } from "./BadgeTier";

type BadgeProgressProps = {
  badgeKey: string;
  value: any;
};

export default function BadgeProgress({ badgeKey, value }: BadgeProgressProps) {
  const goal = getBadgeGoal(badgeKey);
  const tier = getBadgeTier(badgeKey, value);

  if (!goal) return null;

  let numeric = 0;
  if (badgeKey === "perfect_rounds" && Array.isArray(value)) {
    numeric = value.length;
  } else if (typeof value === "number") {
    numeric = value;
  }

  const clamped = Math.max(0, Math.min(numeric, goal));
  const pct = (clamped / goal) * 100;

  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "rgba(148,163,184,0.35)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: tier.color,
            transition: "width 0.25s ease-out",
          }}
        />
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          display: "flex",
          justifyContent: "space-between",
          color: "#9ca3af",
        }}
      >
        <span>
          {clamped} / {goal}
        </span>
        <span>{tier.label}</span>
      </div>
    </div>
  );
}
