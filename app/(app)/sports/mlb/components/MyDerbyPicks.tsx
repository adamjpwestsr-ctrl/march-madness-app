"use client";

import { useEffect, useState } from "react";

interface DerbyEvent {
  id: number;
  status: "open" | "closed" | "results_posted";
  winner_player_id: number | null;
  winning_hr_total: number | null;
}

interface DerbyPlayer {
  id: number;
  player_name: string;
  team_name: string;
  image_url: string;
}

interface UserPick {
  id: number;
  player_id: number;
  predicted_hr_total: number;
}

export default function MyDerbyPicks() {
  const [event, setEvent] = useState<DerbyEvent | null>(null);
  const [players, setPlayers] = useState<DerbyPlayer[]>([]);
  const [pick, setPick] = useState<UserPick | null>(null);
  const [loading, setLoading] = useState(true);

  // Load event, players, and user pick
  useEffect(() => {
    (async () => {
      try {
        const eventRes = await fetch("/api/mlb/derby/event");
        const eventJson = await eventRes.json();
        setEvent(eventJson.event || null);

        if (eventJson.event) {
          const playersRes = await fetch("/api/mlb/derby/players");
          const playersJson = await playersRes.json();
          setPlayers(playersJson.players || []);

          const pickRes = await fetch("/api/mlb/derby/pick");
          const pickJson = await pickRes.json();
          setPick(pickJson.pick || null);
        }
      } catch (err) {
        console.error("Error loading My Derby Picks:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStatusBadge = () => {
    if (!event) return null;

    if (event.status === "open") {
      return (
        <span className="px-2 py-1 text-xs rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
          Pending
        </span>
      );
    }

    if (event.status === "closed") {
      return (
        <span className="px-2 py-1 text-xs rounded-md bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">
          Locked
        </span>
      );
    }

    if (event.status === "results_posted") {
      return (
        <span className="px-2 py-1 text-xs rounded-md bg-sky-600/20 text-sky-400 border border-sky-500/30">
          Final
        </span>
      );
    }
  };

  const selectedPlayer =
    pick && players.find((p) => p.id === pick.player_id);

  return (
    <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Derby Pick</h2>
        {!loading && event && getStatusBadge()}
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading your pick…</p>
      ) : !event ? (
        <p className="text-slate-400 text-sm">No Derby event available.</p>
      ) : !pick ? (
        <p className="text-slate-400 text-sm">
          You haven’t made a Derby pick yet.
        </p>
      ) : !selectedPlayer ? (
        <p className="text-slate-400 text-sm">
          Your selected player could not be found.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Player Info */}
          <div className="flex items-center gap-4">
            <img
              src={selectedPlayer.image_url}
              alt={selectedPlayer.player_name}
              className="w-20 h-20 rounded-lg object-cover border border-slate-700"
            />

            <div className="text-sm">
              <p className="font-semibold text-white">
                {selectedPlayer.player_name}
              </p>
              <p className="text-slate-400">{selectedPlayer.team_name}</p>
              <p className="text-slate-400">
                Predicted HRs:{" "}
                <span className="text-emerald-400 font-semibold">
                  {pick.predicted_hr_total}
                </span>
              </p>
            </div>
          </div>

          {/* Final Result (if posted) */}
          {event.status === "results_posted" && (
            <div className="text-sm text-slate-300 border-t border-slate-800 pt-3">
              <p>
                Winner:{" "}
                <span className="font-semibold text-sky-400">
                  {
                    players.find((p) => p.id === event.winner_player_id)
                      ?.player_name
                  }
                </span>
              </p>
              <p>
                Winning HR Total:{" "}
                <span className="font-semibold text-sky-400">
                  {event.winning_hr_total}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
