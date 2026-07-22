"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* ---------- Types ---------- */

type LeaderboardMode = "daily" | "weekly" | "alltime";

interface ScoreEntry {
  id: number | string;
  player: string;
  score: number;
}

interface LeaderboardResponse {
  scores: ScoreEntry[];
}

/* ---------- Page Component ---------- */

export default function TriviaLeaderboardPage() {
  const [mode, setMode] = useState<LeaderboardMode>("daily");
  const [loading, setLoading] = useState<boolean>(true);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/trivia/leaderboard?mode=${mode}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Leaderboard API returned ${res.status}`);
        }

        const json = (await res.json()) as LeaderboardResponse;

        if (!json || !Array.isArray(json.scores)) {
          throw new Error("Invalid leaderboard format");
        }

        setScores(json.scores);
      } catch (err) {
        console.error("Leaderboard load error:", err);
        setError("Unable to load leaderboard.");
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [mode]);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-start py-20 px-6">

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-extrabold text-white drop-shadow-[0_0_25px_rgba(168,85,247,1)] mb-10 tracking-wide"
      >
        Trivia Leaderboard
      </motion.h1>

      {/* Mode Selector */}
      <div className="flex gap-6 mb-12">
        {(["daily", "weekly", "alltime"] as LeaderboardMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`
              px-6 py-3 rounded-xl text-lg font-bold transition-all duration-300
              ${mode === m
                ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-[0_0_25px_rgba(168,85,247,1)]"
                : "bg-slate-800 text-slate-400 hover:text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.7)]"
              }
            `}
          >
            {m === "daily" && "Daily"}
            {m === "weekly" && "Weekly"}
            {m === "alltime" && "All‑Time"}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-slate-400 text-xl drop-shadow-[0_0_15px_rgba(168,85,247,0.7)]"
        >
          Loading leaderboard…
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-6 rounded-xl shadow-lg text-center max-w-xl">
          {error}
        </div>
      )}

      {/* Leaderboard */}
      {!loading && !error && scores.length > 0 && (
        <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-xl">
          {scores.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex justify-between items-center py-4 border-b border-slate-800 last:border-none"
            >
              {/* Rank */}
              <div className="flex items-center gap-4">
                <RankBadge rank={index + 1} />
                <span className="text-white text-xl font-bold">{entry.player}</span>
              </div>

              {/* Score */}
              <span className="text-cyan-400 text-xl font-extrabold drop-shadow-[0_0_15px_rgba(34,211,238,1)]">
                {entry.score}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && scores.length === 0 && (
        <div className="text-slate-400 text-lg mt-10">
          No scores yet. Be the first to play!
        </div>
      )}
    </div>
  );
}

/* --- Rank Badge Component --- */

interface RankBadgeProps {
  rank: number;
}

function RankBadge({ rank }: RankBadgeProps) {
  const glowMap: Record<number, string> = {
    1: "text-yellow-300 drop-shadow-[0_0_25px_rgba(234,179,8,1)]",
    2: "text-slate-300 drop-shadow-[0_0_25px_rgba(148,163,184,1)]",
    3: "text-orange-400 drop-shadow-[0_0_25px_rgba(251,146,60,1)]",
  };

  return (
    <span
      className={`
        text-3xl font-extrabold w-10 text-center
        ${glowMap[rank] || "text-slate-500"}
      `}
    >
      {rank}
    </span>
  );
}
