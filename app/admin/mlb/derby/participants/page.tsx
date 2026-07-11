"use client";

import { useEffect, useState } from "react";

interface DerbyEvent {
  id: number;
  name: string;
  event_year: number;
}

interface DerbyPlayer {
  id: number;
  player_name: string;
  team_name: string;
  hr_count: number;
  image_url: string | null;
}

export default function AdminDerbyParticipantsPage() {
  const [event, setEvent] = useState<DerbyEvent | null>(null);
  const [players, setPlayers] = useState<DerbyPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newPlayerName, setNewPlayerName] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newHRCount, setNewHRCount] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    (async () => {
      try {
        const eventRes = await fetch("/api/mlb/derby/event");
        const eventJson = await eventRes.json();
        const derbyEvent = eventJson.event;
        setEvent(derbyEvent || null);

        if (!derbyEvent) {
          setLoading(false);
          return;
        }

        const playersRes = await fetch(
          `/api/mlb/derby/participants?event_id=${derbyEvent.id}`
        );
        const playersJson = await playersRes.json();
        setPlayers(playersJson.participants || []);
      } catch (err) {
        console.error("Admin Derby participants load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddPlayer = async () => {
    if (!event) return;
    if (!newPlayerName || !newTeamName || newHRCount === null) {
      showToast("Fill in player name, team, and HR count.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/mlb/derby/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          player_name: newPlayerName,
          team_name: newTeamName,
          hr_count: newHRCount,
          image_url: newImageUrl || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to add participant");

      setPlayers((prev) => [...prev, json.player]);
      setNewPlayerName("");
      setNewTeamName("");
      setNewHRCount(null);
      setNewImageUrl("");
      showToast("Participant added!");
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Admin — Derby Participants
      </h1>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading participants…</p>
      ) : !event ? (
        <p className="text-slate-400 text-sm">
          No Derby event found. Create one first.
        </p>
      ) : (
        <div className="rounded-xl bg-slate-900/70 border border-white/10 p-6 shadow-lg space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">
              {event.name || "Home Run Derby"}
            </h2>
            <p className="text-slate-400 text-sm">
              Event Year: {event.event_year}
            </p>
          </div>

          {/* Existing participants */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Current Participants</h3>
            {players.length === 0 ? (
              <p className="text-slate-400 text-sm">
                No participants added yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-slate-700 bg-slate-800/60 p-3"
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.player_name}
                        className="w-full h-28 object-cover rounded-md mb-2"
                      />
                    ) : (
                      <div className="w-full h-28 bg-slate-700 rounded-md mb-2 flex items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                    <p className="font-semibold text-sm">{p.player_name}</p>
                    <p className="text-slate-400 text-xs">{p.team_name}</p>
                    <p className="text-slate-400 text-xs">
                      HRs: {p.hr_count}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add participant */}
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-lg font-semibold mb-2">Add Participant</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300">Player Name</label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Team Name</label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">HR Count</label>
                <input
                  type="number"
                  value={newHRCount ?? ""}
                  onChange={(e) => setNewHRCount(Number(e.target.value))}
                  className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300">Image URL</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  placeholder="Optional"
                />
              </div>
            </div>

            <button
              onClick={handleAddPlayer}
              disabled={saving}
              className={`mt-3 w-full py-3 rounded-lg font-semibold text-sm transition-all ${
                saving
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
              }`}
            >
              {saving ? "Adding..." : "Add Participant"}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-lg bg-slate-900/90 border border-white/10 shadow-xl text-sm text-white">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
