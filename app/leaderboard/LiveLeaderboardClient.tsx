// app/leaderboard/LiveLeaderboardClient.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { getLeaderboardScores } from "../admin/tournament-setup/actions";

type LeaderboardScore = {
  bracket_id: string;
  total_points: number;
};

export default function LiveLeaderboardClient({
  initialScores,
}: {
  initialScores: LeaderboardScore[];
}) {
  const [scores, setScores] = useState(initialScores);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Listen for updates to the games table
    const channel = supabase
      .channel("games-winner-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games" },
        async () => {
          // Refresh leaderboard when winners change
          const updated = await getLeaderboardScores();
          setScores(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div
      style={{
        padding: 30,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: "#020617",
        minHeight: "100vh",
        color: "#e5e7eb",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>
        Live Leaderboard
      </h1>

      <div style={{ display: "grid", gap: 10 }}>
        {scores.map((s, i) => (
          <div
            key={s.bracket_id}
            style={{
              padding: 12,
              borderRadius: 8,
              background: "#0f172a",
              border: "1px solid #1e293b",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ opacity: 0.7 }}>#{i + 1}</span>
            <span>{s.bracket_id}</span>
            <strong>{s.total_points} pts</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
