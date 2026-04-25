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

export default function HallOfFame() {
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
            {hof.highestScore.display_name} — {hof.highestScore.score} pts
          </span>
        </div>

        <div>
          🎯 <strong>Most Correct Answers:</strong>{" "}
          {hof.mostCorrect.display_name} — {hof.mostCorrect.correct_count} correct
        </div>

        <div>
          🔥 <strong>Longest Streak:</strong>{" "}
          {hof.longestStreak.display_name} — {hof.longestStreak.streak} in a row
        </div>

        <div>
          📊 <strong>Most Runs Played:</strong>{" "}
          {hof.mostRuns.display_name} — {hof.mostRuns.count} runs
        </div>
      </div>
    </div>
  );
}
