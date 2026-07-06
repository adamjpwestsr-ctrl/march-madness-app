'use client';

import { useEffect, useState, useRef } from 'react';
import {
  MarchMadnessState,
  LeaderboardRow,
  LiveGameSummary,
  TournamentGame,
} from '@/lib/marchMadnessTypes';

import { OpeningRoundPanel } from '@/components/march-madness/OpeningRoundPanel';
import { RegionBracketPanel } from '@/components/march-madness/RegionBracketPanel';
import { FinalFourPanel } from '@/components/march-madness/FinalFourPanel';
import { ChampionshipPanel } from '@/components/march-madness/ChampionshipPanel';

import { LiveTicker } from '@/components/march-madness/LiveTicker';
import { LeaderboardPreview } from '@/components/march-madness/LeaderboardPreview';
import MyPicksSidebar from '@/components/march-madness/MyPicksSidebar';

export function MarchMadnessClient() {
  const [state, setState] = useState<MarchMadnessState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [live, setLive] = useState<LiveGameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnpaid, setShowUnpaid] = useState(false);

  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeBracketId, setActiveBracketId] = useState<string | null>(null);

  const [picks, setPicks] = useState<Record<string, string>>({});
  const [brackets, setBrackets] = useState<any[]>([]);

  const [showRegionModal, setShowRegionModal] = useState(false);

  const regionOrder = ['East', 'West', 'South', 'Midwest'];

  /* ---------------------------------------------------
     ROUND SCROLL ANCHORS (for modal navigation)
  --------------------------------------------------- */
const roundRefs: Record<number, React.RefObject<HTMLDivElement | null>> = {
  2: useRef<HTMLDivElement>(null),
  3: useRef<HTMLDivElement>(null),
  4: useRef<HTMLDivElement>(null),
  5: useRef<HTMLDivElement>(null),
};

  const scrollToRound = (round: number) => {
    const ref = roundRefs[round];
    if (ref?.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  /* ---------------------------------------------------
     LOAD GLOBAL STATE
  --------------------------------------------------- */
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

        if (!activeBracketId && json.brackets?.length) {
          setActiveBracketId(json.brackets[0].bracket_id);
        }

        if (!activeRegion && json.regionalGames) {
          const firstRegion = Object.keys(json.regionalGames).find(
            (r) => json.regionalGames[r]?.length
          );
          if (firstRegion) {
            setActiveRegion(firstRegion);
          }
        }
      } catch (err) {
        console.error('STATE ERROR:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------------------------------------------
     LOAD LEADERBOARD + LIVE SCORES
  --------------------------------------------------- */
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

/* ---------------------------------------------------
   BRACKET CREATION
--------------------------------------------------- */
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

/* ---------------------------------------------------
   PICK HANDLERS (ADVANCEMENT)
--------------------------------------------------- */
const handlePick = (gameId: string, winner: string) => {
  if (!winner || winner === 'TBD') return;

  setPicks((prev) => ({ ...prev, [gameId]: winner }));

  setState((prev) => {
    if (!prev) return prev;

    const allGames = [
      ...prev.openingRoundGames,
      ...Object.values(prev.regionalGames).flat(),
      ...prev.finalFourGames,
      ...prev.championshipGames,
    ];

    const sourceGame = allGames.find((g) => g.id === gameId);
    if (!sourceGame || !sourceGame.winner_to_game_id) return prev;

    const targetGameId = sourceGame.winner_to_game_id;

    const updatedRegional = { ...prev.regionalGames };
    const updatedFinalFour = [...prev.finalFourGames];
    const updatedChampionship = [...prev.championshipGames];

    const updateGame = (g: TournamentGame) => {
      const updatedGame = { ...g };
      if (!updatedGame.team1 || updatedGame.team1 === 'TBD') {
        updatedGame.team1 = winner;
      } else if (!updatedGame.team2 || updatedGame.team2 === 'TBD') {
        updatedGame.team2 = winner;
      }
      return updatedGame;
    };

    for (const regionKey of Object.keys(updatedRegional)) {
      updatedRegional[regionKey] = updatedRegional[regionKey].map((g) =>
        g.id === targetGameId ? updateGame(g) : g
      );
    }

    updatedFinalFour.forEach((g, idx) => {
      if (g.id === targetGameId) updatedFinalFour[idx] = updateGame(g);
    });

    updatedChampionship.forEach((g, idx) => {
      if (g.id === targetGameId) updatedChampionship[idx] = updateGame(g);
    });

    return {
      ...prev,
      regionalGames: updatedRegional,
      finalFourGames: updatedFinalFour,
      championshipGames: updatedChampionship,
    };
  });
};

/* ---------------------------------------------------
   SAVE PICKS
--------------------------------------------------- */
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          picks: formattedPicks,
          tiebreaker_score: null,
        }),
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

/* ---------------------------------------------------
   REGION PROGRESS
--------------------------------------------------- */
const getRegionProgress = (region: string) => {
  if (!state) return { total: 0, picked: 0 };
  const games = state.regionalGames[region] ?? [];
  const total = games.length;
  const picked = games.filter((g) => picks[g.id]).length;
  return { total, picked };
};

  /* ---------------------------------------------------
     LOADING
  --------------------------------------------------- */
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

  /* ---------------------------------------------------
     RENDER UI
  --------------------------------------------------- */
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

      {/* Main 3-column layout */}
      <main className="grid grid-cols-[300px_1fr_300px] gap-8 px-6 pb-10">

        {/* Opening Round */}
        <div className="space-y-6">
          <OpeningRoundPanel
            games={state.openingRoundGames}
            live={live}
            picks={picks}
            onPick={handlePick}
          />
        </div>

        {/* Center column */}
        <div className="space-y-12">
          {/* Regions */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-wide">Regions</h2>

            <div className="grid grid-cols-2 gap-6">
              {regionOrder.map((region) => {
                const progress = getRegionProgress(region);
                const total = progress.total || 1;
                const pct = Math.round((progress.picked / total) * 100);

                return (
                  <button
                    key={region}
                    onClick={() => {
                      setActiveRegion(region);
                      setShowRegionModal(true);
                    }}
                    className="relative rounded-2xl p-4 bg-slate-900/70 border border-white/10 shadow-xl hover:shadow-2xl hover:bg-slate-800/80 transition flex flex-col gap-3 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold uppercase tracking-wide">
                        {region}
                      </span>
                      <span className="text-xs text-white/60">
                        {progress.picked}/{progress.total} picks
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-2 bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <p className="text-xs text-white/60">
                      Tap to open full {region} bracket
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Final Four */}
          <FinalFourPanel games={state.finalFourGames} onPick={handlePick} />

          {/* Championship */}
          <ChampionshipPanel
            game={state.championshipGames[0]}
            onPick={handlePick}
          />
        </div>

        {/* My Picks */}
        <div className="space-y-6">
          <MyPicksSidebar
            picks={picks}
            games={[
              ...state.openingRoundGames,
              ...Object.values(state.regionalGames).flat(),
              ...state.finalFourGames,
              ...state.championshipGames,
            ]}
            teams={state.teams}
            onJumpToGame={(gameId) => {
              const el = document.getElementById(`game-${gameId}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
          />
        </div>
      </main>

      {/* Leaderboard */}
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

      {/* REGION MODAL */}
      {showRegionModal && activeRegion && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 animate-fade-in">
          <div className="relative w-[95%] max-w-6xl h-[85vh] bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90">
              <h2 className="text-2xl font-bold uppercase tracking-wide">
                {activeRegion} Bracket
              </h2>
              <button
                onClick={() => setShowRegionModal(false)}
                className="text-sm px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20"
              >
                Close
              </button>
            </div>

            {/* Modal content with round anchors */}
            <div className="p-6 h-[80vh] overflow-auto">
              <div ref={roundRefs[2]}>
                <RegionBracketPanel
                  region={activeRegion}
                  games={state.regionalGames[activeRegion] ?? []}
                  picks={picks}
                  onPick={handlePick}
                  teams={state.teams}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
