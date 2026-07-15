"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

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
  image_url: string | null;
}

interface UserPick {
  id: number;
  user_id: string;
  event_id: number;
  player_id: number;
  predicted_hr_total: number;
}

export default function DerbyCard({
  onOpenPicks,
  onOpenResults,
}: {
  onOpenPicks: () => void;
  onOpenResults: () => void;
}) {
  const [event, setEvent] = useState<DerbyEvent | null>(null);
  const [players, setPlayers] = useState<DerbyPlayer[]>([]);
  const [userPick, setUserPick] = useState<UserPick | null>(null);
  const [loading, setLoading] = useState(true);

  // Flair state
  const [hypeIndex, setHypeIndex] = useState(0);
  const hypeLines = [
    "Moonshots. Madness. Magic.",
    "Crowd roaring. Lights blazing.",
    "One champion. One perfect pick.",
    "You called the Derby like a pro."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHypeIndex((i) => (i + 1) % hypeLines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Winner confetti
  useEffect(() => {
    if (
      event?.status === "results_posted" &&
      userPick &&
      event.winner_player_id &&
      userPick.player_id === event.winner_player_id
    ) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.4 } });
    }
  }, [event, userPick]);

  useEffect(() => {
    (async () => {
      try {
        const resEvent = await fetch("/api/mlb/derby/event");
        const eventJson = await resEvent.json();
        const derbyEvent = eventJson.event;
        setEvent(derbyEvent || null);

        if (!derbyEvent) {
          setLoading(false);
          return;
        }

        const resPlayers = await fetch(
          `/api/mlb/derby/participants?event_id=${derbyEvent.id}`
        );
        const playersJson = await resPlayers.json();
        setPlayers(playersJson.participants || []);

        const resPick = await fetch(
          `/api/mlb/derby/pick?event_id=${derbyEvent.id}`
        );
        const pickJson = await resPick.json();
        setUserPick(pickJson.pick || null);
      } catch (err) {
        console.error("Error loading Derby card:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusBadge = (status: DerbyEvent["status"]) => {
    switch (status) {
      case "open":
        return (
          <span className="px-2 py-1 text-xs rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            Open
          </span>
        );
      case "closed":
        return (
          <span className="px-2 py-1 text-xs rounded-md bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">
            Closed
          </span>
        );
      case "results_posted":
        return (
          <span className="px-2 py-1 text-xs rounded-md bg-sky-600/20 text-sky-400 border border-sky-500/30">
            Final
          </span>
        );
    }
  };

  const selectedPlayer =
    userPick && players.find((p) => p.id === userPick.player_id);

  const winnerPlayer =
    event?.winner_player_id &&
    players.find((p) => p.id === event.winner_player_id);

  const userPickedWinner =
    event?.status === "results_posted" &&
    userPick &&
    event.winner_player_id &&
    userPick.player_id === event.winner_player_id;

  return (
    <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg flex flex-col gap-4 relative overflow-hidden">

      {/* Spotlight Beam */}
      {event?.status === "results_posted" && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-40 bg-gradient-to-b from-emerald-500/20 to-transparent blur-xl"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <h2 className="text-xl font-semibold">Home Run Derby</h2>
        {!loading && event && statusBadge(event.status)}
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading Derby info…</p>
      ) : !event ? (
        <p className="text-slate-400 text-sm">No Derby event created yet.</p>
      ) : (
        <>
          {/* Event Info */}
          <div className="text-slate-300 text-sm relative z-10">
            <p>
              <span className="font-medium">Year:</span> {event.event_year}
            </p>
            <p>
              <span className="font-medium">Event Date:</span>{" "}
              {new Date(event.event_date).toLocaleDateString()}
            </p>
          </div>

          {/* User Pick */}
          {userPick && selectedPlayer && (
            <div className="bg-slate-800/40 border border-white/10 rounded-lg p-4 mt-2 flex items-center gap-4 relative z-10">
              {selectedPlayer.image_url ? (
                <img
                  src={selectedPlayer.image_url}
                  alt={selectedPlayer.player_name}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                  No Image
                </div>
              )}

              <div className="text-sm">
                <p className="font-semibold text-white">
                  {selectedPlayer.player_name}
                </p>
                <p className="text-slate-400">{selectedPlayer.team_name}</p>
                <p className="text-slate-400">
                  Predicted HRs:{" "}
                  <span className="text-emerald-400 font-semibold">
                    {userPick.predicted_hr_total}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {event.status === "results_posted" && winnerPlayer && (
            <div className="bg-slate-800/40 border border-white/10 rounded-lg p-4 mt-2 text-sm relative z-10">
              <p className="text-sky-400 font-semibold">
                Winner: {winnerPlayer.player_name}
              </p>
              <p className="text-slate-300">
                Winning HR Total:{" "}
                <span className="text-sky-400 font-semibold">
                  {event.winning_hr_total}
                </span>
              </p>
            </div>
          )}

          {/* 🔥 HYPE BLOCK */}
          {userPickedWinner && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-900/40 border border-emerald-600/40 text-emerald-300 text-sm font-semibold animate-fadeIn shadow-lg relative overflow-hidden">

              {/* Spotlight Glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full mx-auto mt-10"></div>
              </div>

              🎉 The 2026 MLB Home Run Derby was absolute chaos — moonshots,
              roaring fans, and pure electricity. But when the dust settled,
              one slugger stood above the rest:{" "}
              <span className="text-white font-bold">
                {winnerPlayer?.player_name}
              </span>
              . And one legend in our league called it perfectly:{" "}
              <span className="text-white font-bold">YOU</span> nailed the
              winning pick!

              {/* Trophy */}
              <div className="flex items-center justify-center mt-4 animate-fadeIn">
                <span className="text-4xl animate-trophyPulse">🏆</span>
              </div>

              {/* Oracle Badge */}
              <div className="mt-2 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-black text-xs font-bold shadow-lg text-center mx-auto">
                🔮 Derby Oracle
              </div>

              {/* Rotating Hype Lines */}
              <p className="text-center text-emerald-300 text-sm mt-3 animate-fadeIn">
                {hypeLines[hypeIndex]}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-2 mt-2 relative z-10">
            {event.status === "open" && (
              <button
                onClick={onOpenPicks}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30"
              >
                {userPick ? "Change Pick" : "Make Pick"}
              </button>
            )}

            {event.status === "closed" && (
              <button
                disabled
                className="w-full py-2 rounded-lg bg-slate-800 text-slate-500 cursor-not-allowed font-semibold text-sm"
              >
                Picks Locked
              </button>
            )}

            {event.status === "results_posted" && (
              <button
                onClick={onOpenResults}
                className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-600/30"
              >
                View Results
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
