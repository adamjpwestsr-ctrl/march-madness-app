"use client";

import { useEffect, useState } from "react";

export default function Leaderboard() {
  const [filter, setFilter] = useState<"all" | "daily" | "weekly">("all");
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`/api/trivia/leaderboard?type=${filter}`, {
          cache: "no-store",
        });

        const data = await res.json();
        if (!active) return;

        if (data.error) {
          setError(data.error);
          setRounds([]);
          setLoading(false);
          return;
        }

        setRounds(data.rounds ?? []);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (active) {
          setError("Failed to load leaderboard");
          setRounds([]);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [filter]);

  if (loading) {
    return (
      <div className="text-slate-400 p-6">
        Loading leaderboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-slate-400">
        Leaderboard unavailable — {error}.
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: 24,
        padding: 16,
        borderRadius: 16,
        background: "rgba(15,23,42,0.95)",
        border: "1px solid #1f2937",
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
        Leaderboard
      </h2>

      {/* FILTER BUTTONS */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded text-xs ${
            filter === "all" ? "bg-blue-600" : "bg-slate-700"
          }`}
        >
          All Time
        </button>

        <button
          onClick={() => setFilter("daily")}
          className={`px-3 py-1 rounded text-xs ${
            filter === "daily" ? "bg-blue-600" : "bg-slate-700"
          }`}
        >
          Daily
        </button>

        <button
          onClick={() => setFilter("weekly")}
          className={`px-3 py-1 rounded text-xs ${
            filter === "weekly" ? "bg-blue-600" : "bg-slate-700"
          }`}
        >
          Weekly
        </button>
      </div>

      {/* LEADERBOARD LIST */}
      <ul className="space-y-4">
        {rounds.map((r) => (
          <li
            key={r.id}
            className="p-4 rounded-lg bg-slate-800/40 border border-slate-700"
          >
            <div className="flex justify-between items-center">
              {/* LEFT SIDE: RANK + ARROWS + BADGE + NAME */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">#{r.rank}</span>

                {r.delta > 0 && (
                  <span className="text-green-400 text-sm">▲ {r.delta}</span>
                )}
                {r.delta < 0 && (
                  <span className="text-red-400 text-sm">
                    ▼ {Math.abs(r.delta)}
                  </span>
                )}
                {r.delta === 0 && (
                  <span className="text-slate-500 text-sm">➖</span>
                )}

                <span className="ml-2 px-2 py-1 rounded bg-slate-700 text-xs">
                  {r.badge}
                </span>

                <span className="font-bold text-lg ml-2">
                  {r.display_name}
                </span>
              </div>

              {/* RIGHT SIDE: SCORE */}
              <span className="text-blue-400 font-bold">{r.score} pts</span>
            </div>

            {/* DETAILS */}
            <div className="text-slate-400 text-sm mt-2">
              <p>Correct: {r.correct_count}</p>
              <p>Wrong: {r.wrong_count}</p>
              <p>Passed: {r.passed_count}</p>
              <p>Duration: {r.duration_sec}s</p>
              <p className="mt-1">
                Played: {new Date(r.created_at).toLocaleDateString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
