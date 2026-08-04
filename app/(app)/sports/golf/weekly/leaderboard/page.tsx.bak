"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GolfWeeklyFullLeaderboardPage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/golf/weekly/state");
      const data = await res.json();
      setState(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-slate-400">Loading leaderboard…</p>;

  const leaderboard = state.leaderboard || [];
  const userId = state.user_id;

  const filtered = leaderboard.filter((entry: any) =>
    entry.user_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[url('/images/golf-bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 pointer-events-none" />

      <div className="relative backdrop-blur-sm bg-slate-950/70 min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-10">

          <Link
            href="/sports/golf/weekly"
            className="text-emerald-400 hover:text-emerald-300 transition-all duration-300"
          >
            ← Back to Weekly Dashboard
          </Link>

          <section className="opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Full Leaderboard
            </h1>
            <p className="text-slate-300 mt-2">
              Explore the full rankings for this week’s tournament.
            </p>
          </section>

          <div className="opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
            <input
              type="text"
              placeholder="Search players…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 backdrop-blur-md shadow-lg transition-all duration-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl p-6 transition-all duration-300 opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
            <table className="w-full text-left text-slate-300">
              <thead>
                <tr className="text-slate-400 text-sm">
                  <th className="pb-2">Rank</th>
                  <th className="pb-2">Player</th>
                  <th className="pb-2">Points</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((entry: any, i: number) => {
                  const isUser = entry.user_id === userId;

                  return (
                    <tr
                      key={entry.user_id}
                      className={`border-t border-slate-800 transition-all duration-300 ${
                        isUser
                          ? "bg-emerald-600/20 text-emerald-300 font-semibold animate-pulse"
                          : ""
                      }`}
                    >
                      <td className="py-2">{i + 1}</td>

                      <td className="py-2 flex items-center gap-3">
                        {entry.avatar_url ? (
                          <img
                            src={entry.avatar_url}
                            className="w-8 h-8 rounded-full object-cover"
                            alt={entry.user_name}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-700" />
                        )}
                        <span>{entry.user_name}</span>
                      </td>

                      <td>{entry.total_points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p className="text-slate-400 mt-4">No matching players found.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
