// app/(app)/sports/march-madness/brackets/[id]/edit/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { InteractiveBracketEditor } from '@/components/march-madness/InteractiveBracketEditor';
import { TournamentGame, TournamentTeam } from '@/lib/marchMadnessTypes';

export default function EditBracketPage({ params }: any) {
  const bracketId = params.id;

  const [games, setGames] = useState<TournamentGame[]>([]);
  const [teams, setTeams] = useState<TournamentTeam[]>([]);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [tiebreaker, setTiebreaker] = useState<number>(0);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await fetch(`/api/march-madness/brackets/${bracketId}`, {
        cache: 'no-store',
      });

      const data = await res.json();

      const allGames = [
        ...data.openingRoundGames,
        ...Object.values(data.regionalGames).flat(),
      ];

      setGames(allGames);
      setTeams(data.teams);

      const pickMap: Record<number, string> = {};
      data.picks.forEach((p: any) => {
        pickMap[p.game_id] = p.selected_team;
      });
      setPicks(pickMap);

      setTiebreaker(data.bracket.tiebreaker_score ?? 0);

      setLoading(false);
    }

    load();
  }, [bracketId]);

  async function handleSubmit(picks: Record<number, string>, tiebreaker: number) {
    // Save picks
    await fetch(`/api/march-madness/brackets/${bracketId}/picks`, {
      method: 'POST',
      body: JSON.stringify({
        picks: Object.entries(picks).map(([gameId, team]) => ({
          game_id: Number(gameId),
          selected_team: team,
        })),
      }),
    });

    // Submit bracket
    await fetch(`/api/march-madness/brackets/${bracketId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ tiebreaker_score: tiebreaker }),
    });

    window.location.href = `/sports/march-madness/brackets/${bracketId}`;
  }

  if (loading) return <div className="p-6">Loading bracket…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Edit Bracket</h1>

      <InteractiveBracketEditor
        bracketId={bracketId}
        games={games}
        teams={teams}
        initialPicks={picks}
        initialTiebreaker={tiebreaker}
        isLocked={isLocked}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
