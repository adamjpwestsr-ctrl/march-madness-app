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
      <div className="rounded-2xl p-6 bg-slate-900/60 border border-white/10 shadow-xl text-center text-white/60">
        No Final Four games available.
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl space-y-6">
      <h2 className="text-2xl font-bold text-center uppercase tracking-wide text-white">
        Final Four
      </h2>

      {/* Two matchups side-by-side */}
      <div className="grid grid-cols-2 gap-6">
        {games.map((g) => {
          const team1 = g.team1 ?? 'TBD';
          const team2 = g.team2 ?? 'TBD';

          const isTeam1Picked = g.winner === team1;
          const isTeam2Picked = g.winner === team2;

          return (
            <div
              key={g.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-lg space-y-3"
            >
              {/* Team 1 */}
              <button
                onClick={() => onPick?.(g.id, team1)}
                className={`w-full px-4 py-2 rounded-lg text-left transition
                  ${
                    isTeam1Picked
                      ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
                      : 'hover:bg-white/10'
                  }
                `}
              >
                <span className="text-white font-semibold">{team1}</span>
              </button>

              {/* VS */}
              <div className="text-center text-white/60 font-semibold">vs</div>

              {/* Team 2 */}
              <button
                onClick={() => onPick?.(g.id, team2)}
                className={`w-full px-4 py-2 rounded-lg text-left transition
                  ${
                    isTeam2Picked
                      ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
                      : 'hover:bg-white/10'
                  }
                `}
              >
                <span className="text-white font-semibold">{team2}</span>
              </button>

              {/* Winner */}
              {g.winner && (
                <div className="text-center text-green-400 font-bold text-sm mt-2">
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
