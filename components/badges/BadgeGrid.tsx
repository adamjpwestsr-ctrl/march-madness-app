"use client";

import React from "react";
import BadgeHoverCard from "../BadgeHoverCard";
import BadgeProgress from "./BadgeProgress";
import { getBadgeTier } from "./BadgeTier";

type BadgeGridProps = {
  badges: any;
};

export default function BadgeGrid({ badges }: BadgeGridProps) {
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

  const allBadgeKeys = Object.keys(badgeMeta);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "16px",
        marginTop: "20px",
      }}
    >
      {allBadgeKeys.map((key) => {
        const meta = badgeMeta[key];
        const value = badges[key];
        const hasValue =
          key === "perfect_rounds"
            ? Array.isArray(value) && value.length > 0
            : value !== undefined && value !== null && value !== false;

        const tier = getBadgeTier(key, value);

        return (
          <div
            key={key}
            className={`badge-card badge-tier-${tier.tier}`}
            style={{
              padding: "14px",
              borderRadius: "10px",
              background: hasValue
                ? "rgba(15,23,42,0.9)"
                : "rgba(15,23,42,0.6)",
              border: "1px solid rgba(148,163,184,0.4)",
              opacity: hasValue ? 1 : 0.45,
              transition: "0.2s ease",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                marginBottom: "6px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <BadgeHoverCard
                icon={meta.icon}
                title={meta.title}
                description={meta.description}
                value={value}
              />
              {tier.tier !== "none" && (
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 999,
                    border: `1px solid ${tier.color}`,
                    color: tier.color,
                  }}
                >
                  {tier.label}
                </span>
              )}
            </div>

            <div style={{ fontSize: "15px", marginBottom: "4px" }}>
              {meta.title}
            </div>

            <div style={{ fontSize: "13px", opacity: 0.8 }}>
              {meta.description}
            </div>

            <BadgeProgress badgeKey={key} value={value} />
          </div>
        );
      })}
    </div>
  );
}
