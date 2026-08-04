"use client";

import { useEffect, useState } from "react";

export default function WeeklyLeaderboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/trivia/weekly/leaderboard");
      const json = await res.json();
      setData(json);
    }
    load();
  }, []);

  if (!data) return null;

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
      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Weekly Leaderboard</h2>

      {data.leaderboard.map((entry: any, i: number) => (
        <div
          key={entry.id}
          style={{
            marginTop: 8,
            padding: 8,
            borderRadius: 8,
            background: "rgba(30,41,59,0.6)",
            border: "1px solid rgba(55,65,81,0.6)",
          }}
        >
          <strong>{i + 1}. {entry.display_name}</strong> — {entry.score} pts
        </div>
      ))}
    </div>
  );
}
