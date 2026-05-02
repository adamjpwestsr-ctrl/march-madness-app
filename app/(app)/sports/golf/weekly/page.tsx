"use client";

import Link from "next/link";

export default function GolfWeeklyPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-semibold mb-2">Golf Weekly Challenge</h1>
        <p className="text-slate-400 max-w-2xl">
          Pick golfers for this week’s PGA event. Earn points based on their
          performance and climb the leaderboard.
        </p>
      </section>

      {/* CTA */}
      <section>
        <Link
          href="/sports/golf/weekly/picks"
          className="inline-block px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
        >
          Make Your Picks
        </Link>
      </section>

      {/* Placeholder for golfers */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">This Week’s Field</h2>
        <p className="text-slate-400">Golfer list coming soon.</p>
      </section>

      {/* Scoring */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">Scoring</h2>
        <ul className="text-slate-400 list-disc pl-6 space-y-2">
          <li>Points based on finishing position</li>
          <li>Bonus points for top‑10 finishes</li>
          <li>Leaderboard updates after each round</li>
        </ul>
      </section>
    </div>
  );
}
