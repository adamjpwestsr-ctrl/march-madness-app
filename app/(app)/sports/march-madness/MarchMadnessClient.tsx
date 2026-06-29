'use client';

import { useEffect, useState } from 'react';
import {
  MarchMadnessState,
  LeaderboardRow,
  LiveGameSummary,
  TournamentGame,
  Bracket,
} from '@/lib/marchMadnessTypes';

import { OpeningRoundPanel } from '@/components/march-madness/OpeningRoundPanel';
import { RegionBracketPanel } from '@/components/march-madness/RegionBracketPanel';
import { LiveTicker } from '@/components/march-madness/LiveTicker';
import { LeaderboardPreview } from '@/components/march-madness/LeaderboardPreview';
import { BracketList } from '@/components/march-madness/BracketList';

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

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-sm font-semibold"
        >
          ✕ Close
        </button>

        {/* Save Picks */}
        <button
          onClick={onSave}
          className="absolute top-4 right-24 px-3 py-1 rounded-md bg-green-600/40 border border-green-400 text-xs text-white/90 hover:bg-green-600/60 transition"
        >
          Save Picks
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center uppercase tracking-wide">
          {region} Region
        </h2>

        <RegionBracketPanel
          region={region}
          games={games}
          onPick={onPick}
        />
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

  // ⭐ The bracket the user is editing
  const [activeBracketId, setActiveBracketId] = useState<string | null>(null);

  // ⭐ Local pick state: gameId → winner
  const [picks, setPicks] = useState<Record<number, string>>({});

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
        setState(json);

        console.log('STATE BRACKETS:', json.brackets);
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
        } else {
          console.error('LEADERBOARD FETCH FAILED:', await stateRes.text());
        }

        if (liveRes.ok) {
          const liveJson = await liveRes.json();
          setLive(liveJson ?? []);
        } else {
          console.error('LIVE FETCH FAILED:', await liveRes.text());
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
  // LOADING STATE
  // -----------------------------
  if (loading || !state) {
    return <div className="p-6">Loading March Madness…</div>;
  }

  // -----------------------------
  // FILTER LEADERBOARD
  // -----------------------------
  const visibleLeaderboard = showUnpaid
    ? leaderboard
    : leaderboard.filter((row) => row.has_paid);

  const regionOrder = ['East', 'West', 'South', 'Midwest'];

  // -----------------------------
  // PICK HANDLERS
  // -----------------------------
  const handlePick = (gameId: number, winner: string) => {
    setPicks((prev) => ({
      ...prev,
      [gameId]: winner,
    }));
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
  // RENDER UI
  // -----------------------------
  return (
    <div className="space-y-8">
      {/* Live ticker */}
      <section>
        <LiveTicker />
      </section>

      {/* Opening Round */}
      <section>
        <OpeningRoundPanel games={state.openingRoundGames} live={live} />
      </section>

      {/* Your brackets (user must select one first) */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Your Brackets</h2>

        <BracketList
          brackets={state.brackets}
          onSelectBracket={(bracketId: string) => {
            setActiveBracketId(bracketId);
            setPicks({});
          }}
        />
      </section>

      {/* Regions */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-center">Regions</h2>

        {!activeBracketId && (
          <p className="text-center text-red-400 font-semibold">
            Select a bracket above before making picks.
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
