'use client';

import { useRef } from 'react';
import { TournamentGame, TournamentTeam } from '@/lib/marchMadnessTypes';

export function RegionBracketPanel({
  region,
  games,
  picks,
  onPick,
  teams,
}: {
  region: string;
  games: TournamentGame[];
  picks: Record<string, string>;
  onPick?: (gameId: string, winner: string) => void;
  teams: TournamentTeam[];
}) {
  // Scroll anchors for each round
  const roundRefs: Record<number, React.RefObject<HTMLDivElement | null>> = {};
  const rounds = groupRoundsBySeed(games);

  Object.keys(rounds).forEach((round) => {
    roundRefs[Number(round)] = useRef<HTMLDivElement>(null);
  });

  const handlePick = (game: TournamentGame, winner: string) => {
    if (!winner || winner === 'TBD') return;
    onPick?.(game.id, winner);
  };

  const scrollToRound = (round: number) => {
    const ref = roundRefs[round];
    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl shadow-2xl border border-white/10">
      <h2 className="text-4xl font-extrabold text-center uppercase tracking-wide text-white mb-6">
        {region}
      </h2>

      {/* Horizontal ESPN-style bracket */}
      <div className="flex flex-row gap-10 overflow-x-auto snap-x snap-mandatory pb-4">

        {Object.keys(rounds)
          .map(Number)
          .sort((a, b) => a - b)
          .map((round, idx, arr) => {
            const nextRound = arr[idx + 1];
            const roundGames = rounds[round];

	const isRoundComplete = roundGames.every((pair) =>
  	pair.every((g) => picks[g.id])
		);


            return (
              <div
                key={round}
                ref={roundRefs[round]}
                className="flex-shrink-0 snap-center min-w-[280px] space-y-4 relative"
              >
                <h3 className="text-lg font-bold text-center text-white/80 tracking-wide">
                  {roundLabel(round)}
                </h3>

                {roundGames.map((pair, pairIndex) => (
                  <div key={pairIndex} className="space-y-4">
                    {pair.map((g) => {
                      const team1 = g.team1 ?? 'TBD';
                      const team2 = g.team2 ?? 'TBD';

                      const seed1 = g.seed1 ?? null;
                      const seed2 = g.seed2 ?? null;

                      const team1Obj = teams.find((t) => t.team === team1);
                      const team2Obj = teams.find((t) => t.team === team2);

                      const isTeam1Picked =
                        picks[g.id] === team1 || g.winner === team1;
                      const isTeam2Picked =
                        picks[g.id] === team2 || g.winner === team2;

                      return (
                        <div
                          key={g.id}
                          id={`game-${g.id}`}
                          className="relative p-4 rounded-xl bg-white/5 border border-white/10 shadow-lg transition-all duration-200 hover:bg-white/10"
                        >
                          {/* ESPN horizontal connectors */}
                          {nextRound && (
                            <div className="absolute right-[-24px] top-1/2 w-6 border-t border-white/20"></div>
                          )}

                          {/* Team 1 */}
                          <button
                            onClick={() => handlePick(g, team1)}
                            className={`flex items-center justify-between gap-3 w-full text-left px-3 py-2 rounded-lg transition
                              ${
                                isTeam1Picked
                                  ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
                                  : 'hover:bg-white/20'
                              }
                            `}
                          >
                            {team1Obj?.logo_url && (
                              <img
                                src={team1Obj.logo_url}
                                alt={team1}
                                className="w-6 h-6 rounded-sm object-contain"
                              />
                            )}
                            <span className="font-semibold text-white">
                              {team1}
                            </span>
                            {seed1 && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white/80">
                                #{seed1}
                              </span>
                            )}
                            {isTeam1Picked && (
                              <span className="text-green-300 font-bold text-lg">
                                ✓
                              </span>
                            )}
                          </button>

                          {/* Team 2 */}
                          <button
                            onClick={() => handlePick(g, team2)}
                            className={`flex items-center justify-between gap-3 w-full text-left px-3 py-2 rounded-lg transition
                              ${
                                isTeam2Picked
                                  ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
                                  : 'hover:bg-white/20'
                              }
                            `}
                          >
                            {team2Obj?.logo_url && (
                              <img
                                src={team2Obj.logo_url}
                                alt={team2}
                                className="w-6 h-6 rounded-sm object-contain"
                              />
                            )}
                            <span className="font-semibold text-white">
                              {team2}
                            </span>
                            {seed2 && (
                              <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white/80">
                                #{seed2}
                              </span>
                            )}
                            {isTeam2Picked && (
                              <span className="text-green-300 font-bold text-lg">
                                ✓
                              </span>
                            )}
                          </button>

                          {/* Winner */}
                          {g.winner && (
                            <div className="mt-3 text-center text-green-400 font-bold text-sm">
                              Winner: {g.winner}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* ⭐ Next Round Button (Option B) */}
                {isRoundComplete && nextRound && (
                  <div className="pt-2 text-center space-y-2">
                    <div className="text-white/70 text-sm">
                      {roundLabel(round)} Complete
                    </div>
                    <button
                      onClick={() => scrollToRound(nextRound)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition shadow-md text-white text-sm font-semibold"
                    >
                      Continue to {roundLabel(nextRound)}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* -----------------------------
   Seed-based pairing algorithm
----------------------------- */
function groupRoundsBySeed(games: TournamentGame[]): Record<number, TournamentGame[][]> {
  const rounds: Record<number, TournamentGame[]> = {};

  games.forEach((g) => {
    const r = g.round ?? 0;
    if (!rounds[r]) rounds[r] = [];
    rounds[r].push(g);
  });

  const paired: Record<number, TournamentGame[][]> = {};

  Object.keys(rounds)
    .map(Number)
    .forEach((round) => {
      const roundGames = rounds[round];

      // Sort by seed (fallback to game_number)
      const sorted = [...roundGames].sort((a, b) => {
        const aSeed = Math.min(a.seed1 ?? 99, a.seed2 ?? 99);
        const bSeed = Math.min(b.seed1 ?? 99, b.seed2 ?? 99);
        return aSeed - bSeed;
      });

      // Pair games: [game1, game2], [game3, game4], ...
      const pairs: TournamentGame[][] = [];
      for (let i = 0; i < sorted.length; i += 2) {
        pairs.push([sorted[i], sorted[i + 1]]);
      }

      paired[round] = pairs;
    });

  return paired;
}

/* -----------------------------
   Round Labels
----------------------------- */
function roundLabel(round: number) {
  switch (round) {
    case 2:
      return 'Round of 64';
    case 3:
      return 'Round of 32';
    case 4:
      return 'Sweet 16';
    case 5:
      return 'Elite 8';
    default:
      return `Round ${round}`;
  }
}
