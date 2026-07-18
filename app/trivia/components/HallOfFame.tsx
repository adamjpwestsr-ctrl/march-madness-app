"use client";

import { useEffect, useState } from "react";

export default function HallOfFame() {
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/trivia/hof", { cache: "no-store" });
        const data = await res.json();

        if (!active) return;

        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }

        if (!data.rounds || data.rounds.length === 0) {
          setError("No Hall of Fame entries yet");
          setLoading(false);
          return;
        }

        setRounds(data.rounds);
        setLoading(false);
      } catch (err) {
        if (active) {
          setError("Failed to load Hall of Fame");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  // 🔒 Hydration-safe: render nothing until loading completes
  if (loading) {
    return (
      <div className="text-slate-400 p-6">
        Loading Hall of Fame…
      </div>
    );
  }

  // 🔒 Hydration-safe: render nothing if API failed
  if (error) {
    return (
      <div className="p-6 text-slate-400">
        Hall of Fame unavailable — {error}.
      </div>
    );
  }

  // 🟢 Valid HOF data — safe to render full UI
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
        Hall of Fame
      </h2>

      <ul className="space-y-4">
        {rounds.map((r) => (
          <li
            key={r.id}
            className="p-4 rounded-lg bg-slate-800/40 border border-slate-700"
          >
            <div className="flex justify-between">
              <span className="font-bold text-lg">{r.display_name}</span>
              <span className="text-blue-400 font-bold">{r.score} pts</span>
            </div>

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
