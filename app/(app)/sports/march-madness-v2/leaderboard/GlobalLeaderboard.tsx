"use client";

import { useEffect, useState, useCallback } from "react";
import LeaderboardPanel from "./LeaderboardPanel";

export default function GlobalLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);

  const loadLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/march-madness-v2/leaderboard/get");
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();

    const interval = setInterval(() => {
      loadLeaderboard();
    }, 15000); // refresh every 15 seconds

    return () => clearInterval(interval);
  }, [loadLeaderboard]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6 text-center">
        Global Leaderboard
      </h1>

      <LeaderboardPanel leaderboard={leaderboard} />
    </div>
  );
}
