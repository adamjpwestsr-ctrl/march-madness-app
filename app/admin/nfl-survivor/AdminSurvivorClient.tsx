// /app/admin/nfl-survivor/AdminSurvivorClient.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WEEKS = Array.from({ length: 17 }, (_, i) => i + 1);

interface AdminSurvivorProps {
  teams: any[];
  settings: any[];
}

type LeaderboardRow = {
  user_id: string;
  name: string | null;
  longestStreak: number;
  currentStreak: number;
  totalCorrect: number;
  eliminatedWeek: number | null;
  rank: number;
};

type HistoryRow = {
  week: number;
  team: string;
  abbrev: string;
  logo: string | null;
  correct: boolean;
  points: number;
};

export default function AdminSurvivorClient({ teams, settings }: AdminSurvivorProps) {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [winningTeam, setWinningTeam] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [overrideUser, setOverrideUser] = useState("");
  const [overrideTeam, setOverrideTeam] = useState("");
  const [overrideWeek, setOverrideWeek] = useState(1);
  const [lockTime, setLockTime] = useState("");
  const [countdown, setCountdown] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weekSettings = useMemo(
    () => settings.find((s) => s.week_number === currentWeek),
    [settings, currentWeek]
  );

  useEffect(() => {
    if (typeof weekSettings?.lock_time === "string") {
      setLockTime(weekSettings.lock_time);
    } else {
      setLockTime("");
    }
  }, [weekSettings]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!lockTime) return;
      const diff = new Date(lockTime).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("Locked");
      } else {
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        setCountdown(`${hrs}h ${mins}m`);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [lockTime]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 3000);
  };

  const loadLeaderboard = async () => {
    const res = await fetch("/api/nfl/survivor/leaderboard");
    const data = await res.json();
    setLeaderboard(data.rows || []);
  };

  const loadHistory = async () => {
    const res = await fetch("/api/nfl/survivor/history");
    const data = await res.json();
    setHistory(data.rows || []);
  };

  useEffect(() => {
    loadLeaderboard();
    loadHistory();
  }, []);

  const submitWinner = async () => {
    try {
      const res = await fetch("/api/admin/nfl/survivor/results", {
        method: "POST",
        body: JSON.stringify({
          week: currentWeek,
          winningTeamId: winningTeam,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit Survivor winner");

      showToast("Survivor winner submitted + eliminations processed!");
      loadLeaderboard();
      loadHistory();
      setWinningTeam("");
    } catch (err: any) {
      showError(err.message);
    }
  };

  const overridePick = async () => {
    try {
      const res = await fetch("/api/nfl/survivor/pick", {
        method: "POST",
        body: JSON.stringify({
          week: overrideWeek,
          teamId: overrideTeam,
          userId: overrideUser,
        }),
      });

      if (!res.ok) throw new Error("Failed to override Survivor pick");

      showToast("Survivor pick overridden!");
      loadLeaderboard();
      loadHistory();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const resetWeek = async () => {
    if (!confirm(`Reset Survivor Week ${currentWeek}? This removes picks, eliminations, and recalculates streaks.`))
      return;

    try {
      const res = await fetch("/api/admin/nfl/survivor/reset", {
        method: "POST",
        body: JSON.stringify({ week: currentWeek }),
      });

      if (!res.ok) throw new Error("Failed to reset Survivor week");

      showToast(`Survivor Week ${currentWeek} reset!`);
      loadLeaderboard();
      loadHistory();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const updateLockTime = async () => {
    try {
      const res = await fetch("/api/admin/nfl/survivor/lock", {
        method: "POST",
        body: JSON.stringify({
          week: currentWeek,
          lock_time: lockTime,
        }),
      });

      if (!res.ok) throw new Error("Failed to update Survivor lock time");

      showToast("Survivor lock time updated!");
    } catch (err: any) {
      showError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-10">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        NFL Survivor — Admin Tools
      </motion.h1>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mb-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* Week Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Select Week</h2>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {WEEKS.map((week) => (
                <motion.button
                  key={week}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setCurrentWeek(week);
                    setWinningTeam("");
                    const s = settings.find((x) => x.week_number === week);
                    setLockTime(typeof s?.lock_time === "string" ? s.lock_time : "");
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    week === currentWeek
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 hover:bg-slate-700"
                  }`}
                >
                  Week {week}
                </motion.button>
              ))}
            </div>

            <div className="text-xs text-slate-400 mt-2">
              Lock Time Countdown:{" "}
              <span className="text-emerald-400 font-semibold">{countdown}</span>
            </div>
          </motion.div>

          {/* Survivor Winner Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Set Survivor Winning Team</h2>

            <select
              value={winningTeam}
              onChange={(e) => setWinningTeam(e.target.value)}
              className="w-full mb-4 px-3 py-2 rounded bg-slate-800 border border-slate-700"
            >
              <option value="">Select Winning Team</option>
              {teams.map((team: any) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={submitWinner}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg"
            >
              Submit Survivor Winner + Process Eliminations
            </motion.button>
          </motion.div>

          {/* Reset Week */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Reset Survivor Week</h2>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={resetWeek}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Reset Week {currentWeek}
            </motion.button>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Survivor Leaderboard</h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {leaderboard.map((entry, i) => (
                <motion.div
                  key={entry.user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="flex justify-between bg-slate-800 px-3 py-2 rounded-lg text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {entry.name || `User ${entry.user_id.slice(0, 6)}`}
                    </span>
                    <span className="text-xs text-slate-400">
                      Rank {entry.rank} • Longest {entry.longestStreak} • Current{" "}
                      {entry.currentStreak}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    {entry.eliminatedWeek === null ? (
                      <span className="text-emerald-400 text-xs font-semibold">
                        Still Alive
                      </span>
                    ) : (
                      <span className="text-red-400 text-xs font-semibold">
                        Eliminated (W{entry.eliminatedWeek})
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      Total Correct {entry.totalCorrect}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Override Pick */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-700 p-6 rounded-xl shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4">Override Survivor Pick</h2>

            <input
              type="text"
              placeholder="User ID"
              value={overrideUser}
              onChange={(e) => setOverrideUser(e.target.value)}
              className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
            />

            <select
              value={overrideTeam}
              onChange={(e) => setOverrideTeam(e.target.value)}
              className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
            >
              <option value="">Select Team</option>
              {teams.map((team: any) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <select
              value={overrideWeek}
              onChange={(e) => setOverrideWeek(Number(e.target.value))}
              className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
            >
              {WEEKS.map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={overridePick}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg"
            >
              Override Pick
            </motion.button>
          </motion.div>

          {/* Lock Time */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border border-slate-700 rounded-xl bg-slate-900/70 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2">Survivor Lock Time</h3>

            <input
              type="datetime-local"
              value={typeof lockTime === "string" ? lockTime.slice(0, 16) : ""}
              onChange={(e) => setLockTime(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"
            />

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={updateLockTime}
              className="ml-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold"
            >
              Update Lock Time
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
