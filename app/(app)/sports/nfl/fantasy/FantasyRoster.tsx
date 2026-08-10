"use client";

import { useEffect, useState } from "react";

export default function FantasyRoster({ userId }: { userId: number }) {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<any[]>([]);
  const [roster, setRoster] = useState<any>(null);
  const [rosterPlayers, setRosterPlayers] = useState<any[]>([]);
  const [season] = useState(new Date().getFullYear());

  // Load roster + players
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Load roster
      const rosterRes = await fetch(`/api/fantasy/roster/get?userId=${userId}&season=${season}`);
      let rosterData = await rosterRes.json();

      // If no roster exists, create one
      if (!rosterData?.id) {
        const createRes = await fetch("/api/fantasy/roster/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, season }),
        });
        rosterData = await createRes.json();
      }

      setRoster(rosterData);

      // Load all NFL players
      const playersRes = await fetch("/api/fantasy/players");
      const playersData = await playersRes.json();
      setPlayers(playersData);

      // Load roster players
      const rosterPlayersRes = await fetch(`/api/fantasy/roster/players?rosterId=${rosterData.id}`);
      const rpData = await rosterPlayersRes.json();
      setRosterPlayers(rpData);

      setLoading(false);
    };

    loadData();
  }, [userId, season]);

  const addPlayer = async (playerId: number) => {
    await fetch("/api/fantasy/roster/addPlayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rosterId: roster.id, playerId }),
    });

    // Refresh roster players
    const res = await fetch(`/api/fantasy/roster/players?rosterId=${roster.id}`);
    setRosterPlayers(await res.json());
  };

  const removePlayer = async (playerId: number) => {
    await fetch("/api/fantasy/roster/removePlayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rosterId: roster.id, playerId }),
    });

    const res = await fetch(`/api/fantasy/roster/players?rosterId=${roster.id}`);
    setRosterPlayers(await res.json());
  };

  if (loading) {
    return <p className="text-slate-400">Loading roster...</p>;
  }

  return (
    <div className="space-y-8">

      {/* ROSTER HEADER */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Roster</h2>
        <p className="text-slate-400 text-sm">
          Season {season} • {rosterPlayers.length} players selected
        </p>
      </div>

      {/* ROSTER LIST */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
        {rosterPlayers.length === 0 ? (
          <p className="text-slate-500">No players added yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {rosterPlayers.map((p) => (
              <div
                key={p.id}
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg flex flex-col"
              >
                <p className="font-medium text-white">{p.name}</p>
                <p className="text-slate-400 text-sm">{p.team} • {p.position}</p>

                <button
                  onClick={() => removePlayer(p.id)}
                  className="mt-3 bg-red-600 hover:bg-red-500 text-sm px-3 py-1 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PLAYER POOL */}
      <div>
        <h2 className="text-xl font-bold mb-3">Available Players</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {players.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex flex-col"
            >
              <p className="font-medium text-white">{p.name}</p>
              <p className="text-slate-400 text-sm">{p.team} • {p.position}</p>

              <button
                onClick={() => addPlayer(p.id)}
                className="mt-3 bg-emerald-600 hover:bg-emerald-500 text-sm px-3 py-1 rounded-lg"
              >
                Add to Roster
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
