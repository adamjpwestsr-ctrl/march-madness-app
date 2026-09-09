"use client";

import React from "react";
import { cn } from "@/lib/utils";
import RankChangeAnimation from "../fx/RankChangeAnimation";

const BADGE_ICONS = {
  champion: "🏆",
  survivor: "🛡️",
  upset: "⚡",
  perfect: "✨",
  chaos: "🔥",
  momentum: "📈",
};

export default function LeaderboardRow({
  entry,
  spotlight,
}: {
  entry: {
    userId: string;
    name: string;
    avatarUrl?: string;
    score: number;
    rank: number;
    rankChange: number;
    momentum: number;
    badges?: {
      champion?: boolean;
      survivor?: boolean;
      upsetCount?: number;
      perfectRounds?: number;
      chaos?: boolean;
    };
  };
  spotlight: boolean;
}) {
  const isLeader = entry.rank === 1;

  const momentumColor =
    entry.momentum > 15
      ? "bg-green-500/40"
      : entry.momentum > 5
      ? "bg-yellow-400/30"
      : entry.momentum < -5
      ? "bg-red-500/40"
      : "bg-slate-700/40";

  const trendingArrow =
    entry.momentum > 15
      ? { icon: "⬆️", color: "text-green-400" }
      : entry.momentum > 5
      ? { icon: "↗️", color: "text-yellow-300" }
      : entry.momentum < -15
      ? { icon: "⬇️", color: "text-red-500" }
      : entry.momentum < -5
      ? { icon: "↘️", color: "text-orange-400" }
      : { icon: "→", color: "text-slate-500" };

  return (
    <RankChangeAnimation rankChange={entry.rankChange}>
      <div
        className={cn(
          "relative flex items-center justify-between p-4 rounded-lg border border-white/10 shadow-md transition-all overflow-hidden",
          spotlight && !isLeader && "opacity-50",
          spotlight &&
            isLeader &&
            "animate-leaderPulse bg-gradient-to-r from-yellow-500/20 via-yellow-400/10 to-yellow-500/20 bg-[length:200%_100%] animate-[spotlightSweep_2s_linear_infinite]",
          isLeader && "border-yellow-500/40"
        )}
      >
        {/* HEATMAP BAR */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-2 rounded-r-lg transition-all duration-700",
            momentumColor
          )}
        />

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4 pl-3">
          <div className="text-2xl font-extrabold text-yellow-400 w-10 text-center">
            {entry.rank}
          </div>

          {isLeader && (
            <span className="text-yellow-400 text-xl drop-shadow-lg">👑</span>
          )}

          <img
            src={entry.avatarUrl || "/default-avatar.png"}
            alt={entry.name}
            className="w-10 h-10 rounded-full border border-white/10 shadow"
          />

          <div className="flex flex-col">
            <span className="text-lg font-semibold text-white">
              {entry.name}
            </span>

            {/* BADGE STRIP */}
            <div className="flex gap-1 mt-1 text-sm">
              {entry.badges?.champion && (
                <span className="text-yellow-400">{BADGE_ICONS.champion}</span>
              )}
              {entry.badges?.survivor && (
                <span className="text-green-400">{BADGE_ICONS.survivor}</span>
              )}
              {entry.badges?.upsetCount && entry.badges.upsetCount > 0 && (
                <span className="text-red-400">
                  {BADGE_ICONS.upset} {entry.badges.upsetCount}
                </span>
              )}
              {entry.badges?.perfectRounds && entry.badges.perfectRounds > 0 && (
                <span className="text-blue-300">
                  {BADGE_ICONS.perfect} {entry.badges.perfectRounds}
                </span>
              )}
              {entry.badges?.chaos && (
                <span className="text-orange-400">{BADGE_ICONS.chaos}</span>
              )}
              {/* Momentum badge always shown */}
              <span className="text-slate-300">{BADGE_ICONS.momentum}</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 pr-2">
          {entry.rankChange > 0 && (
            <span className="text-green-400 font-bold">▲ {entry.rankChange}</span>
          )}
          {entry.rankChange < 0 && (
            <span className="text-red-400 font-bold">▼ {Math.abs(entry.rankChange)}</span>
          )}
          {entry.rankChange === 0 && (
            <span className="text-slate-500 font-bold">•</span>
          )}

          <span
            className={cn(
              trendingArrow.color,
              "text-xl font-bold transition-opacity duration-700"
            )}
          >
            {trendingArrow.icon}
          </span>

          <div className="text-xl font-bold text-yellow-400">
            {entry.score}
          </div>
        </div>
      </div>
    </RankChangeAnimation>
  );
}
