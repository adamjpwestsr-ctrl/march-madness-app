"use client";

import { useState, useEffect } from "react";
import { getTeamLogo } from "@/lib/getTeamLogo";

export default function RegionGrid({
  regionName,
  games,
  picks,
  isLocked,
  isSubmitted,
  onPick,
  onUseMulligan,
}) {
  const [mounted, setMounted] = useState(false);
  const [lastAnimatedRound, setLastAnimatedRound] = useState<number | null>(null);
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Filter out Opening Round (round = 0)
  const regionGames = games
    .filter((g) => g.region === regionName && g.round > 0 && g.round <= 4)
    .sort((a, b) => a.round - b.round || a.game_id - b.game_id);

  const rounds = [1, 2, 3, 4];

  const gamesByRound: Record<number, any[]> = {};
  rounds.forEach((r) => {
    gamesByRound[r] = regionGames.filter((g) => g.round === r);
  });

  const getSelectedTeamId = (gameId: number) => {
    return picks[gameId] ?? null;
  };

  const handlePick = (game: any, teamId: string) => {
    if (isLocked || isSubmitted) return;
    setLastAnimatedRound(game.round);
    onPick(game.game_id, teamId);
  };

  // -----------------------------
  // TEAM BUTTON
  // -----------------------------
  const renderTeamButton = (game: any, teamName: string | null, seed: number | null, selectedTeamId: string | null) => {
    if (!teamName) {
      return (
        <div className="text-xs text-slate-500 italic px-3 py-2 border border-dashed border-slate-700 rounded-md h-9 flex items-center">
          TBD
        </div>
      );
    }

    const isSelected = selectedTeamId === teamName;
    const isHovered = hoveredTeamId === teamName;
    const logo = getTeamLogo(teamName);

    return (
      <button
        type="button"
        onClick={() => handlePick(game, teamName)}
        onMouseEnter={() => setHoveredTeamId(teamName)}
        onMouseLeave={() =>
          setHoveredTeamId((prev) => (prev === teamName ? null : prev))
        }
        disabled={isLocked || isSubmitted}
        className={`
          relative flex items-center gap-2 px-3 h-9 rounded-md text-xs
          border transition-all w-full
          ${
            isSelected || isHovered
              ? "bg-emerald-600/30 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              : "bg-white/5 border-white/10 text-slate-100 hover:bg-white/10 hover:scale-[1.02]"
          }
          ${(isLocked || isSubmitted) ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        {logo && (
          <img
            src={logo}
            alt={teamName}
            className="w-5 h-5 rounded-full object-cover shadow-sm"
          />
        )}

        {seed !== null && (
          <span
            className={`
              text-[10px] font-bold px-1.5 py-0.5 rounded 
              ${
                isSelected || isHovered
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-200"
              }
            `}
          >
            {seed}
          </span>
        )}

        <span className="flex-1 text-left text-[11px] tracking-wide truncate">
          {teamName}
        </span>
      </button>
    );
  };

  // -----------------------------
  // CONNECTOR
  // -----------------------------
  const Connector = ({ isActive }: { isActive: boolean }) => {
    return (
      <div className="flex items-center justify-center h-6">
        <div
          className={`
            flex items-center justify-center
            transition-all duration-200
            ${isActive ? "opacity-80" : "opacity-40"}
          `}
        >
          <div
            className={`
              h-[2px] w-6 rounded-full
              ${isActive ? "bg-emerald-400" : "bg-slate-600/60"}
            `}
          />
          <div
            className={`
              h-8 w-[2px] rounded-full ml-3
              ${isActive ? "bg-emerald-400" : "bg-slate-600/60"}
            `}
          />
        </div>
      </div>
    );
  };

  const shouldAnimateRound = (round: number) => {
    if (!mounted) return true;
    if (lastAnimatedRound == null) return false;
    return round === lastAnimatedRound || round === lastAnimatedRound + 1;
  };

  const roundWrapperClasses = (round: number) =>
    `
      flex flex-col gap-4
      transition-all duration-300
      ${
        mounted
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-3"
      }
      ${shouldAnimateRound(round) ? "animate-pulse" : ""}
    `;

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="overflow-y-auto overflow-x-hidden pb-6">
      <div
        className="
          grid gap-6
          grid-cols-[repeat(4,minmax(180px,1fr))]
        "
      >
        {rounds.map((round) => {
          const roundGames = gamesByRound[round] || [];
          if (!roundGames.length) return null;

          return (
            <div key={round} className={roundWrapperClasses(round)}>
              {/* STICKY ROUND HEADER */}
              <div
                className="
                  sticky top-0 z-20
                  h-12 flex items-center justify-center
                  text-[10px] font-semibold uppercase tracking-wide
                  px-3 rounded-md mb-1
                  backdrop-blur-md bg-slate-900/40
                  border border-white/10
                  shadow-md shadow-black/40
                  text-slate-200
                "
              >
                {round === 1 && "Round of 64"}
                {round === 2 && "Round of 32"}
                {round === 3 && "Sweet 16"}
                {round === 4 && "Elite 8"}
              </div>

              {/* GAMES */}
              {roundGames.map((game) => {
                const selectedTeamId = getSelectedTeamId(game.game_id);

                const isPathActive =
                  hoveredTeamId &&
                  (game.team1 === hoveredTeamId ||
                    game.team2 === hoveredTeamId);

                return (
                  <div
                    key={game.game_id}
                    className="
                      flex flex-col items-stretch
                      rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm
                      shadow-lg shadow-black/40
                      px-3 py-2
                    "
                  >
                    <div className="flex flex-col gap-1">
                      {renderTeamButton(game, game.team1, game.seed1, selectedTeamId)}
                      {renderTeamButton(game, game.team2, game.seed2, selectedTeamId)}
                    </div>

                    {round < 4 && (
                      <div className="mt-1">
                        <Connector isActive={!!isPathActive} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
