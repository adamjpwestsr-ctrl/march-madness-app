"use client";

import { useState } from "react";
import PlayerCard from "./PlayerCard";
import { useDraftQueue } from "@/hooks/useDraftQueue";

export interface Player {
  id: number;
  espn_id: number;
  name: string;
  team: string | null;
  position: string | null;
  bye_week?: number | null;

  projected_points: number;
  last_week_points: number;
  season_points: number;

  snap_pct: number;
  target_share: number;
  redzone_usage: number;

  defense_rank: number;
  matchup_difficulty: "easy" | "medium" | "hard";

  headshot_url: string | null;
  opponent_team: string | null;
  is_home: boolean | null;
  kickoff_time: string | null;

  badge_tier: string | null;
  badge_role: string | null;
  badge_archetype: string | null;
}

interface PlayersPageClientProps {
  initialPlayers: Player[];
}

export default function PlayersPageClient({ initialPlayers }: PlayersPageClientProps) {
  const [search, setSearch] = useState("");

  const { queue, addToQueue, removeFromQueue } = useDraftQueue();

  const filtered = initialPlayers.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white">NFL Players</h1>

      <input
        className="w-full p-2 rounded bg-slate-800 text-white"
        placeholder="Search players..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onAdd={() => addToQueue(player.id)}
          />
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-white mb-4">My Draft Queue</h2>

        {queue.length === 0 ? (
          <p className="text-slate-400">No players queued yet.</p>
        ) : (
          <ul className="space-y-2">
            {queue.map((q) => {
              const player = initialPlayers.find((p) => p.id === q.player_id);

              return (
                <li
                  key={q.player_id}
                  className="flex justify-between items-center bg-slate-800 p-3 rounded"
                >
                  <span className="text-white">
                    {player?.name || "Unknown Player"}
                  </span>

                  <button
                    className="text-red-400 hover:text-red-600"
                    onClick={() => removeFromQueue(q.player_id)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
