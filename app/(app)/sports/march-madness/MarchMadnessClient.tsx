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
  const [showPicksDrawer, setShowPicksDrawer] = useState(false);

  const regionOrder = ['East', 'West', 'South', 'Midwest'];
  const roundRefs: Record<number, React.RefObject<HTMLDivElement | null>> = {
    2: useRef<HTMLDivElement>(null),
    3: useRef<HTMLDivElement>(null),
    4: useRef<HTMLDivElement>(null),
    5: useRef<HTMLDivElement>(null),
  };

  const scrollToRound = (round: number) => {
    const ref = roundRefs[round];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/march-madness/state?all=true', { cache: 'no-store' });
        if (!res.ok) return setLoading(false);
        const json = await res.json();
        setState(json);
        setBrackets(json.brackets ?? []);
        if (!activeBracketId && json.brackets?.length) setActiveBracketId(json.brackets[0].bracket_id);
        if (!activeRegion && json.regionalGames) {
          const firstRegion = Object.keys(json.regionalGames).find((r) => json.regionalGames[r]?.length);
          if (firstRegion) setActiveRegion(firstRegion);
        }
      } catch (err) {
        console.error('STATE ERROR:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [stateRes, liveRes] = await Promise.all([
          fetch('/api/march-madness/state?all=true', { cache: 'no-store' }),
          fetch('/api/march-madness/live', { cache: 'no-store' }),
        ]);
        if (stateRes.ok) setLeaderboard((await stateRes.json()).leaderboard ?? []);
        if (liveRes.ok) setLive(await liveRes.json());
      } catch (err) {
        console.error('LIVE/LEADERBOARD ERROR:', err);
      }
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

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
      const updateGame = (g: TournamentGame) => {
        const updated = { ...g };
        if (!updated.team1 || updated.team1 === 'TBD') updated.team1 = winner;
        else if (!updated.team2 || updated.team2 === 'TBD') updated.team2 = winner;
        return updated;
      };
      const updatedRegional = Object.fromEntries(
        Object.entries(prev.regionalGames).map(([r, games]) => [
          r,
          games.map((g) => (g.id === targetGameId ? updateGame(g) : g)),
        ])
      );
      const updatedFinalFour = prev.finalFourGames.map((g) =>
        g.id === targetGameId ? updateGame(g) : g
      );
      const updatedChampionship = prev.championshipGames.map((g) =>
        g.id === targetGameId ? updateGame(g) : g
      );
      return { ...prev, regionalGames: updatedRegional, finalFourGames: updatedFinalFour, championshipGames: updatedChampionship };
    });
  };

  const getRegionProgress = (region: string) => {
    if (!state) return { total: 0, picked: 0 };
    const games = state.regionalGames[region] ?? [];
    const total = games.length;
    const picked = games.filter((g) => picks[g.id]).length;
    return { total, picked };
  };

  if (loading || !state) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="p-6 rounded-xl bg-slate-900/80 border border-white/10 shadow-2xl">
          Loading March Madness…
        </div>
      </div>
    );
  }

  const visibleLeaderboard = showUnpaid ? leaderboard : leaderboard.filter((r) => r.has_paid);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white flex flex-col gap-8 overflow-x-hidden">

      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 backdrop-blur-xl">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight drop-shadow">March Madness Bracket</h1>
          <p className="text-sm text-white/60 mt-1">
            {state.lockState.bracketsOpen ? 'Brackets open' : 'Brackets locked'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={activeBracketId ?? ''}
            onChange={(e) => setActiveBracketId(e.target.value || null)}
            className="bg-slate-800 text-white rounded-lg px-4 py-2 border border-white/20 shadow-md hover:bg-slate-700 transition"
          >
            <option value="">Select a bracket</option>
            {brackets.map((b) => (
              <option key={b.bracket_id} value={b.bracket_id}>
                {b.icon ?? '🏀'} {b.bracket_name}
              </option>
            ))}
          </select>
          <button
            onClick={() => console.log('Save Picks')}
            disabled={!activeBracketId}
            className={`px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition ${
              activeBracketId
                ? 'bg-green-600/70 hover:bg-green-500 border border-green-300'
                : 'bg-slate-700/60 text-white/40 border border-slate-600 cursor-not-allowed'
            }`}
          >
            Save Picks
          </button>
        </div>
      </header>

      {/* Live ticker */}
      <section className="px-6">
        <LiveTicker />
      </section>

      {/* Main layout */}
      <main className="flex flex-wrap gap-8 px-8 pb-10 items-start justify-center max-w-[1800px] mx-auto overflow-x-hidden">

        {/* Opening Round */}
        <div className="flex-[0.55] min-w-[480px] max-w-[700px] space-y-6 rounded-2xl p-5 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-white/10 shadow-xl">
          <OpeningRoundPanel
            games={state.openingRoundGames}
            live={live}
            picks={picks}
            onPick={handlePick}
          />
        </div>

        {/* Regions + Finals */}
        <div className="flex-[0.35] min-w-[380px] max-w-[600px] space-y-8 rounded-2xl p-5 bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-white/10 shadow-xl">

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
          <FinalFourPanel
            games={state.finalFourGames}
            onPick={handlePick}
          />

          {/* Championship */}
          <ChampionshipPanel
            game={state.championshipGames[0]}
            onPick={handlePick}
          />
        </div>

        {/* My Picks Drawer Button */}
        <button
          onClick={() => setShowPicksDrawer(true)}
          className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white px-5 py-2 rounded-full shadow-lg hover:bg-slate-700 transition"
        >
          My Picks
        </button>

        {/* My Picks Drawer */}
        {showPicksDrawer && (
          <div className="fixed right-0 top-0 h-full w-[320px] bg-slate-900/95 border-l border-white/10 shadow-2xl overflow-y-auto z-40">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-lg font-bold">My Picks</h2>
              <button
                onClick={() => setShowPicksDrawer(false)}
                className="text-sm px-2 py-1 rounded bg-white/10 hover:bg-white/20"
              >
                Close
              </button>
            </div>

            <MyPicksSidebar
              picks={picks}
              games={[
                ...state.openingRoundGames,
                ...Object.values(state.regionalGames).flat(),
                ...state.finalFourGames,
                ...state.championshipGames,
              ]}
              teams={state.teams}
            />
          </div>
        )}

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

      {/* Modal Header */}
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

      {/* Modal Content */}
      <div className="p-6 h-[80vh] overflow-auto space-y-12">

        {/* Round of 64 */}
        <div ref={roundRefs[2]}>
          <h3 className="text-xl font-semibold mb-4">Round of 64</h3>
          <RegionBracketPanel
            region={activeRegion}
            games={state.regionalGames[activeRegion]?.filter(g => g.round === 2) ?? []}
            picks={picks}
            onPick={handlePick}
            teams={state.teams}
          />
        </div>

        {/* Round of 32 */}
        <div ref={roundRefs[3]}>
          <h3 className="text-xl font-semibold mb-4">Round of 32</h3>
          <RegionBracketPanel
            region={activeRegion}
            games={state.regionalGames[activeRegion]?.filter(g => g.round === 3) ?? []}
            picks={picks}
            onPick={handlePick}
            teams={state.teams}
          />
        </div>

        {/* Sweet 16 */}
        <div ref={roundRefs[4]}>
          <h3 className="text-xl font-semibold mb-4">Sweet 16</h3>
          <RegionBracketPanel
            region={activeRegion}
            games={state.regionalGames[activeRegion]?.filter(g => g.round === 4) ?? []}
            picks={picks}
            onPick={handlePick}
            teams={state.teams}
          />
        </div>

        {/* Elite 8 */}
        <div ref={roundRefs[5]}>
          <h3 className="text-xl font-semibold mb-4">Elite 8</h3>
          <RegionBracketPanel
            region={activeRegion}
            games={state.regionalGames[activeRegion]?.filter(g => g.round === 5) ?? []}
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
