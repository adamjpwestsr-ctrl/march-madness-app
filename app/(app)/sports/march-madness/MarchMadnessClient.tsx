// app/(app)/sports/march-madness/MarchMadnessClient.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  MarchMadnessState,
  LeaderboardRow,
  LiveGameSummary,
} from '@/lib/marchMadnessTypes';

import { OpeningRoundPanel } from '@/components/march-madness/OpeningRoundPanel';
import { RegionalBracketPanel } from '@/components/march-madness/RegionalBracketPanel';
import { LiveTicker } from '@/components/march-madness/LiveTicker';
import { LeaderboardPreview } from '@/components/march-madness/LeaderboardPreview';
import { BracketList } from '@/components/march-madness/BracketList';

export function MarchMadnessClient() {
  const [state, setState] = useState<MarchMadnessState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [live, setLive] = useState<LiveGameSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch('/api/march-madness/state', { cache: 'no-store' });
      const json = await res.json();
      setState(json);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const load = async () => {
      const [lbRes, liveRes] = await Promise.all([
        fetch('/api/march-madness/leaderboard', { cache: 'no-store' }),
        fetch('/api/march-madness/live', { cache: 'no-store' }),
      ]);

      setLeaderboard(await lbRes.json());
      setLive(await liveRes.json());
    };

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !state) {
    return <div className="p-6">Loading March Madness…</div>;
  }

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

      {/* Regions */}
      <section className="space-y-6">
        {['East', 'West', 'South', 'Midwest'].map((region) => {
          const games = state.regionalGames[region] ?? [];
          if (!games.length) return null;

          return (
            <RegionBracketPanel
              key={region}
              region={region}
              games={games}
            />
          );
        })}
      </section>

      {/* Your brackets */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Your Brackets</h2>
        <BracketList brackets={state.brackets} />
      </section>

      {/* Leaderboard preview */}
      <section>
        <LeaderboardPreview />
      </section>
    </div>
  );
}
