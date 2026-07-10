'use client';

import { useState } from 'react';
import { TournamentGame } from '@/lib/marchMadnessTypes';

export function ChampionshipPanel({
  game,
  onPick,
}: {
  game: TournamentGame;
  onPick?: (gameId: string, winner: string) => void;
}) {
  const [tiebreaker, setTiebreaker] = useState('');

  if (!game) {
    return (
      <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900/70 to-slate-800/50 border border-white/10 shadow-xl text-center text-white/60">
        Championship game unavailable.
      </div>
    );
  }

  const team1 = game.team1 ?? 'TBD';
  const team2 = game.team2 ?? 'TBD';

  const isTeam1Picked = game.winner === team1;
  const isTeam2Picked = game.winner === team2;

  return (
    <div className="rounded-2xl p-6 bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-xl border border-white/10 shadow-2xl space-y-8">
      <h2 className="text-2xl font-extrabold text-center uppercase tracking-wider text-emerald-300 drop-shadow-sm">
        Championship
      </h2>

      <div className="flex flex-col items-center gap-4">

        {/* Team 1 */}
        <button
          onClick={() => onPick?.(game.id, team1)}
          className={`
            px-6 py-3 rounded-lg w-full max-w-xs text-center transition
            ${
              isTeam1Picked
                ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }
          `}
        >
          <span className="text-white font-semibold tracking-wide">{team1}</span>
        </button>

        <span className="text-slate-400 font-semibold">vs</span>

        {/* Team 2 */}
        <button
          onClick={() => onPick?.(game.id, team2)}
          className={`
            px-6 py-3 rounded-lg w-full max-w-xs text-center transition
            ${
              isTeam2Picked
                ? 'bg-emerald-600/40 border border-emerald-400 shadow-md'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }
          `}
        >
          <span className="text-white font-semibold tracking-wide">{team2}</span>
        </button>

        {/* Winner */}
        {game.winner && (
          <div className="text-emerald-300 font-bold text-sm mt-2 tracking-wide">
            Champion: {game.winner}
          </div>
        )}
      </div>

      {/* Tiebreaker */}
      <div className="text-center space-y-3">
        <label className="block text-sm text-slate-300 tracking-wide">
          Tiebreaker Score (Total Points)
        </label>

        <input
          type="number"
          value={tiebreaker}
          onChange={(e) => setTiebreaker(e.target.value)}
          className="
            w-32 text-center bg-slate-800 border border-white/20 rounded-lg py-1 
            text-white focus:outline-none focus:ring-2 focus:ring-emerald-400
          "
          placeholder="e.g. 142"
        />

        <p className="text-xs text-slate-500">
          Used only if multiple players pick the same champion.
        </p>
      </div>
    </div>
  );
}
