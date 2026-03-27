import React from "react";
import BadgeHoverCard from "../BadgeHoverCard";
import { getBadgeTier } from "./BadgeTier";

type BadgeStripProps = {
  badges: {
    id: number;
    name: string;
    description: string;
    progress: number;
    goal: number;
  }[];
};

export default function BadgeStrip({ badges }: BadgeStripProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        overflowX: "auto",
        paddingBottom: "8px",
      }}
    >
      {badges.map((badge) => {
        const tier = getBadgeTier(badge.progress, badge.goal);

        return (
          <BadgeHoverCard key={badge.id} badge={badge} tier={tier}>
            <div
              style={{
                minWidth: 80,
                height: 80,
                borderRadius: 12,
                background: tier.color,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
              }}
            >
              {badge.name}
            </div>
          </BadgeHoverCard>
        );
      })}
    </div>
  );
}
