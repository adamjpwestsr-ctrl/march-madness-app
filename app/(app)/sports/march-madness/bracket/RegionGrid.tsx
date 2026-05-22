"use client";

import { useState, useEffect } from "react";
import { getTeamLogo } from "@/lib/getTeamLogo";
import { Game } from "@/lib/bracketTypes";

type RegionGridProps = {
  regionName: string;
  games: Game[];
  picks: Record<number, string | null>;
  isLocked: boolean;
  isSubmitted: boolean;
  mulligans: { remaining: number };
  onPick: (gameId: number, teamId: string) => void;
  onUseMulligan: (game: Game) => void;
};

export default function RegionGrid({
  regionName,
  games,
  picks,
  isLocked,
  isSubmitted,
  mulligans,
  onPick,
  onUseMulligan,
}: RegionGridProps) {
  const [mounted, setMounted] = useState(false);
  const [lastAnimatedRound, setLastAnimatedRound] = useState<number | null>(null);
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  // ✅ Group games by round (Rounds 1–4 only)
  const validRounds = [1, 2, 3, 4];
  const gamesByRound: Record<number, Game[]> = {};
  validRounds.forEach((r) => {
    gamesByRound[r] = games.filter((g) => g.round === r && g.region === regionName);
  });

  const getSelectedTeamId = (gameId: number): string | null => picks[gameId] ?? null;

  const handlePick = (game: Game, teamId: string) => {
    if (isLocked || isSubmitted) return;
    if (game.round !== null) setLastAnimatedRound(game.round);
    onPick(game.game_id, teamId);
  };

  // 🏀 Team Button Renderer
  const renderTeamButton = (
    game: Game,
    team: { team_id: string; name: string; seed: number | null } | null,
    selectedTeamId: string | null
  ) => {
    if (!team) {
      return (
        <div className="text-xs text-slate-500 italic px-3 py-2 border border-dashed border-slate-700 rounded-md h-9 flex items-center">
          TBD
        </div>
      );
    }

    const isSelected = selectedTeamId === team.team_id;
    const isHovered = hoveredTeamId === team.team_id;
    const logo = getTeamLogo(team.name);

    return (
      <button
        type="button"
        onClick={() => handlePick(game, team.team_id)}
        onMouseEnter={() => setHoveredTeamId(team.team_id)}
        onMouseLeave={() =>
          setHoveredTeamId((prev) => (prev === team.team_id ? null : prev))
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
            alt={team.name}
            className="w-5 h-5 rounded-full object-cover shadow-sm"
          />
        )}

        {team.seed !== null && (
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
            {team.seed}
          </span>
        )}

        <span className="flex-1 text-left text-[11px] tracking-wide truncate">
          {team.name}
        </span>
      </button>
    );
  };

  // 🔗 Connector between rounds
  const Connector = ({ isActive }: { isActive: boolean }) => (
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

  const shouldAnimateRound = (round: number): boolean => {
    if (!mounted) return true;
    if (lastAnimatedRound == null) return false;
    return round === lastAnimatedRound || round === lastAnimatedRound + 1;
  };

  const roundWrapperClasses = (round: number): string =>
    `
      flex flex-col gap-4
      transition-all duration-300
      ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
      ${shouldAnimateRound(round) ? "animate-pulse" : ""}
    `;

  // 🧩 Render grouped rounds
  return (
    <div className="overflow-y-auto overflow-x-hidden pb-6">
      <div className="grid gap-6 grid-cols-[repeat(4,minmax(180px,1fr))]">
        {validRounds.map((round) => {
          const roundGames = gamesByRound[round];
          if (!roundGames.length) return null;

          return (
            <div key={round} className={roundWrapperClasses(round)}>
              {/* Round Header */}
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

              {/* Games */}
              {roundGames.map((game) => {
                const selectedTeamId = getSelectedTeamId(game.game_id);
                const isPathActive =
                  hoveredTeamId &&
                  (game.team1?.team_id === hoveredTeamId ||
                    game.team2?.team_id === hoveredTeamId);

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
                      {renderTeamButton(game, game.team1, selectedTeamId)}
                      {renderTeamButton(game, game.team2, selectedTeamId)}
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
