'use client';

import { TournamentGame, TournamentTeam } from '@/lib/marchMadnessTypes';

/* -------------------------------------------------------
   Shared GameCard Component — compact version
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
      className="
        relative p-3 rounded-lg
        bg-gradient-to-br from-slate-900/80 to-slate-800/60
        border border-slate-700/40 shadow-md
        hover:shadow-emerald-900/40 hover:border-emerald-500/40
        transition-all duration-200 hover:scale-[1.015]
        space-y-2
      "
    >
      {/* Team 1 */}
      <button
        onClick={() => handlePick(team1)}
        className={`
          flex items-center justify-between gap-2 w-full text-left px-2.5 py-1.5 rounded-lg transition
          ${
            isTeam1Picked
              ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
              : 'hover:bg-white/10'
          }
        `}
      >
        {team1Obj?.logo_url && (
          <img
            src={team1Obj.logo_url}
            alt={team1}
            className="w-5 h-5 rounded-sm object-contain"
          />
        )}

        <span className="text-[0.85rem] font-semibold text-white tracking-wide truncate">
          {team1}
        </span>

        {seed1 && (
          <span className="text-[0.7rem] px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-slate-300">
            #{seed1}
          </span>
        )}

        {isTeam1Picked && (
          <span className="text-emerald-300 font-bold text-base">✓</span>
        )}
      </button>

      {/* Team 2 */}
      <button
        onClick={() => handlePick(team2)}
        className={`
          flex items-center justify-between gap-2 w-full text-left px-2.5 py-1.5 rounded-lg transition
          ${
            isTeam2Picked
              ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
              : 'hover:bg-white/10'
          }
        `}
      >
        {team2Obj?.logo_url && (
          <img
            src={team2Obj.logo_url}
            alt={team2}
            className="w-5 h-5 rounded-sm object-contain"
          />
        )}

        <span className="text-[0.85rem] font-semibold text-white tracking-wide truncate">
          {team2}
        </span>

        {seed2 && (
          <span className="text-[0.7rem] px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-slate-300">
            #{seed2}
          </span>
        )}

        {isTeam2Picked && (
          <span className="text-emerald-300 font-bold text-base">✓</span>
        )}
      </button>

      {/* Winner */}
      {(game.winner || picks[game.id]) && (
        <div className="mt-1 text-center text-emerald-300 font-bold text-[0.75rem] tracking-wide">
          Winner: {picks[game.id] ?? game.winner}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   RegionBracketPanel — compact vertical container
------------------------------------------------------- */
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
  if (!games.length) {
    return (
      <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900/70 to-slate-800/40 backdrop-blur-xl shadow-2xl border border-white/10">
        <h2 className="text-[0.95rem] font-semibold text-center text-white/70">
          No games available for this round.
        </h2>
      </div>
    );
  }

  return (
    <div
      className="
        rounded-2xl p-4
        bg-gradient-to-br from-slate-900/70 to-slate-800/40
        backdrop-blur-xl shadow-2xl border border-white/10
        space-y-3
      "
    >
      <h3 className="text-center text-[1rem] font-bold uppercase tracking-wide text-emerald-300">
        {region}
      </h3>

      {/* Vertical grid instead of horizontal scroll */}
      <div className="grid grid-cols-2 gap-4">
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
