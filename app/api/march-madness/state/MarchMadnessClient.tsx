// app/sports/march-madness/MarchMadnessClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { MarchMadnessState, LeaderboardRow, LiveGameSummary } from '@/lib/marchMadnessTypes';

export function MarchMadnessClient() {
  const [state, setState] = useState<MarchMadnessState | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [live, setLive] = useState<LiveGameSummary[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/march-madness/state');
      const json = await res.json();
      setState(json);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const [lbRes, liveRes] = await Promise.all([
        fetch('/api/march-madness/leaderboard'),
        fetch('/api/march-madness/live'),
      ]);
      setLeaderboard(await lbRes.json());
      setLive(await liveRes.json());
    })();
  }, []);

  if (!state) return <div>Loading March Madness…</div>;

  // From here you render:
  // - Opening Round panel (state.openingRoundGames)
  // - Regions (state.regionalGames)
  // - Bracket list (state.brackets)
  // - Leaderboard (leaderboard)
  // - Live ticker (live)

  return (
    <div>
      {/* Your Golf Weekly–style layout + bracket UI goes here */}
    </div>
  );
}
