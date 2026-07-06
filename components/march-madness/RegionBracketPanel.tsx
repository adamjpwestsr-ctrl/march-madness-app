'use client';

import { TournamentGame, TournamentTeam } from '@/lib/marchMadnessTypes';

/* -------------------------------------------------------
   Shared GameCard Component
------------------------------------------------------- */
function GameCard({
  game,
  picks,
  onPick,
  teams,
}: {
  game: TournamentGame;
  picks: Record<string, string>;
  onPick?: (gameId: string, winner: string) => void;
  teams: TournamentTeam[];
}) {
  const team1 = game.team1 ?? 'TBD';
  const team2 = game.team2 ?? 'TBD';

  const seed1 = game.seed1 ?? null;
  const seed2 = game.seed2 ?? null;

  const team1Obj = teams.find((t) => t.team === team1);
  const team2Obj = teams.find((t) => t.team === team2);

  const isTeam1Picked = picks[game.id] === team1 || game.winner === team1;
  const isTeam2Picked = picks[game.id] === team2 || game.winner === team2;

  const handlePick = (winner: string) => {
    if (!winner || winner === 'TBD') return;
    onPick?.(game.id, winner);
  };

  return (
    <div
      id={`game-${game.id}`}
      className="snap-center min-w-[260px] relative p-4 rounded-xl bg-white/5 border border-white/10 shadow-lg transition-all duration-200 hover:bg-white/10"
    >
      {/* Team 1 */}
      <button
        onClick={() => handlePick(team1)}
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
        <span className="font-semibold text-white">{team1}</span>
        {seed1 && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white/80">
            #{seed1}
          </span>
        )}
        {isTeam1Picked && (
          <span className="text-green-300 font-bold text-lg">✓</span>
        )}
      </button>

      {/* Team 2 */}
      <button
        onClick={() => handlePick(team2)}
        className={`flex items-center justify-between gap-3 w-full text-left px-3 py-2 rounded-lg mt-2 transition
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
        <span className="font-semibold text-white">{team2}</span>
        {seed2 && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white/80">
            #{seed2}
          </span>
        )}
        {isTeam2Picked && (
          <span className="text-green-300 font-bold text-lg">✓</span>
        )}
      </button>

      {/* Winner */}
      {(game.winner || picks[game.id]) && (
        <div className="mt-3 text-center text-green-400 font-bold text-sm">
          Winner: {picks[game.id] ?? game.winner}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   RegionBracketPanel — now clean + round‑focused
------------------------------------------------------- */
export function RegionBracketPanel({
  region,
  games,
  picks,
  onPick,
  teams,
}: {
  region: string;
  games: TournamentGame[]; // games for a single round only
  picks: Record<string, string>;
  onPick?: (gameId: string, winner: string) => void;
  teams: TournamentTeam[];
}) {
  if (!games.length) {
    return (
      <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl shadow-2xl border border-white/10">
        <h2 className="text-xl font-semibold text-center text-white/70">
          No games available for this round.
        </h2>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl shadow-2xl border border-white/10">

      {/* Horizontal ESPN-style bracket */}
      <div className="flex flex-row gap-6 overflow-x-auto snap-x snap-mandatory pb-2">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            picks={picks}
            onPick={onPick}
            teams={teams}
          />
        ))}
      </div>
    </div>
  );
}
