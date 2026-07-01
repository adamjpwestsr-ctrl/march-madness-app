'use client';

import { useEffect, useState } from 'react';
import {
  MarchMadnessState,
  LeaderboardRow,
  LiveGameSummary,
} from '@/lib/marchMadnessTypes';

import { OpeningRoundPanel } from '@/components/march-madness/OpeningRoundPanel';
import { RegionBracketPanel } from '@/components/march-madness/RegionBracketPanel';
import { LiveTicker } from '@/components/march-madness/LiveTicker';
import { LeaderboardPreview } from '@/components/march-madness/LeaderboardPreview';
import MyPicksSidebar from '@/components/march-madness/MyPicksSidebar';

// ------------------------------------------------------
// MAIN CLIENT COMPONENT (FULLY POLISHED)
// ------------------------------------------------------
export function MarchMadnessClient() {
  const [state, setState] = useState<MarchMadnessState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [live, setLive] = useState<LiveGameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnpaid, setShowUnpaid] = useState(false);

  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeBracketId, setActiveBracketId] = useState<string | null>(null);

  // Picks keyed by game UUID
  const [picks, setPicks] = useState<Record<string, string>>({});

  const [brackets, setBrackets] = useState<any[]>([]);

  const regionOrder = ['East', 'West', 'South', 'Midwest'];

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
      setBrackets(json.brackets ?? []);

      // ⭐ Auto-select first bracket so UI hydrates
      if (!activeBracketId && json.brackets?.length) {
        setActiveBracketId(json.brackets[0].bracket_id);
      }

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
const handlePick = (gameId: string, winner: string) => {
  if (!winner || winner === 'TBD') return;

  // 1. Update picks
  setPicks((prev) => ({ ...prev, [gameId]: winner }));

  // 2. Update downstream Round-of-64 game immediately
  setState((prev) => {
    if (!prev) return prev;

    // Collect all games (opening + regional)
    const allGames = [
      ...prev.openingRoundGames,
      ...Object.values(prev.regionalGames).flat(),
    ];

    // Find the Opening Round game
    const sourceGame = allGames.find((g) => g.id === gameId);
    if (!sourceGame || !sourceGame.winner_to_game_id) return prev;

    const targetGameId = sourceGame.winner_to_game_id;

    // Find the downstream game inside regionalGames
    const updatedRegional = { ...prev.regionalGames };

    for (const regionKey of Object.keys(updatedRegional)) {
      updatedRegional[regionKey] = updatedRegional[regionKey].map((g) => {
        if (g.id !== targetGameId) return g;

        // Insert winner into correct slot
        const updatedGame = { ...g };

        if (!updatedGame.team1_id) {
          updatedGame.team1 = winner;
        } else if (!updatedGame.team2_id) {
          updatedGame.team2 = winner;
        }

        return updatedGame;
      });
    }

    return {
      ...prev,
      regionalGames: updatedRegional,
    };
  });
};

const handleSave = async () => {
  if (!activeBracketId) {
    console.error('No active bracket selected');
    return;
  }

  const formattedPicks = Object.entries(picks).map(([gameId, winner]) => ({
    game_id: gameId,
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
  } catch (err) {
    console.error('SAVE PICKS ERROR:', err);
  }
};

  // -----------------------------
  // REGION PROGRESS
  // -----------------------------
  const getRegionProgress = (region: string) => {
    if (!state) return { total: 0, picked: 0 };
    const games = state.regionalGames[region] ?? [];
    const total = games.length;
    const picked = games.filter((g) => picks[g.id]).length;
    return { total, picked };
  };

  // -----------------------------
  // LOADING STATE
  // -----------------------------
  if (loading || !state) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="p-6 rounded-xl bg-slate-900/80 border border-white/10 shadow-2xl">
          Loading March Madness…
        </div>
      </div>
    );
  }

  const visibleLeaderboard = showUnpaid
    ? leaderboard
    : leaderboard.filter((row) => row.has_paid);

// -----------------------------
// RENDER UI (FULL POLISH)
// -----------------------------

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white flex flex-col gap-8">
    {/* Header */}
    <header className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 backdrop-blur-xl">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight drop-shadow">
          March Madness Bracket
        </h1>
        <p className="text-sm text-white/60 mt-1">
          {state.lockState.bracketsOpen ? 'Brackets open' : 'Brackets locked'}
        </p>
      </div>

      <div className="flex items-center gap-4">
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
          className="bg-slate-800 text-white rounded-lg px-4 py-2 border border-white/20 shadow-md hover:bg-slate-700 transition"
        >
          <option value="">Select a bracket</option>
          {brackets.map((b) => (
            <option key={b.bracket_id} value={b.bracket_id}>
              {b.icon ?? '🏀'} {b.bracket_name}
            </option>
          ))}
          <option value="__create__">➕ Create Bracket</option>
        </select>

        <button
          onClick={handleSave}
          disabled={!activeBracketId}
          className={`px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition
            ${
              activeBracketId
                ? 'bg-green-600/70 hover:bg-green-500 border border-green-300'
                : 'bg-slate-700/60 text-white/40 border border-slate-600 cursor-not-allowed'
            }
          `}
        >
          Save Picks
        </button>
      </div>
    </header>

    {/* Live ticker */}
    <section className="px-6">
      <LiveTicker />
    </section>

    {/* Main content */}
    <main className="flex flex-col lg:flex-row gap-8 px-6 pb-10">

      {/* LEFT COLUMN — Picks Summary */}
      <div className="w-full lg:w-80">
        <MyPicksSidebar
          picks={picks}
          games={[
            ...state.openingRoundGames,
            ...Object.values(state.regionalGames).flat()
          ]}
          teams={state.teams}
          onJumpToGame={(gameId) => {
            const el = document.getElementById(`game-${gameId}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />
      </div>

      {/* Right column */}
      <div className="flex-1">
        {activeRegion && activeBracketId ? (
          <RegionBracketPanel
            region={activeRegion}
            games={state.regionalGames[activeRegion] ?? []}
            picks={picks}
            onPick={handlePick}
            teams={state.teams}
          />
        ) : (
          <div className="h-full rounded-2xl border border-dashed border-white/20 flex items-center justify-center text-white/50 bg-slate-900/60 backdrop-blur-xl shadow-xl">
            Select a region to view its bracket.
          </div>
        )}
      </div>
    </main>

    {/* Bottom strip */}
    <section className="px-6 pb-10 space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowUnpaid(!showUnpaid)}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition shadow-md"
        >
          {showUnpaid ? 'Hide Unpaid' : 'Show Unpaid'}
        </button>
      </div>

      <LeaderboardPreview rows={visibleLeaderboard} />
    </section>
  </div>
);

// ⭐ THIS WAS MISSING — CLOSE THE COMPONENT
}
