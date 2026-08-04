'use client';

import { useEffect, useState } from 'react';

interface OverrideModalProps {
  open: boolean;
  onClose: () => void;
  onLog: (msg: string) => void;
}

export default function OverrideModal({ open, onClose, onLog }: OverrideModalProps) {
  const [games, setGames] = useState<any[]>([]);
  const [selectedGame, setSelectedGame] = useState<any | null>(null);
  const [winner, setWinner] = useState('');
  const [loading, setLoading] = useState(false);

  // Load games when modal opens
  useEffect(() => {
    if (!open) return;

    async function loadGames() {
      const res = await fetch('/api/march-madness/state');
      const json = await res.json();

      const allGames = [
        ...json.openingRoundGames,
        ...Object.values(json.regionalGames).flat(),
      ];

      setGames(allGames);
    }

    loadGames();
  }, [open]);

  async function submitOverride() {
    if (!selectedGame || !winner) return;

    setLoading(true);
    onLog(`▶️ Override started for game ${selectedGame.id}`);

    try {
      const res = await fetch('/api/march-madness/admin/override', {
        method: 'POST',
        body: JSON.stringify({
          game_id: selectedGame.id,
          winner_team: winner,
        }),
      });

      const json = await res.json();
      onLog(`✅ Override complete: ${JSON.stringify(json)}`);
      onClose();
    } catch (err) {
      onLog(`❌ Override failed: ${err}`);
    }

    setLoading(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 w-[500px] shadow-xl">
        <h2 className="text-2xl font-bold mb-6">Override Game Result</h2>

        {/* GAME SELECT */}
        <label className="block mb-2 text-sm text-gray-400">Select Game</label>
        <select
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 mb-6"
          onChange={(e) => {
            const game = games.find((g) => g.id === Number(e.target.value));
            setSelectedGame(game);
            setWinner('');
          }}
        >
          <option value="">Choose a game...</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {`[${g.region}] Round ${g.round} — ${g.team1 ?? 'TBD'} vs ${g.team2 ?? 'TBD'}`}
            </option>
          ))}
        </select>

        {/* WINNER SELECT */}
        {selectedGame && (
          <>
            <label className="block mb-2 text-sm text-gray-400">Select Winner</label>
            <select
              className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 mb-6"
              onChange={(e) => setWinner(e.target.value)}
            >
              <option value="">Choose winner...</option>
              {selectedGame.team1 && (
                <option value={selectedGame.team1}>{selectedGame.team1}</option>
              )}
              {selectedGame.team2 && (
                <option value={selectedGame.team2}>{selectedGame.team2}</option>
              )}
            </select>
          </>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
          >
            Cancel
          </button>

          <button
            onClick={submitOverride}
            disabled={loading || !winner}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition disabled:opacity-50"
          >
            {loading ? 'Overriding...' : 'Confirm Override'}
          </button>
        </div>
      </div>
    </div>
  );
}
