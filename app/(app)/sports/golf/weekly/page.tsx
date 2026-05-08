"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function GolfWeeklyLandingPage() {
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

  if (loading) return <p className="text-slate-400">Loading…</p>;

  const tournament = state.tournament;
  const leaderboard = state.leaderboard || [];

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-semibold mb-2">Golf Weekly Challenge</h1>
        <p className="text-slate-400 max-w-2xl">
          Pick a golfer for this week’s PGA event. Earn points based on their
          performance and climb the leaderboard.
        </p>
      </section>

      <section>
        <Link
          href="/sports/golf/weekly/picks"
          className="inline-block px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        >
          Make Your Picks
        </Link>
      </section>

      {tournament && (
        <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
          <h2 className="text-xl font-semibold mb-4">This Week’s Tournament</h2>
          <p className="text-slate-300">
            <strong>{tournament.name}</strong> — {tournament.course || "TBD"} (
            {new Date(tournament.start_date).toLocaleDateString()} →{" "}
            {new Date(tournament.end_date).toLocaleDateString()})
          </p>
        </section>
      )}

      {leaderboard.length > 0 && (
        <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
          <h2 className="text-xl font-semibold mb-4">Leaderboard Preview</h2>
          <ul className="space-y-2 text-slate-400">
            {leaderboard.slice(0, 5).map((entry: any, i: number) => (
              <li key={i}>
                <span className="text-white font-medium">{entry.user_name}</span>{" "}
                — {entry.total_points} pts
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
