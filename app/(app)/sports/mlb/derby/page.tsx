"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function MLBHomeRunDerbyPage() {
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mlb/derby/event");
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setEvent(data.event ?? null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

          <div>
            <h3 className="text-lg font-semibold mb-2">Participants</h3>
            {event.players?.length ? (
              <ul className="space-y-2">
                {event.players.map((p: any) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between bg-slate-800/40 px-3 py-2 rounded-lg"
                  >
                    <span>{p.name}</span>
                    <span className="text-slate-400 text-sm">
                      {p.team_abbr}
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
    </div>
  );
}
