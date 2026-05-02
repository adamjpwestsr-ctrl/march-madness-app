"use client";

import Link from "next/link";

export default function NFLWeeklyPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-semibold mb-2">NFL Weekly Picks</h1>
        <p className="text-slate-400 max-w-2xl">
          Predict winners for this week’s NFL matchups. Earn points for each
          correct pick and climb the leaderboard.
        </p>
      </section>

      {/* CTA */}
      <section>
        <Link
          href="/sports/nfl/weekly/picks"
          className="inline-block px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        >
          Make Your Picks
        </Link>
      </section>

      {/* Placeholder for matchups */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">This Week’s Matchups</h2>
        <p className="text-slate-400">Matchup list coming soon.</p>
      </section>

      {/* Scoring */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">Scoring</h2>
        <ul className="text-slate-400 list-disc pl-6 space-y-2">
          <li>1 point for each correct pick</li>
          <li>Bonus points for perfect weeks</li>
          <li>Weekly leaderboard updates automatically</li>
        </ul>
      </section>
    </div>
  );
}
