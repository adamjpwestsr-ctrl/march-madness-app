"use client";

import { useEffect, useState } from "react";

type HallOfFameEntry = {
  display_name: string;
  score: number;
  correct_count: number;
  wrong_count: number;
  passed_count: number;
  created_at: string;
};

export default async function HallOfFame() {
  const [hof, setHof] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/trivia/hof");
      const data = await res.json();
      setHof(data);
    }
    load();
  }, []);

  if (!hof) {
    return (
      <div style={{ padding: 16, textAlign: "center", color: "#9ca3af" }}>
        Loading Hall of Fame…
      </div>
    );
  }

  // Extract with null guards
  const highest = hof.highestScore ?? null;
  const mostCorrect = hof.mostCorrect ?? null;
  const longest = hof.longestStreak ?? null;
  const mostRuns = hof.mostRuns ?? null;

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
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
        Hall of Fame
      </h2>

      <div style={{ fontSize: 14, color: "#e5e7eb", lineHeight: 1.6 }}>
        <div>
          🏆 <strong>Highest Score Ever:</strong>{" "}
          <span style={{ color: "#22c55e" }}>
            {highest?.display_name ?? "—"} — {highest?.score ?? 0} pts
          </span>
        </div>

        <div>
          🎯 <strong>Most Correct Answers:</strong>{" "}
          {mostCorrect?.display_name ?? "—"} —{" "}
          {mostCorrect?.correct_count ?? 0} correct
        </div>

        <div>
          🔥 <strong>Longest Streak:</strong>{" "}
          {longest?.display_name ?? "—"} — {longest?.streak ?? 0} in a row
        </div>

        <div>
          📊 <strong>Most Runs Played:</strong>{" "}
          {mostRuns?.display_name ?? "—"} — {mostRuns?.count ?? 0} runs
        </div>
      </div>
    </div>
  );
}
