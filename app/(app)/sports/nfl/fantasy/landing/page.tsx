"use client";

import Link from "next/link";
import { Goal, Users, Trophy } from "lucide-react";

export default function FantasyLandingPage() {
  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Hero */}
      <section className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-white">NFL Fantasy</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          Draft players, compare stats, and compete for the top spot.
          Your season starts here.
        </p>
      </section>

      {/* Quick Actions */}
      <section className="grid gap-6 md:grid-cols-3">
        <ActionCard
          href="/sports/nfl/fantasy/draft"
          icon={<Goal size={28} />}
          title="Enter Draft Room"
          desc="Manage your roster and track weekly performance."
          color="red"
        />
        <ActionCard
          href="/sports/nfl/fantasy/compare"
          icon={<Users size={28} />}
          title="Compare Players"
          desc="Analyze players side‑by‑side with advanced metrics."
          color="emerald"
        />
        <ActionCard
          href="/sports/nfl/fantasy/leaderboard"
          icon={<Trophy size={28} />}
          title="Leaderboard"
          desc="See how your roster stacks up against others."
          color="yellow"
        />
      </section>

      {/* Overview */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40 text-center space-y-3">
        <h2 className="text-xl font-semibold text-white">Season Overview</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Draft up to 15 players across all positions. Weekly scoring updates,
          badges, matchup difficulty, and trend charts help you make smarter decisions.
        </p>
        <Link
          href="/sports/nfl/fantasy/draft"
          className="inline-block mt-4 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition"
        >
          Start Drafting
        </Link>
      </section>
    </div>
  );
}

function ActionCard({ href, icon, title, desc, color }) {
  const colorMap = {
    red: "group-hover:border-red-400/40 group-hover:bg-red-500/10",
    emerald: "group-hover:border-emerald-400/40 group-hover:bg-emerald-500/10",
    yellow: "group-hover:border-yellow-400/40 group-hover:bg-yellow-500/10",
  };

  return (
    <Link
      href={href}
      className={`
        group rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur p-5
        shadow-md hover:shadow-lg transition-all duration-300 flex flex-col gap-3
        active:scale-[0.97] active:shadow-sm
        ${colorMap[color]}
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-lg bg-slate-800/60 flex items-center justify-center
          text-slate-200 transition active:scale-95
          ${colorMap[color]}
        `}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-slate-400 text-sm">{desc}</p>
      </div>
    </Link>
  );
}
