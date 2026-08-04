"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default async async function NcaafRankingsPanel() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  async function handleLoadRankings() {
    try {
      setStatus("Loading AP Top 25...");
      const res = await fetch("/api/ncaaf/sync/rankings");
      const data = await res.json();

      if (!data.success) {
        console.error(data.error);
        setStatus("Error loading rankings");
        return;
      }

      setRankings(data.rankings || []);
      setStatus("Rankings loaded.");
    } catch (err) {
      console.error(err);
      setStatus("Unexpected error loading rankings");
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Star size={18} className="text-sky-400" />
        AP Top 25 Rankings
      </h2>

      <p className="text-slate-400 text-sm">
        View the current AP Top 25 rankings for NCAA Football.
      </p>

      <button
        onClick={handleLoadRankings}
        className="px-4 py-2 rounded bg-sky-500 hover:bg-sky-400 text-sm font-semibold text-slate-900"
      >
        Load Rankings
      </button>

      {status && <p className="text-slate-300 text-sm mt-2">{status}</p>}

      {rankings.length > 0 && (
        <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {rankings.map((r: any) => (
            <div
              key={r.current}
              className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 flex items-center gap-2"
            >
              <span className="text-sky-400 font-semibold">#{r.current}</span>
              <span>{r.team?.displayName ?? r.team?.name}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
