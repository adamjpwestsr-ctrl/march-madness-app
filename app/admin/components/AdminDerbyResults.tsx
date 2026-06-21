"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface DerbyEvent {
  id: number;
  event_year: number;
  status: "open" | "closed" | "results_posted";
  winner_player_id: number | null;
  winning_hr_total: number | null;
}

interface DerbyPlayer {
  id: number;
  player_name: string;
}

export default function AdminDerbyResults() {
  const [event, setEvent] = useState<DerbyEvent | null>(null);
  const [players, setPlayers] = useState<DerbyPlayer[]>([]);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [winningHR, setWinningHR] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Load event + players
  useEffect(() => {
    const load = async () => {
      const { data: eventData } = await supabase
        .from("mlb_derby_events")
        .select("id, event_year, status, winner_player_id, winning_hr_total")
        .order("event_year", { ascending: false })
        .limit(1)
        .single();

      if (!eventData) {
        setLoading(false);
        return;
      }

      setEvent(eventData);
      setWinnerId(eventData.winner_player_id);
      setWinningHR(eventData.winning_hr_total);

      const { data: playersData } = await supabase
        .from("mlb_derby_players")
        .select("id, player_name")
        .eq("event_id", eventData.id)
        .order("order_index", { ascending: true });

      setPlayers(playersData || []);
      setLoading(false);
    };

    load();
  }, []);

  const handleSubmit = async () => {
    if (!event) return;
    if (!winnerId || !winningHR) {
      showToast("Winner and HR total required.");
      return;
    }

    const { error } = await supabase
      .from("mlb_derby_events")
      .update({
        winner_player_id: winnerId,
        winning_hr_total: winningHR,
        status: "results_posted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id);

    if (error) {
      showToast("Error posting results.");
      return;
    }

    setEvent({
      ...event,
      winner_player_id: winnerId,
      winning_hr_total: winningHR,
      status: "results_posted",
    });

    showToast("Results posted successfully.");
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-900 rounded-xl border border-white/10 text-white">
        Loading results section...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6 bg-slate-900 rounded-xl border border-white/10 text-white">
        No Derby event found. Create an event first.
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-white/10 text-white">
      <h2 className="text-xl font-semibold mb-4">Post Derby Results</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Winner */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Winner</label>
          <select
            value={winnerId ?? ""}
            onChange={(e) => setWinnerId(Number(e.target.value))}
            className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
          >
            <option value="">Select Winner</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.player_name}
              </option>
            ))}
          </select>
        </div>

        {/* Winning HR Total */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Winning HR Total</label>
          <input
            type="number"
            value={winningHR ?? ""}
            onChange={(e) => setWinningHR(Number(e.target.value))}
            className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white"
            placeholder="Example: 47"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-md text-sm font-semibold"
      >
        Post Results
      </button>

      {event.status === "results_posted" && (
        <p className="mt-3 text-xs text-slate-400">
          Results already posted for {event.event_year}.
        </p>
      )}

      {toast && (
        <div className="mt-4 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
