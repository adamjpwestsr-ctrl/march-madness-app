"use client";

import { useEffect, useState, useRef } from "react";
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
  const prevScores = useRef<LeaderboardScore[]>(initialScores);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel("games-winner-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games" },
        async () => {
          const updated = await getLeaderboardScores();
          prevScores.current = scores;
          setScores(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scores]);

  return (
    <div
      style={{
        padding: "32px",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#e2e8f0",
      }}
    >
      <h1
        style={{
          fontSize: "32px",
          fontWeight: 700,
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        Live Leaderboard
      </h1>

      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {scores.map((s, index) => {
          const previous = prevScores.current.find(
            (p) => p.bracket_id === s.bracket_id
          );
          const rankChange =
            previous && previous.total_points !== s.total_points;

          return (
            <div
              key={s.bracket_id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "transform 0.25s ease, background 0.25s ease",
                ...(rankChange && {
                  background: "rgba(34,197,94,0.15)",
                  transform: "scale(1.02)",
                }),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "#38bdf8",
                  }}
                >
                  {s.bracket_id.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div style={{ fontSize: "14px", opacity: 0.8 }}>
                    #{index + 1}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 600 }}>
                    {s.bracket_id}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#38bdf8",
                }}
              >
                {s.total_points} pts
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
