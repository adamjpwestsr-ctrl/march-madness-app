"use client";

import { useState } from "react";
import LeaderboardCard from "@/app/components/LeaderboardCard";

const tabs = ["Global", "Weekly", "Friends"];

const sampleData = [
  { rank: 1, name: "Adam", points: 1280 },
  { rank: 2, name: "Jordan", points: 1210 },
  { rank: 3, name: "Chris", points: 1195 },
  { rank: 4, name: "Taylor", points: 1100 },
  { rank: 5, name: "Morgan", points: 1080 },
];

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState("Global");

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <section>
        <h1 className="text-3xl font-semibold mb-2">Leaderboards</h1>
        <p className="text-slate-400">
          See how you stack up against the competition.
        </p>
      </section>

      {/* Tabs */}
      <section className="flex gap-3 border-b border-slate-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              activeTab === tab
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 border border-slate-800 hover:bg-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </section>

      {/* Summary Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <LeaderboardCard title="Your Rank" value="#12" />
        <LeaderboardCard title="Total Points" value="980" />
        <LeaderboardCard title="Top 1% Score" value="1,240" />
      </section>

      {/* Leaderboard Table */}
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow">
        <h2 className="text-xl font-semibold mb-4">{activeTab} Rankings</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-800">
                <th className="py-2">Rank</th>
                <th className="py-2">Player</th>
                <th className="py-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.map((row) => (
                <tr
                  key={row.rank}
                  className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                >
                  <td className="py-2">{row.rank}</td>
                  <td className="py-2">{row.name}</td>
                  <td className="py-2">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
