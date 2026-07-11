"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy-load modal
const DerbyModal = dynamic(() => import("../components/DerbyModal"), {
  ssr: false,
});

export default function MLBHomeRunDerbyPage() {
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  const [userPick, setUserPick] = useState<any | null>(null);

  // Load event + participants + user pick
  const loadDerbyData = async () => {
    try {
      // 1️⃣ Load event
      const resEvent = await fetch("/api/mlb/derby/event");
      const eventJson = await resEvent.json();
      const derbyEvent = eventJson.event;

      if (!derbyEvent) {
        setEvent(null);
        return;
      }

      // 2️⃣ Load participants
      const resPlayers = await fetch(
        `/api/mlb/derby/participants?event_id=${derbyEvent.id}`
      );
      const playersJson = await resPlayers.json();

      // 3️⃣ Load user pick (IMPORTANT: event_id required)
      const resPick = await fetch(
        `/api/mlb/derby/pick?event_id=${derbyEvent.id}`
      );
      const pickJson = await resPick.json();

      setEvent({
        ...derbyEvent,
        players: playersJson.participants ?? [],
      });

      setUserPick(pickJson.pick || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDerbyData();
  }, []);

  const handlePlayerClick = (playerId: number) => {
    setSelectedPlayer(playerId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlayer(null);

    // Reload pick after modal save
    loadDerbyData();
  };

  const selectedPlayerObj =
    userPick &&
    event?.players?.find((p: any) => p.id === userPick.player_id);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">
        MLB Home Run Derby
      </h1>

      {loading ? (
        <p className="text-slate-400">Loading event data…</p>
      ) : error ? (
        <div className="text-red-400">
          <p>Failed to load event data.</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      ) : !event ? (
        <div className="rounded-xl bg-slate-900/70 border border-white/10 p-6 shadow-lg">
          <p className="text-slate-400 mb-4">
            No Derby event found. Create one to get started.
          </p>
          <Link
            href="/admin/mlb/derby"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            Create Event
          </Link>
        </div>
      ) : (
        <div className="rounded-xl bg-slate-900/70 border border-white/10 p-6 shadow-lg space-y-6">
          {/* Event Header */}
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {event.name || "Home Run Derby"}
            </h2>
            <p className="text-slate-400">
              {new Date(event.event_date).toLocaleDateString()} — {event.status}
            </p>
          </div>

          {/* User Pick */}
          <div className="bg-slate-800/40 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Your Pick</h3>

            {!userPick ? (
              <p className="text-slate-400 text-sm">
                You haven’t made a pick yet.
              </p>
            ) : !selectedPlayerObj ? (
              <p className="text-slate-400 text-sm">
                Your selected player could not be found.
              </p>
            ) : (
              <div className="flex items-center gap-4">
                {selectedPlayerObj.image_url ? (
                  <img
                    src={selectedPlayerObj.image_url}
                    alt={selectedPlayerObj.player_name}
                    className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                    No Image
                  </div>
                )}

                <div className="text-sm">
                  <p className="font-semibold text-white">
                    {selectedPlayerObj.player_name}
                  </p>
                  <p className="text-slate-400">{selectedPlayerObj.team_name}</p>
                  <p className="text-slate-400">
                    Predicted HRs:{" "}
                    <span className="text-emerald-400 font-semibold">
                      {userPick.predicted_hr_total}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Participants */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Participants</h3>

            {event.players?.length ? (
              <ul className="space-y-3">
                {event.players.map((p: any) => (
                  <li
                    key={p.id}
                    onClick={() => handlePlayerClick(p.id)}
                    className="flex items-center justify-between bg-slate-800/40 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.player_name}
                          className="w-12 h-12 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                          No Image
                        </div>
                      )}

                      <div>
                        <p className="font-medium">{p.player_name}</p>
                        <p className="text-slate-400 text-sm">{p.team_name}</p>
                      </div>
                    </div>

                    <span className="text-emerald-400 font-semibold text-sm">
                      {p.hr_count} HR
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">
                No participants added yet.
              </p>
            )}
          </div>

          {/* Results */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Results</h3>
            {event.results ? (
              <p className="text-emerald-400 font-medium">
                Winner: {event.results.winner_name} ({event.results.total_hr} HR)
              </p>
            ) : (
              <p className="text-slate-500 text-sm">
                Results not posted yet.
              </p>
            )}
          </div>

          <Link
            href="/sports/mlb"
            className="inline-block text-slate-400 hover:text-white text-sm mt-4"
          >
            ← Back to MLB Challenge
          </Link>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <DerbyModal
          onClose={closeModal}
        />
      )}
    </div>
  );
}
