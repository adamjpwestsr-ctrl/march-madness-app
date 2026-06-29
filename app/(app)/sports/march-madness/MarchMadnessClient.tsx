'use client';

import { useEffect, useState } from 'react';
import {
  MarchMadnessState,
  LeaderboardRow,
  LiveGameSummary,
  TournamentGame,
} from '@/lib/marchMadnessTypes';

import { OpeningRoundPanel } from '@/components/march-madness/OpeningRoundPanel';
import { RegionBracketPanel } from '@/components/march-madness/RegionBracketPanel';
import { LiveTicker } from '@/components/march-madness/LiveTicker';
import { LeaderboardPreview } from '@/components/march-madness/LeaderboardPreview';

// ------------------------------------------------------
// REGION MODAL OVERLAY
// ------------------------------------------------------
function RegionModal({
  region,
  games,
  picks,
  onPick,
  onSave,
  onClose,
}: {
  region: string;
  games: TournamentGame[];
  picks: Record<number, string>;
  onPick: (gameId: number, winner: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-full max-w-6xl bg-slate-900 rounded-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-sm font-semibold"
        >
          ✕ Close
        </button>

        <button
          onClick={onSave}
          className="absolute top-4 right-24 px-3 py-1 rounded-md bg-green-600/40 border border-green-400 text-xs text-white/90 hover:bg-green-600/60 transition"
        >
          Save Picks
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center uppercase tracking-wide">
          {region} Region
        </h2>

        <RegionBracketPanel region={region} games={games} onPick={onPick} />
      </div>
    </div>
  );
}

// ------------------------------------------------------
// MAIN CLIENT COMPONENT
// ------------------------------------------------------
export function MarchMadnessClient() {
  const [state, setState] = useState<MarchMadnessState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [live, setLive] = useState<LiveGameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnpaid, setShowUnpaid] = useState(false);

  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeBracketId, setActiveBracketId] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [brackets, setBrackets] = useState<any[]>([]);

  // -----------------------------
  // LOAD GLOBAL STATE
  // -----------------------------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const res = await fetch('/api/march-madness/state?all=true', {
          cache: 'no-store',
        });

        if (!res.ok) {
          console.error('STATE FETCH FAILED:', await res.text());
          setLoading(false);
          return;
        }

        const json = await res.json();

        // ⭐ FIX: Group games by region
        const groupedByRegion: Record<string, TournamentGame[]> = {};
        const allGames: TournamentGame[] = json.allGames ?? json.games ?? [];

        allGames.forEach((game) => {
          const regionKey = game.region ?? 'Unknown';
          if (!groupedByRegion[regionKey]) groupedByRegion[regionKey] = [];
          groupedByRegion[regionKey].push(game);
        });

        setState({
          ...json,
          regionalGames: groupedByRegion,
        });

        setBrackets(json.brackets ?? []);
      } catch (err) {
        console.error('STATE ERROR:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -----------------------------
  // LOAD LEADERBOARD + LIVE SCORES
  // -----------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const [stateRes, liveRes] = await Promise.all([
          fetch('/api/march-madness/state?all=true', { cache: 'no-store' }),
          fetch('/api/march-madness/live', { cache: 'no-store' }),
        ]);

        if (stateRes.ok) {
          const stateJson = await stateRes.json();
          setLeaderboard(stateJson.leaderboard ?? []);
        }

        if (liveRes.ok) {
          const liveJson = await liveRes.json();
          setLive(liveJson ?? []);
        }
      } catch (err) {
        console.error('LIVE/LEADERBOARD ERROR:', err);
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  // -----------------------------
  // BRACKET CREATION
  // -----------------------------
  const handleCreateBracket = async () => {
    try {
      const res = await fetch('/api/march-madness/bracket-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bracket_name: 'My Bracket',
          icon: '🏀',
          tiebreaker_score: 120,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setBrackets((prev) => [...prev, json]);
        setActiveBracketId(json.bracket_id);
      } else {
        console.error('CREATE BRACKET ERROR:', json.error);
      }
    } catch (err) {
      console.error('CREATE BRACKET FAILED:', err);
    }
  };

  // -----------------------------
  // PICK HANDLERS
  // -----------------------------
  const handlePick = (gameId: number, winner: string) => {
    setPicks((prev) => ({ ...prev, [gameId]: winner }));
  };

  const handleSave = async () => {
    if (!activeBracketId) {
      console.error('No active bracket selected');
      return;
    }

    const formattedPicks = Object.entries(picks).map(([gameId, winner]) => ({
      game_id: Number(gameId),
      selected_team: winner,
    }));

    try {
      const res = await fetch(
        `/api/march-madness/brackets/${activeBracketId}/picks`,
        {
          method: 'POST',
          body: JSON.stringify({
            picks: formattedPicks,
            tiebreaker_score: null,
          }),
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!res.ok) {
        console.error('SAVE PICKS FAILED:', await res.text());
        return;
      }

      console.log('Picks saved!');
      setActiveRegion(null);
    } catch (err) {
      console.error('SAVE PICKS ERROR:', err);
    }
  };

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (loading || !state) {
    return <div className="p-6">Loading March Madness…</div>;
  }

  const visibleLeaderboard = showUnpaid
    ? leaderboard
    : leaderboard.filter((row) => row.has_paid);

  const regionOrder = ['East', 'West', 'South', 'Midwest'];

  // -----------------------------
  // RENDER UI
  // -----------------------------
  return (
    <div className="space-y-8">
      <section>
        <LiveTicker />
      </section>

      {/* Bracket selector */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Brackets</h2>
          <div className="flex items-center gap-2">
            <select
              value={activeBracketId ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '__create__') {
                  handleCreateBracket();
                } else {
                  setActiveBracketId(val || null);
                }
              }}
              className="bg-slate-800 text-white rounded-md px-3 py-2 border border-white/20"
            >
              <option value="">Select a bracket</option>
              {brackets.map((b) => (
                <option key={b.bracket_id} value={b.bracket_id}>
                  {b.icon ?? '🏀'} {b.bracket_name}
                </option>
              ))}
              <option value="__create__">➕ Create Bracket</option>
            </select>
          </div>
        </div>
      </section>

      {/* Opening Round */}
      <section>
        <OpeningRoundPanel games={state.openingRoundGames} live={live} />
      </section>

      {/* Regions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Regions</h2>

        {!activeBracketId && (
          <p className="text-center text-red-400 font-semibold">
            Select or create a bracket above before making picks.
          </p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {regionOrder.map((region) => {
            const games = state.regionalGames[region] ?? [];
            if (!games.length) return null;

            return (
              <button
                key={region}
                disabled={!activeBracketId}
                onClick={() => setActiveRegion(region)}
                className={`rounded-xl p-4 text-center font-bold uppercase tracking-wide transition
                  ${
                    activeBracketId
                      ? 'bg-white/10 border border-white/20 text-white/90 hover:bg-white/20'
                      : 'bg-gray-700/40 border border-gray-600 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {region}
              </button>
            );
          })}
        </div>
      </section>

      {/* Region modal overlay */}
      {activeRegion && activeBracketId && (
        <RegionModal
          region={activeRegion}
          games={state.regionalGames[activeRegion] ?? []}
          picks={picks}
          onPick={handlePick}
          onSave={handleSave}
          onClose={() => setActiveRegion(null)}
        />
      )}

      {/* Leaderboard preview */}
      <section className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setShowUnpaid(!showUnpaid)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition"
          >
            {showUnpaid ? 'Hide Unpaid' : 'Show Unpaid'}
          </button>
        </div>

        <LeaderboardPreview rows={visibleLeaderboard} />
      </section>
    </div>
  );
}
