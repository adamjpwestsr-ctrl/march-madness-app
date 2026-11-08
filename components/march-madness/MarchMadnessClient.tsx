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

export function MarchMadnessClient({ bracketId }: { bracketId?: string }) {
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

  const [focusedLayer, setFocusedLayer] = useState<
    'opening' | 'regions' | 'finalfour' | 'championship' | null
  >(null);

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
  // LOAD V2 STATE
  useEffect(() => {
    if (!bracketId) return;

    (async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/march-madness-v2/state?bracket_id=${bracketId}`,
          { cache: 'no-store' }
        );

        if (!res.ok) {
          console.error('Failed to load V2 state');
          setLoading(false);
          return;
        }

        const json = await res.json();

        setState(json.state);
        setPicks(json.picks ?? {});
        setBrackets([json.bracket]);
        setActiveBracketId(bracketId);

        if (!activeRegion && json.state?.regionalGames) {
          const firstRegion = Object.keys(json.state.regionalGames).find(
            (r) => json.state.regionalGames[r]?.length
          );
          if (firstRegion) setActiveRegion(firstRegion);
        }
      } catch (err) {
        console.error('STATE ERROR:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [bracketId]);

  // LIVE + LEADERBOARD (V2)
  useEffect(() => {
    if (!bracketId) return;

    const load = async () => {
      try {
        const [leaderRes, liveRes] = await Promise.all([
          fetch(`/api/march-madness-v2/leaderboard?bracket_id=${bracketId}`, {
            cache: 'no-store',
          }),
          fetch(`/api/march-madness-v2/live`, { cache: 'no-store' }),
        ]);

        if (leaderRes.ok) {
          setLeaderboard(await leaderRes.json());
        }

        if (liveRes.ok) {
          setLive(await liveRes.json());
        }
      } catch (err) {
        console.error('LIVE/LEADERBOARD ERROR:', err);
      }
    };

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [bracketId]);

  // HANDLE PICK + PROPAGATION
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

      return {
        ...prev,
        regionalGames: updatedRegional,
        finalFourGames: updatedFinalFour,
        championshipGames: updatedChampionship,
      };
    });
  };
  const getRegionProgress = (region: string) => {
    if (!state) return { total: 0, picked: 0 };
    const games = state.regionalGames[region] ?? [];
    const total = games.length;
    const picked = games.filter((g) => picks[g.id]).length;
    return { total, picked };
  };

  const isOpeningRoundComplete = state?.openingRoundGames.every((g) => picks[g.id]);
  const isRegionsComplete = Object.values(state?.regionalGames ?? {})
    .flat()
    .every((g) => picks[g.id]);
  const isFinalFourComplete = state?.finalFourGames.every((g) => picks[g.id]);

  useEffect(() => {
    if (isOpeningRoundComplete) {
      document.getElementById('regions-layer')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isOpeningRoundComplete]);

  useEffect(() => {
    if (isRegionsComplete) {
      document.getElementById('finalfour-layer')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isRegionsComplete]);

  useEffect(() => {
    if (isFinalFourComplete) {
      document.getElementById('championship-layer')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isFinalFourComplete]);

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
    : leaderboard.filter((r) => r.has_paid);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white flex flex-col gap-8 overflow-x-hidden">

      <header className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10 backdrop-blur-xl">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight drop-shadow">
            March Madness Bracket
          </h1>
          <p className="text-sm text-white/60 mt-1">
            {state.lockState.bracketsOpen ? 'Brackets open' : 'Brackets locked'}
          </p>
        </div>

        <button
          onClick={async () => {
            if (!bracketId) return;
            await fetch('/api/march-madness-v2/save-picks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bracket_id: bracketId, picks }),
            });
          }}
          className="px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition bg-green-600/70 hover:bg-green-500 border border-green-300"
        >
          Save Picks
        </button>
      </header>

      <section className="px-6">
        <LiveTicker />
      </section>

      <main className="w-full flex justify-center px-6 pb-10 overflow-x-hidden">
        <div
          className="relative w-full max-w-[1200px] mx-auto space-y-0"
          style={{
            perspective: '1200px',
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            id="championship-layer"
            onClick={() =>
              setFocusedLayer((prev) =>
                prev === 'championship' ? null : 'championship'
              )
            }
            className={`relative mt-[-80px] transition-all duration-700 cursor-pointer ${
              focusedLayer === 'championship'
                ? 'z-50 scale-[1.02] opacity-100'
                : `z-10 ${
                    isFinalFourComplete
                      ? 'scale-[1.0] opacity-100'
                      : 'scale-[0.9] opacity-55'
                  }`
            }`}
            style={{
              transform:
                focusedLayer === 'championship'
                  ? 'rotateY(0deg)'
                  : 'rotateY(0deg)',
              transformOrigin: 'center top',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur-xl border border-white/10 shadow-xl">
              <ChampionshipPanel
                game={state.championshipGames[0]}
                onPick={handlePick}
              />
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={() => setShowPicksDrawer(true)}
        className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white px-5 py-2 rounded-full shadow-lg hover:bg-slate-700 transition"
      >
        My Picks
      </button>

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

            <div className="p-6 h-[80vh] overflow-auto space-y-12">

              <div ref={roundRefs[2]}>
                <h3 className="text-xl font-semibold mb-4">Round of 64</h3>
                <RegionBracketPanel
                  region={activeRegion}
                  games={
                    state.regionalGames[activeRegion]?.filter(
                      (g) => g.round === 2
                    ) ?? []
                  }
                  picks={picks}
                  onPick={handlePick}
                  teams={state.teams}
                />
              </div>

              <div ref={roundRefs[3]}>
                <h3 className="text-xl font-semibold mb-4">Round of 32</h3>
                <RegionBracketPanel
                  region={activeRegion}
                  games={
                    state.regionalGames[activeRegion]?.filter(
                      (g) => g.round === 3
                    ) ?? []
                  }
                  picks={picks}
                  onPick={handlePick}
                  teams={state.teams}
                />
              </div>

              <div ref={roundRefs[4]}>
                <h3 className="text-xl font-semibold mb-4">Sweet 16</h3>
                <RegionBracketPanel
                  region={activeRegion}
                  games={
                    state.regionalGames[activeRegion]?.filter(
                      (g) => g.round === 4
                    ) ?? []
                  }
                  picks={picks}
                  onPick={handlePick}
                  teams={state.teams}
                />
              </div>

              <div ref={roundRefs[5]}>
                <h3 className="text-xl font-semibold mb-4">Elite 8</h3>
                <RegionBracketPanel
                  region={activeRegion}
                  games={
                    state.regionalGames[activeRegion]?.filter(
                      (g) => g.round === 5
                    ) ?? []
                  }
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
