'use client';

import { TournamentGame } from '@/lib/marchMadnessTypes';

export function FinalFourPanel({
  games,
  onPick,
}: {
  games: TournamentGame[];
  onPick?: (gameId: string, winner: string) => void;
}) {
  if (!games || games.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900/70 to-slate-800/50 border border-white/10 shadow-xl text-center text-white/60">
        No Final Four games available.
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6">
      <h2 className="text-2xl font-extrabold text-center uppercase tracking-wider text-emerald-300 drop-shadow-sm">
        Final Four
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {games.map((g) => {
          const team1 = g.team1 ?? 'TBD';
          const team2 = g.team2 ?? 'TBD';

          const isTeam1Picked = g.winner === team1;
          const isTeam2Picked = g.winner === team2;

          return (
            <div
              key={g.id}
              className="
                p-4 rounded-xl
                bg-gradient-to-br from-slate-900/80 to-slate-800/60
                border border-slate-700/40 shadow-lg
                hover:shadow-emerald-900/40 hover:border-emerald-500/40
                transition-all duration-200 hover:scale-[1.03]
                space-y-3
              "
            >
              {/* Team 1 */}
              <button
                onClick={() => onPick?.(g.id, team1)}
                className={`
                  w-full px-4 py-2 rounded-lg text-left transition
                  ${
                    isTeam1Picked
                      ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
                      : 'hover:bg-white/10'
                  }
                `}
              >
                <span className="text-sm font-semibold text-white tracking-wide">
                  {team1}
                </span>
              </button>

              <div className="text-center text-slate-400 font-semibold">vs</div>

              {/* Team 2 */}
              <button
                onClick={() => onPick?.(g.id, team2)}
                className={`
                  w-full px-4 py-2 rounded-lg text-left transition
                  ${
                    isTeam2Picked
                      ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
                      : 'hover:bg-white/10'
                  }
                `}
              >
                <span className="text-sm font-semibold text-white tracking-wide">
                  {team2}
                </span>
              </button>

              {/* Winner */}
              {g.winner && (
                <div className="text-center text-emerald-300 font-bold text-sm mt-2 tracking-wide">
                  Winner: {g.winner}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
