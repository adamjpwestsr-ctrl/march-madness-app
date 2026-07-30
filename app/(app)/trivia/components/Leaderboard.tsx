"use client";

import { motion, AnimatePresence } from "framer-motion";

type LeaderboardEntry = {
  id: number;
  display_name: string;
  score: number;
  created_at: string;
};

interface Props {
  entries: LeaderboardEntry[];
  loading: boolean;
}

export default function Leaderboard({ entries, loading }: Props) {
  if (loading) {
    return (
      <div style={{ padding: 16, textAlign: "center", color: "#9ca3af" }}>
        Updating…
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: "center", color: "#9ca3af" }}>
        No runs yet. Be the first.
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      <AnimatePresence>
        {entries.map((entry, index) => {
          const rank = index + 1;

          const medal =
            rank === 1
              ? "🥇"
              : rank === 2
              ? "🥈"
              : rank === 3
              ? "🥉"
              : null;

          const scoreColor =
            entry.score > 0
              ? "#22c55e"
              : entry.score < 0
              ? "#f87171"
              : "#e5e7eb";

          const rowGlow =
            rank === 1
              ? "0 0 12px rgba(234,179,8,0.5)"
              : rank === 2
              ? "0 0 10px rgba(156,163,175,0.4)"
              : rank === 3
              ? "0 0 10px rgba(205,127,50,0.4)"
              : "none";

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                marginBottom: 8,
                borderRadius: 12,
                background: "rgba(30,41,59,0.6)",
                border: "1px solid rgba(55,65,81,0.6)",
                boxShadow: rowGlow,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(55,65,81,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  {medal || rank}
                </div>

                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {entry.display_name}
                </div>
              </div>

              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: scoreColor,
                }}
              >
                {entry.score} pts
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
