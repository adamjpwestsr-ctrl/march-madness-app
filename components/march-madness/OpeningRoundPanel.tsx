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
    <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-xl shadow-2xl border border-white/10 space-y-6">

      {/* Title */}
      <h2 className="text-[1.25rem] font-extrabold text-center uppercase tracking-wider text-emerald-300 drop-shadow-sm">
        Opening Round
      </h2>

      {/* 3×4 Grid */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-6 auto-rows-fr">
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
              className="
                h-[110px] p-3 rounded-lg 
                bg-gradient-to-br from-slate-900/80 to-slate-800/60 
                border border-slate-700/40 
                shadow-md hover:shadow-emerald-900/40 
                hover:border-emerald-500/40 
                transition-all duration-200 
                hover:scale-[1.015]
                flex flex-col justify-between
              "
            >
              {/* Team 1 */}
              <button
                onClick={() => handlePick(g, team1Name)}
                className={`
                  flex justify-between items-center w-full text-left px-2.5 py-1.5 rounded-lg transition
                  ${
                    isTeam1Picked
                      ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
                      : 'hover:bg-white/10'
                  }
                `}
              >
                <span className="text-[0.7rem] text-slate-400 font-medium">
                  {seed1 ? `#${seed1}` : ''}
                </span>
                <span className="text-[0.85rem] font-semibold text-white tracking-wide flex items-center gap-1 truncate">
                  {team1Name}
                  {isTeam1Picked && (
                    <span className="text-emerald-300 font-bold">✓</span>
                  )}
                </span>
              </button>

              {/* Team 2 */}
              <button
                onClick={() => handlePick(g, team2Name)}
                className={`
                  flex justify-between items-center w-full text-left px-2.5 py-1.5 rounded-lg transition
                  ${
                    isTeam2Picked
                      ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
                      : 'hover:bg-white/10'
                  }
                `}
              >
                <span className="text-[0.7rem] text-slate-400 font-medium">
                  {seed2 ? `#${seed2}` : ''}
                </span>
                <span className="text-[0.85rem] font-semibold text-white tracking-wide flex items-center gap-1 truncate">
                  {team2Name}
                  {isTeam2Picked && (
                    <span className="text-emerald-300 font-bold">✓</span>
                  )}
                </span>
              </button>

              {/* Score / Status */}
              {liveMatch ? (
                <div className="text-center text-[0.75rem] font-bold text-white mt-1">
                  {liveMatch.home_score} – {liveMatch.away_score}
                  <div className="text-[0.7rem] text-slate-400">{liveMatch.status}</div>
                </div>
              ) : g.winner ? (
                <div className="text-center space-y-0.5 mt-1">
                  <div className="text-emerald-300 font-bold text-[0.7rem] tracking-wide">
                    Winner: {g.winner}
                  </div>
                  {isUpset && (
                    <div className="text-[0.65rem] font-bold text-amber-300 uppercase tracking-wide">
                      Upset!
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[0.65rem] text-center text-slate-500 italic mt-1">
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
