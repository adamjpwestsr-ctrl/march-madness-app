'use client';

import { useState, useMemo } from 'react';
import { TournamentGame, TournamentTeam } from '@/lib/marchMadnessTypes';

export function InteractiveBracketEditor({
  bracketId,
  games,
  teams,
  initialPicks,
  initialTiebreaker,
  isLocked,
  onSubmit,
}: {
  bracketId: string;
  games: TournamentGame[];
  teams: TournamentTeam[];
  initialPicks: Record<number, string>;
  initialTiebreaker: number | null;
  isLocked: boolean;
  onSubmit: (picks: Record<number, string>, tiebreaker: number) => void;
}) {
  const [picks, setPicks] = useState<Record<number, string>>(initialPicks);
  const [tiebreaker, setTiebreaker] = useState(initialTiebreaker ?? 0);

  // -----------------------------
  // GROUP GAMES BY ROUND + REGION
  // -----------------------------
  const grouped = useMemo(() => {
    const structure: Record<number, Record<string, TournamentGame[]>> = {};

    games.forEach((g) => {
      const round = g.round ?? 0;
      const region = g.region ?? 'Unknown';

      if (!structure[round]) structure[round] = {};
      if (!structure[round][region]) structure[round][region] = [];

      structure[round][region].push(g);
    });

    return structure;
  }, [games]);

  const roundOrder = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b);

  // -----------------------------
  // HANDLE PICK
  // -----------------------------
  function handlePick(gameId: number, team: string) {
    if (isLocked) return;

    setPicks((prev) => ({
      ...prev,
      [gameId]: team,
    }));

    // Placeholder for future winner advancement logic
    // advanceWinner(gameId, team);
  }

  // -----------------------------
  // SUBMIT
  // -----------------------------
  function handleSubmit() {
    if (isLocked) return;
    onSubmit(picks, tiebreaker);
  }

  return (
    <div className="space-y-10">

      {/* -----------------------------
          TIEBREAKER
      ------------------------------ */}
      <div className="p-4 bg-white/10 rounded-xl backdrop-blur-xl shadow">
        <label className="block text-lg font-semibold mb-2">
          Championship Game Total Score
        </label>
        <input
          type="number"
          value={tiebreaker}
          onChange={(e) => setTiebreaker(Number(e.target.value))}
          disabled={isLocked}
          className="p-2 rounded bg-white/20 w-full"
        />
      </div>

      {/* -----------------------------
          BRACKET GRID
      ------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">

        {roundOrder.map((round) => (
          <div key={round} className="space-y-6">
            <h3 className="text-lg font-semibold text-center">
              {roundLabel(round)}
            </h3>

            {Object.keys(grouped[round]).map((region) => (
              <div key={region} className="space-y-4">
                <h4 className="text-sm text-center text-gray-300">
                  {region}
                </h4>

                {grouped[round][region].map((g) => {
                  const selected = picks[g.id];

                  return (
                    <div
                      key={g.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/20 transition-all"
                    >
                      {/* Team 1 */}
                      <button
                        disabled={isLocked}
                        onClick={() => handlePick(g.id, g.team1 ?? '')}
                        className={`block w-full text-left p-2 rounded mb-2 transition-all ${
                          selected === g.team1
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {g.team1 ?? 'TBD'}
                      </button>

                      {/* Team 2 */}
                      <button
                        disabled={isLocked}
                        onClick={() => handlePick(g.id, g.team2 ?? '')}
                        className={`block w-full text-left p-2 rounded transition-all ${
                          selected === g.team2
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        {g.team2 ?? 'TBD'}
                      </button>

                      {selected && (
                        <div className="mt-2 text-green-400 font-bold text-sm">
                          Selected: {selected}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}

      </div>

      {/* -----------------------------
          SUBMIT BUTTON
      ------------------------------ */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isLocked}
          className="px-6 py-3 bg-green-600 text-white rounded-xl text-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50"
        >
          Submit Bracket
        </button>
      </div>
    </div>
  );
}

function roundLabel(round: number) {
  switch (round) {
    case 1: return 'Opening Round';
    case 2: return 'Round of 64';
    case 3: return 'Round of 32';
    case 4: return 'Sweet 16';
    case 5: return 'Elite 8';
    case 6: return 'Final Four';
    case 7: return 'Championship';
    default: return `Round ${round}`;
  }
}
