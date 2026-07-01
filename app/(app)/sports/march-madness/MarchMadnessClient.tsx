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
// MAIN CLIENT COMPONENT (REDESIGNED LAYOUT)
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
  // PICK HANDLERS (UUID SAFE)
  // -----------------------------
  const handlePick = (gameId: string, winner: string) => {
    if (!winner || winner === 'TBD') return;
    setPicks((prev) => ({ ...prev, [gameId]: winner }));
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
  // REGION PROGRESS (for overview cards)
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
  // RENDER UI (REDESIGNED LAYOUT)
  // -----------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            March Madness Bracket
          </h1>
          <p className="text-sm text-white/60">
            {state.lockState.bracketsOpen ? 'Brackets open' : 'Brackets locked'}
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={handleSave}
            disabled={!activeBracketId}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition
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
      <main className="flex flex-col lg:flex-row gap-6 px-6 pb-6">
        {/* Left column: Opening Round + Regions overview */}
        <div className="flex-1 flex flex-col gap-4">
          <OpeningRoundPanel
            games={state.openingRoundGames}
            live={live}
            onPick={(gameId, winner) => handlePick(gameId, winner)}
          />

          <div className="rounded-xl p-4 bg-slate-900/70 border border-white/10 shadow-xl space-y-3">
            <h2 className="text-lg font-bold text-center uppercase tracking-wide text-white/80">
              Regions Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {regionOrder.map((region) => {
                const { total, picked } = getRegionProgress(region);
                const progress =
                  total > 0 ? Math.round((picked / total) * 100) : 0;

                return (
                  <button
                    key={region}
                    disabled={!activeBracketId}
                    onClick={() => setActiveRegion(region)}
                    className={`rounded-xl p-4 bg-white/5 border border-white/10 transition-all flex flex-col items-center gap-2
                      ${
                        activeBracketId
                          ? 'hover:bg-white/10 hover:scale-[1.02]'
                          : 'bg-slate-800/60 text-white/40 cursor-not-allowed'
                      }
                    `}
                  >
                    <span className="text-sm uppercase tracking-wide font-bold">
                      {region}
                    </span>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/70">
                      {picked}/{total} picks
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Region bracket detail */}
        <div className="flex-1">
          {activeRegion && activeBracketId ? (
            <RegionBracketPanel
              region={activeRegion}
              games={state.regionalGames[activeRegion] ?? []}
              onPick={(gameId, winner) => handlePick(gameId, winner)}
            />
          ) : (
            <div className="h-full rounded-xl border border-dashed border-white/20 flex items-center justify-center text-white/50 bg-slate-900/60">
              Select a region to view its bracket.
            </div>
          )}
        </div>
      </main>

      {/* Bottom strip: Leaderboard + controls */}
      <section className="px-6 pb-6 space-y-4">
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
