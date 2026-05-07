"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GolfWeeklyPicksPage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadState() {
      try {
        const res = await fetch("/api/golf/weekly/state");
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();
        setState(json);
      } catch (err: any) {
        console.error(err);
        setError("Unable to load picks data.");
      } finally {
        setLoading(false);
      }
    }
    loadState();
  }, []);

  if (loading) return <p className="text-slate-400">Loading picks…</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  const { tournament, golfers, pick } = state || {};

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-semibold mb-2">Make Your Picks</h1>
        {tournament ? (
          <p className="text-slate-400">
            {tournament.name} — {tournament.course || "TBD"} (
            {new Date(tournament.start_date).toLocaleDateString()} →{" "}
            {new Date(tournament.end_date).toLocaleDateString()})
          </p>
        ) : (
          <p className="text-slate-400">No active tournament found.</p>
        )}
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {golfers?.map((g: any) => (
          <button
            key={g.id}
            className={`border border-slate-700 rounded-lg p-3 hover:bg-slate-800/40 ${
              pick?.golfer_id === g.id ? "bg-emerald-700 text-white" : "text-slate-300"
            }`}
          >
            {g.name} {g.country && <span className="text-slate-500">({g.country})</span>}
          </button>
        ))}
      </section>
    </div>
  );
}
