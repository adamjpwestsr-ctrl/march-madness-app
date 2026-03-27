"use client";

import React from "react";
import BadgeHoverCard from "./BadgeHoverCard";
import { getBadgeTier } from "./BadgeTier";

type BadgeSummaryRowProps = {
  badges: any;
};

const SUMMARY_KEYS = [
  "underdog_count",
  "correct_upset_count",
  "perfect_rounds",
  "champion_alive",
  "still_alive_to_win",
];

const META: Record<
  string,
  { icon: string; title: string; description: string }
> = {
  underdog_count: {
    icon: "🐺",
    title: "Underdog Picks",
    description:
      "Number of picks where you chose a team seeded 5+ spots lower.",
  },
  correct_upset_count: {
    icon: "⚡",
    title: "Correct Upsets",
    description: "Upsets you predicted correctly.",
  },
  perfect_rounds: {
    icon: "🎯",
    title: "Perfect Rounds",
    description: "Rounds where you picked every game correctly.",
  },
  champion_alive: {
    icon: "🏆",
    title: "Champion Alive",
    description: "Your champion pick is still alive.",
  },
  still_alive_to_win: {
    icon: "🔥",
    title: "Still Alive",
    description: "Your bracket can still mathematically win the pool.",
  },
};

export default function BadgeSummaryRow({ badges }: BadgeSummaryRowProps) {
  if (!badges) return null;

  return (
    <span style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
      {SUMMARY_KEYS.map((key) => {
        const meta = META[key];
        if (!meta) return null;

        const value = badges[key];
        if (value === undefined || value === null) return null;

        const tier = getBadgeTier(key, value);

        return (
          <span
            key={key}
            className={`badge-summary badge-tier-${tier.tier}`}
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
          >
            <BadgeHoverCard
              icon={meta.icon}
              title={meta.title}
              description={meta.description}
              value={value}
            />
          </span>
        );
      })}
    </span>
  );
}
