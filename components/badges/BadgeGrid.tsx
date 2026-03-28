import React from "react";
import BadgeHoverCard from "../BadgeHoverCard";
import { getBadgeTier } from "./BadgeTier";

type BadgeGridProps = {
  badges: {
    id: number;
    name: string;          // e.g. "underdog_count"
    description: string;
    progress: number | any;
    goal: number;
  }[];
};

export default function BadgeGrid({ badges }: BadgeGridProps) {
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
        const key = badge.name;
        const value = badge.progress;

        const tier = getBadgeTier(key, value);

        return (
          <div
            key={badge.id}
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
              position: "relative",
            }}
          >
            <BadgeHoverCard
              icon="🏅"
              title={badge.name}
              description={badge.description}
              value={badge.progress}
            />

            {badge.name}
          </div>
        );
      })}
    </div>
  );
}
