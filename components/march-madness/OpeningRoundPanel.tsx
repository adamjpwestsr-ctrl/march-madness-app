'use client';

import { TournamentGame, LiveGameSummary } from '@/lib/marchMadnessTypes';

export function OpeningRoundPanel({
  games,
  live,
  onPick,
  picks = {},
}: {
  games: TournamentGame[];
  live: LiveGameSummary[];
  onPick?: (gameId: string, winner: string) => void;
  picks?: Record<string, string>;
}) {
  const handlePick = (game: TournamentGame, winner: string) => {
    if (!winner || winner === 'TBD') return;
    onPick?.(game.id, winner);
  };

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl shadow-xl border border-white/10 space-y-4">
      <h2 className="text-xl font-extrabold text-center uppercase tracking-wide text-white/90">
        Opening Round
      </h2>

      {/* ⭐ 3 columns × 4 rows */}
      <div className="grid grid-cols-3 grid-rows-4 gap-4">
        {games.map((g) => {
          const team1Name = g.team1 ?? 'TBD';
          const team2Name = g.team2 ?? 'TBD';
          const seed1 = g.seed1 ?? null;
          const seed2 = g.seed2 ?? null;

          const liveMatch = live.find(
            (l) =>
              (l.home_team === team1Name && l.away_team === team2Name) ||
              (l.home_team === team2Name && l.away_team === team1Name)
          );

          const isTeam1Picked =
            picks[g.id] === team1Name || g.winner === team1Name;
          const isTeam2Picked =
            picks[g.id] === team2Name || g.winner === team2Name;

          const isUpset =
            g.winner &&
            seed1 &&
            seed2 &&
            ((g.winner === team1Name && seed1 > seed2) ||
              (g.winner === team2Name && seed2 > seed1));

          return (
            <div
              key={g.id}
              className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-md"
            >
              {/* Team 1 */}
              <button
                onClick={() => handlePick(g, team1Name)}
                className={`flex justify-between items-center mb-2 w-full text-left px-2 py-1 rounded-lg transition
                  ${
                    isTeam1Picked
                      ? 'bg-green-600/40 border border-green-400'
                      : 'hover:bg-white/10'
                  }
                `}
              >
                <span className="text-xs opacity-70">
                  {seed1 ? `#${seed1}` : ''}
                </span>
                <span className="text-sm font-semibold flex items-center gap-1">
                  {team1Name}
                  {isTeam1Picked && (
                    <span className="text-green-300 font-bold">✓</span>
                  )}
                </span>
              </button>

              {/* Team 2 */}
              <button
                onClick={() => handlePick(g, team2Name)}
                className={`flex justify-between items-center w-full text-left px-2 py-1 rounded-lg transition
                  ${
                    isTeam2Picked
                      ? 'bg-green-600/40 border border-green-400'
                      : 'hover:bg-white/10'
                  }
                `}
              >
                <span className="text-xs opacity-70">
                  {seed2 ? `#${seed2}` : ''}
                </span>
                <span className="text-sm font-semibold flex items-center gap-1">
                  {team2Name}
                  {isTeam2Picked && (
                    <span className="text-green-300 font-bold">✓</span>
                  )}
                </span>
              </button>

              {/* Score / Status */}
              {liveMatch ? (
                <div className="mt-2 text-sm font-bold text-center">
                  {liveMatch.home_score} – {liveMatch.away_score}
                  <div className="text-xs opacity-70">{liveMatch.status}</div>
                </div>
              ) : g.winner ? (
                <div className="mt-2 text-center space-y-1">
                  <div className="text-green-400 font-bold text-xs">
                    Winner: {g.winner}
                  </div>

                  {isUpset && (
                    <div className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                      Upset!
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 opacity-70 text-xs text-center">
                  Pick a winner…
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
