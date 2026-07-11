"use client";

import { useEffect, useState } from "react";
import DerbyParticipantsManager from "@/app/(app)/sports/mlb/components/DerbyParticipantsManager";

interface DerbyEvent {
  id: number;
  event_year: number;
  event_date: string;
  status: "open" | "closed" | "results_posted";
  winner_player_id?: number | null;
  winning_hr_total?: number | null;
}

interface DerbyPlayer {
  id: number;
  player_name: string;
  team_name: string;
  hr_count: number;
  image_url: string | null;
}

export default function AdminDerbyPage() {
  const [event, setEvent] = useState<DerbyEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Event setup fields
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [date, setDate] = useState<string>("");
  const [status, setStatus] = useState<DerbyEvent["status"]>("open");

  // Results posting fields
  const [players, setPlayers] = useState<DerbyPlayer[]>([]);
  const [winnerPlayerId, setWinnerPlayerId] = useState<number | null>(null);
  const [winningHRTotal, setWinningHRTotal] = useState<number | null>(null);
  const [savingResults, setSavingResults] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Load event + players + results
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mlb/derby/event");
        const json = await res.json();
        const derbyEvent = json.event;
        setEvent(derbyEvent || null);

        if (derbyEvent) {
          // Load participants
          const playersRes = await fetch(
            `/api/mlb/derby/participants?event_id=${derbyEvent.id}`
          );
          const playersJson = await playersRes.json();
          setPlayers(playersJson.participants || []);

          // Pre-fill results if already posted
          if (derbyEvent.winner_player_id) {
            setWinnerPlayerId(derbyEvent.winner_player_id);
          }
          if (derbyEvent.winning_hr_total) {
            setWinningHRTotal(derbyEvent.winning_hr_total);
          }
        }
      } catch (err) {
        console.error("Error loading Derby event:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const createEvent = async () => {
    try {
      const res = await fetch("/api/mlb/derby/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_year: year, event_date: date, status }),
      });
      const json = await res.json();
      setEvent(json.event);
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  const saveResults = async () => {
    if (!event) return;
    if (!winnerPlayerId || !winningHRTotal) {
      showToast("Select a winner and enter winning HR total.");
      return;
    }

    setSavingResults(true);

    try {
      const res = await fetch("/api/mlb/derby/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          winner_player_id: winnerPlayerId,
          winning_hr_total: winningHRTotal,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save results");

      setEvent(json.event);
      showToast("Results posted!");
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setSavingResults(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-10 space-y-8">
      <h1 className="text-3xl font-bold mb-2">MLB Home Run Derby — Admin</h1>
      <p className="text-slate-400 mb-8">
        Manage the yearly Derby event, participants, and results.
      </p>

      {/* Event Setup */}
      <section className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg">
        <details open className="p-6">
          <summary className="cursor-pointer text-xl font-semibold text-white mb-4 flex items-center justify-between">
            <span>Event Setup</span>
            <span className="text-sm text-slate-400">
              {event ? "Event Loaded" : "No Event"}
            </span>
          </summary>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Event Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as DerbyEvent["status"])
                  }
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-200"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="results_posted">Results Posted</option>
                </select>
              </div>
            </div>

            <button
              onClick={createEvent}
              className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold hover:opacity-90 transition"
            >
              Create Event
            </button>
          </div>
        </details>
      </section>

      {/* Participants */}
      <section className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg">
        <details open className="p-6">
          <summary className="cursor-pointer text-xl font-semibold text-white mb-4">
            Participants (8 Players)
          </summary>

          {!event ? (
            <p className="text-slate-400 text-sm">
              No Derby event found. Create an event first.
            </p>
          ) : (
            <DerbyParticipantsManager eventId={event.id} />
          )}
        </details>
      </section>

      {/* Results Posting */}
      <section className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg">
        <details open className="p-6">
          <summary className="cursor-pointer text-xl font-semibold text-white mb-4">
            Results Posting
          </summary>

          {loading ? (
            <p className="text-slate-400 text-sm">Loading results…</p>
          ) : !event ? (
            <p className="text-slate-400 text-sm">
              No Derby event found. Create an event first.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Winner Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Select Winner</h3>

                {players.length === 0 ? (
                  <p className="text-slate-400 text-sm">
                    No participants added yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {players.map((p) => {
                      const isWinner = winnerPlayerId === p.id;

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setWinnerPlayerId(p.id)}
                          className={`text-left rounded-lg border p-3 bg-slate-800/60 hover:bg-slate-700 transition ${
                            isWinner
                              ? "border-emerald-500 shadow-lg shadow-emerald-600/30"
                              : "border-slate-700"
                          }`}
                        >
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.player_name}
                              className="w-full h-32 object-cover rounded-md mb-2"
                            />
                          ) : (
                            <div className="w-full h-32 bg-slate-700 rounded-md mb-2 flex items-center justify-center text-xs text-slate-400">
                              No image
                            </div>
                          )}

                          <p className="font-semibold text-sm">
                            {p.player_name}
                          </p>
                          <p className="text-slate-400 text-xs">{p.team_name}</p>
                          <p className="text-slate-400 text-xs">
                            HRs: {p.hr_count}
                          </p>

                          {isWinner && (
                            <p className="mt-1 text-emerald-400 text-xs font-semibold">
                              Selected Winner
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Winning HR Total */}
              <div>
                <label className="text-sm text-slate-300">
                  Winning HR Total
                </label>
                <input
                  type="number"
                  value={winningHRTotal ?? ""}
                  onChange={(e) => setWinningHRTotal(Number(e.target.value))}
                  className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
                  placeholder="Example: 47"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={saveResults}
                disabled={savingResults}
                className={`mt-2 w-full py-3 rounded-lg font-semibold text-sm transition-all ${
                  savingResults
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                }`}
              >
                {savingResults ? "Saving results…" : "Post Results"}
              </button>
            </div>
          )}
        </details>
      </section>

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
