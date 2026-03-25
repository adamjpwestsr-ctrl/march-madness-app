"use client";

import React from "react";
import BadgeHoverCard from "./BadgeHoverCard";
import { getBadgeTier } from "./badges/BadgeTier";

type BadgeStripProps = {
  badges: any;
};

export default function BadgeStrip({ badges }: BadgeStripProps) {
  if (!badges) return null;

  const badgeMeta: Record<
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
      description: "Your champion pick is still alive in the tournament.",
    },
    champion_eliminated: {
      icon: "💀",
      title: "Champion Eliminated",
      description: "Your champion pick has been eliminated.",
    },
    rank_change: {
      icon: "📈",
      title: "Rank Change",
      description: "How your rank changed since the last snapshot.",
    },
    still_alive_to_win: {
      icon: "🔥",
      title: "Still Alive",
      description: "Your bracket can still mathematically win the pool.",
    },
  };

  const badgeList: Array<{ key: string; value: any }> = [];

  if (badges.underdog_count > 0)
    badgeList.push({
      key: "underdog_count",
      value: badges.underdog_count,
    });

  if (badges.correct_upset_count > 0)
    badgeList.push({
      key: "correct_upset_count",
      value: badges.correct_upset_count,
    });

  if (badges.perfect_rounds?.length > 0)
    badgeList.push({
      key: "perfect_rounds",
      value: badges.perfect_rounds,
    });

  if (badges.champion_alive)
    badgeList.push({ key: "champion_alive", value: true });

  if (badges.champion_eliminated)
    badgeList.push({ key: "champion_eliminated", value: true });

  if (badges.rank_change !== null && badges.rank_change !== undefined)
    badgeList.push({ key: "rank_change", value: badges.rank_change });

  if (badges.still_alive_to_win)
    badgeList.push({ key: "still_alive_to_win", value: true });

  return (
    <span style={{ marginLeft: 8, display: "inline-flex", gap: 6 }}>
      {badgeList.map((b, i) => {
        const meta = badgeMeta[b.key];
        const tier = getBadgeTier(b.key, b.value);

        return (
          <span
            key={i}
            className={`badge-reveal badge-tier-${tier.tier}`}
            style={{ display: "inline-flex" }}
          >
            <BadgeHoverCard
              icon={meta.icon}
              title={meta.title}
              description={meta.description}
              value={b.value}
            />
          </span>
        );
      })}
    </span>
  );
}
