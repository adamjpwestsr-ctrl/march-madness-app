'use client';

import { useState } from 'react';
import { TournamentGame, TournamentTeam } from '@/lib/marchMadnessTypes';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function MyPicksSidebar({
  picks,
  games,
  teams,
  onJumpToGame,
}: {
  picks: Record<string, string>;
  games: TournamentGame[];
  teams: TournamentTeam[];
  onJumpToGame?: (gameId: string) => void;
}) {
  const [open, setOpen] = useState(true);

  // Group picks by round
  const picksByRound: Record<number, TournamentGame[]> = {};
  games.forEach((g) => {
    if (picks[g.id]) {
      const r = g.round ?? 0;
      if (!picksByRound[r]) picksByRound[r] = [];
      picksByRound[r].push(g);
    }
  });

  const roundNames: Record<number, string> = {
    1: 'Opening Round',
    2: 'Round of 64',
    3: 'Round of 32',
    4: 'Sweet 16',
    5: 'Elite 8',
    6: 'Final Four',
    7: 'Championship',
  };

  return (
    <div className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl p-4 space-y-4 h-full flex flex-col">

      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <h2 className="text-xl font-bold text-white tracking-wide">
          My Picks
        </h2>
        {open ? (
          <ChevronDownIcon className="w-5 h-5 text-white" />
        ) : (
          <ChevronRightIcon className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Scrollable content */}
      {open && (
        <div className="relative flex-1 overflow-y-auto space-y-6 pr-1">

          {Object.keys(picksByRound)
            .map(Number)
            .sort((a, b) => a - b)
            .map((round) => (
              <div key={round} className="space-y-3">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">
                  {roundNames[round] ?? `Round ${round}`}
                </h3>

                {/* ⭐ Limit to 10 picks per round */}
                {picksByRound[round].slice(0, 10).map((g) => {
                  const winner = picks[g.id];
                  const winnerTeam = teams.find((t) => t.team === winner);

                  const seed =
                    winnerTeam?.seed ?? (winner === g.team1 ? g.seed1 : g.seed2);

                  const isUpset =
                    g.seed1 &&
                    g.seed2 &&
                    ((winner === g.team1 && g.seed1 > g.seed2) ||
                      (winner === g.team2 && g.seed2 > g.seed1));

                  return (
                    <button
                      key={g.id}
                      onClick={() => onJumpToGame?.(g.id)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      {/* Logo */}
                      {winnerTeam?.logo_url && (
                        <img
                          src={winnerTeam.logo_url}
                          alt={winner}
                          className="w-7 h-7 rounded-sm object-contain"
                        />
                      )}

                      {/* Name + Seed */}
                      <div className="flex flex-col items-start">
                        <span className="text-white font-semibold">
                          {winner}
                        </span>

                        <div className="flex items-center gap-2">
                          {seed && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white/80">
                              #{seed}
                            </span>
                          )}

                          {isUpset && (
                            <span className="text-amber-300 text-xs font-bold uppercase tracking-wide">
                              Upset
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

          {/* Bottom fade indicator */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>
      )}
    </div>
  );
}
