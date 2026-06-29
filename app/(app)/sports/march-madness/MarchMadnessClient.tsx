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
import { BracketList } from '@/components/march-madness/BracketList';

// ------------------------------------------------------
// EXPANDABLE REGION CARDS
// ------------------------------------------------------
function ExpandableRegions({
  regionalGames,
}: {
  regionalGames: Record<string, any[]>;
}) {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const toggleRegion = (region: string) => {
    setExpandedRegion(expandedRegion === region ? null : region);
  };

  const regionOrder = ['East', 'West', 'South', 'Midwest'];

  return (
    <section className="space-y-6">
      {regionOrder.map((region) => {
        const games = regionalGames[region] ?? [];
        if (!games.length) return null;

        const isExpanded = expandedRegion === region;

        return (
          <div
            key={region}
            className="rounded-xl bg-white/10 backdrop-blur-xl shadow-xl border border-white/20 overflow-hidden transition-all"
          >
            {/* Header */}
            <button
              onClick={() => toggleRegion(region)}
              className="w-full flex justify-between items-center px-6 py-4 text-lg font-bold uppercase tracking-wide text-white/90 hover:bg-white/20 transition"
            >
              <span>{region}</span>
              <span className="text-sm opacity-70">
                {isExpanded ? 'Collapse' : 'Expand'}
              </span>
            </button>

            {/* Collapsible Content */}
            <div
              className={`transition-[max-height] duration-500 ease-in-out ${
                isExpanded ? 'max-h-[2000px]' : 'max-h-0'
              } overflow-hidden`}
            >
              {isExpanded && (
                <div className="p-6">
                  <RegionBracketPanel region={region} games={games} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
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

      {/* Expandable Regions */}
      <ExpandableRegions regionalGames={state.regionalGames} />

      {/* Your brackets */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Your Brackets</h2>
        <BracketList brackets={state.brackets} />
      </section>

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
