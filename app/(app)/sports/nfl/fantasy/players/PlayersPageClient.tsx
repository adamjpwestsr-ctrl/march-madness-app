"use client";

import { useState } from "react";
import PlayerCard from "./PlayerCard";
import { useDraftQueue } from "@/hooks/useDraftQueue";

export default function PlayersPageClient({ initialPlayers }) {
  const [search, setSearch] = useState("");

  // 🔥 Persistent queue from Supabase
  const { queue, addToQueue, removeFromQueue } = useDraftQueue();

  // Local search filter
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

      {/* Player Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onAdd={() => addToQueue(player.id)}
          />
        ))}
      </div>

      {/* Queue Sidebar */}
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
