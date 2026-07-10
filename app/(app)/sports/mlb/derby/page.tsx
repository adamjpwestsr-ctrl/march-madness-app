"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Lazy-load the modal to avoid hydration issues
const DerbyModal = dynamic(() => import("../components/DerbyModal"), {
  ssr: false,
});


export default function MLBHomeRunDerbyPage() {
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // 1. Fetch event
        const resEvent = await fetch("/api/mlb/derby/event");
        if (!resEvent.ok)
          throw new Error(`Error ${resEvent.status}: ${resEvent.statusText}`);

        const eventData = await resEvent.json();
        const derbyEvent = eventData.event;

        if (!derbyEvent) {
          setEvent(null);
          return;
        }

        // 2. Fetch participants
        const resPlayers = await fetch(
          `/api/mlb/derby/participants?event_id=${derbyEvent.id}`
        );
        if (!resPlayers.ok)
          throw new Error(
            `Error ${resPlayers.status}: ${resPlayers.statusText}`
          );

        const playersData = await resPlayers.json();

        // 3. Merge
        setEvent({
          ...derbyEvent,
          players: playersData.participants ?? [],
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePlayerClick = (playerId: number) => {
    setSelectedPlayer(playerId);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlayer(null);
  };

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
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {event.name || "Home Run Derby"}
            </h2>
            <p className="text-slate-400">
              {new Date(event.event_date).toLocaleDateString()} — {event.status}
            </p>
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
      {showModal && <DerbyModal onClose={closeModal} />}
    </div>
  );
}
