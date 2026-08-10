// components/Fantasy/PlayerList.tsx
"use client";

import { useEffect, useState } from "react";

export default function PlayerList({
  onSelect,
}: {
  onSelect: (player: any) => void;
}) {
  const [players, setPlayers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadPlayers() {
      const res = await fetch("/api/fantasy/players");
      const json = await res.json();
      setPlayers(json.players || []);
    }
    loadPlayers();
  }, []);

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
      <input
        className="w-full p-2 mb-4 rounded bg-gray-800 text-white"
        placeholder="Search players..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex justify-between items-center p-3 bg-gray-800 rounded"
          >
            <div>
              <div className="text-white font-semibold">{p.name}</div>
              <div className="text-gray-400 text-sm">
                {p.team} • {p.position}
              </div>
            </div>

            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => onSelect(p)}
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
