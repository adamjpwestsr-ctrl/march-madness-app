"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GolfWeeklyHistoryPage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/golf/weekly/state");
      const data = await res.json();
      setState(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-slate-400">Loading history…</p>;

  const history = state.history || [];

  return (
    <div className="relative min-h-screen bg-[url('/images/golf-bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 pointer-events-none" />

      <div className="relative backdrop-blur-sm bg-slate-950/70 min-h-screen p-8">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Back Link */}
          <Link
            href="/sports/golf/weekly"
            className="text-emerald-400 hover:text-emerald-300 transition-all duration-300"
          >
            ← Back to Weekly Dashboard
          </Link>

          {/* Header */}
          <section className="opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Your Golf Weekly History
            </h1>
            <p className="text-slate-300 mt-2">
              Review your past picks, points earned, and tournament results.
            </p>
          </section>

          {/* History List */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl p-6 space-y-6 opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
            {history.length === 0 && (
              <p className="text-slate-400">No history available yet.</p>
            )}

	{history.map((h: any) => (
              <div
                key={h.id}
                className="p-4 rounded-lg bg-slate-800/40 border border-slate-700 backdrop-blur-md shadow-lg transition-all duration-300"
              >
                <p className="text-white font-medium text-lg">
                  {h.tournament_name}
                </p>

                <p className="text-slate-400 text-sm mt-1">
                  Your pick:{" "}
                  {h.player_name || (
                    <span className="text-red-400">No selection made</span>
                  )}
                </p>

                <p className="text-slate-400 text-sm">
                  Points earned: {h.points ?? 0}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
