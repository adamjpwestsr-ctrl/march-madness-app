"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

type Team = {
  id: string;
  name: string;
  abbreviation: string;
  logo_url: string | null;
};

type Matchup = {
  id: number;
  home: Team;
  away: Team;
  game_date: string;
};

type HistoryRow = {
  week: number;
  team: string;
  abbrev: string;
  logo: string | null;
  correct: boolean;
  points: number;
};

type LeaderboardRow = {
  user_id: string;
  name: string | null;
  longestStreak: number;
  currentStreak: number;
  totalCorrect: number;
  eliminatedWeek: number | null;
  rank: number;
};

export default function SurvivorSuperPage() {
  const supabase = createSupabaseBrowserClient();

  const [week, setWeek] = useState<number | null>(null);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [teamsById, setTeamsById] = useState<Record<string, Team>>({});
  const [lockTime, setLockTime] = useState<string | null>(null);

  const [currentPick, setCurrentPick] = useState<string | null>(null);

  const [streaks, setStreaks] = useState<any>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [byes, setByes] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function getLocalSession() {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("mm_session="))
      ?.split("=")[1];

    if (!raw) return null;

    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }

  const user = getLocalSession();

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);

    const stateRes = await fetch("/api/nfl/survivor/state");
    const state = await stateRes.json();

    setWeek(state.week);
    setMatchups(state.matchups);
    setTeamsById(state.teams);
    setLockTime(state.lockTime);

    if (user) {
      const { data: pick } = await supabase
        .from("user_picks")
        .select("winner_team_id")
        .eq("user_id", user.userId)
        .eq("sport", "NFL")
        .eq("week_number", state.week)
        .is("game_id", null)
        .single();

      setCurrentPick(pick?.winner_team_id ?? null);
    }

    const streakRes = await fetch("/api/nfl/survivor/streaks");
    const streakData = await streakRes.json();
    setStreaks(streakData);

    const historyRes = await fetch("/api/nfl/survivor/history");
    const historyData = await historyRes.json();
    setHistory(historyData.rows || []);

    const byesRes = await fetch(`/api/nfl/survivor/byes?week=${state.week}`);
    const byesData = await byesRes.json();
    setByes(byesData.byes || []);

    const lbRes = await fetch("/api/nfl/survivor/leaderboard");
    const lbData = await lbRes.json();
    setLeaderboard(lbData.rows || []);

    setLoading(false);
  }

  async function submitPick(teamId: string) {
    if (!user || !week || submitting) return;

    setSubmitting(true);

    await fetch("/api/nfl/survivor/pick", {
      method: "POST",
      body: JSON.stringify({ week, teamId }),
    });

    await loadAll();
    setSubmitting(false);

    const pickedTeam = teamsById[teamId];

    setToast(
      pickedTeam
        ? `You picked ${pickedTeam.name} for Week ${week}`
        : "Pick updated"
    );

    setTimeout(() => setToast(null), 2500);
  }

  const locked = lockTime ? new Date(lockTime) <= new Date() : false;

  const correctCountByWeek = history.reduce<Record<number, number>>((acc, h) => {
    acc[h.week] = (acc[h.week] || 0) + (h.correct ? 1 : 0);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <motion.div
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-3"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            NFL Survivor <span className="text-emerald-400">Super Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Command center for your Survivor journey—live picks, streaks, history, and leaderboard in one cinematic view.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Week{" "}
              <span className="text-slate-200 font-semibold">
                {week}
              </span>
            </span>
            <span>•</span>
            <span>
              Status:{" "}
              <span
                className={
                  locked ? "text-red-400 font-medium" : "text-emerald-400 font-medium"
                }
              >
                {locked ? "Locked" : "Open for picks"}
              </span>
            </span>
          </div>
        </motion.section>

        {/* Top grid: Picks + Stats */}
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          {/* Matchups / Pick */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>Week {week} Matchups & Pick</span>
              <span className="text-xs text-slate-500">
                Choose one team to survive.
              </span>
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {matchups.map((m) => {
                const home = m.home;
                const away = m.away;

                const homeDisabled = submitting || locked;
                const awayDisabled = submitting || locked;

                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4 shadow-lg shadow-black/40 backdrop-blur"
                  >
                    <div className="flex justify-between items-center gap-4">
                      {/* Home */}
                      <div className="flex items-center gap-3">
                        {home.logo_url && (
                          <motion.img
                            src={home.logo_url}
                            alt={home.name}
                            className="w-9 h-9 rounded-full border border-slate-700 object-contain"
                            whileHover={{ scale: 1.05 }}
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="text-slate-200 text-sm font-medium">
                            {home.name}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {home.abbreviation}
                          </span>
                        </div>
                      </div>

                      <span className="text-slate-500 text-xs">vs</span>

                      {/* Away */}
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className="text-slate-200 text-sm font-medium">
                            {away.name}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {away.abbreviation}
                          </span>
                        </div>
                        {away.logo_url && (
                          <motion.img
                            src={away.logo_url}
                            alt={away.name}
                            className="w-9 h-9 rounded-full border border-slate-700 object-contain"
                            whileHover={{ scale: 1.05 }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        disabled={homeDisabled}
                        onClick={() => submitPick(home.id)}
                        whileTap={{ scale: 0.97 }}
                        className={`flex-1 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          currentPick === home.id
                            ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/40"
                            : "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                        }`}
                      >
                        Pick {home.abbreviation}
                      </motion.button>

                      <motion.button
                        disabled={awayDisabled}
                        onClick={() => submitPick(away.id)}
                        whileTap={{ scale: 0.97 }}
                        className={`flex-1 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          currentPick === away.id
                            ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/40"
                            : "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                        }`}
                      >
                        Pick {away.abbreviation}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Stats card + mini chart */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="space-y-4"
          >
            <div className="rounded-xl border border-emerald-500/40 bg-slate-900/70 p-4 shadow-lg shadow-black/40 backdrop-blur">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                Your Survivor Stats
                <span className="text-xs text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  Live
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Current Streak</span>
                  <span className="text-lg font-semibold">
                    {streaks?.currentStreak ?? 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Longest Streak</span>
                  <span className="text-lg font-semibold">
                    {streaks?.longestStreak ?? 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Total Correct</span>
                  <span className="text-lg font-semibold">
                    {streaks?.totalCorrect ?? 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500">Perfect Weeks</span>
                  <span className="text-lg font-semibold">
                    {streaks?.perfectWeeks ?? 0}
                  </span>
                </div>
              </div>

              {/* Simple bar chart for correct picks by week */}
              <div className="mt-4">
                <span className="text-xs text-slate-500">
                  Correct picks by week
                </span>
                <div className="mt-2 h-20 flex items-end gap-1">
                  {Object.keys(correctCountByWeek).length === 0 && (
                    <span className="text-slate-500 text-xs">
                      No data yet.
                    </span>
                  )}
                  {Object.entries(correctCountByWeek).map(([w, count]) => (
                    <motion.div
                      key={w}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.min(count * 20, 60)}px` }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col items-center justify-end"
                    >
                      <div className="w-4 bg-emerald-500/70 rounded-t-md" />
                      <span className="text-[10px] text-slate-500 mt-1">
                        W{w}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bye teams */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-black/40 backdrop-blur">
              <h2 className="text-lg font-semibold mb-2">Bye Week Teams</h2>
              <p className="text-slate-400 text-xs">
                {byes.length
                  ? byes.map((b) => b.name).join(", ")
                  : "No teams on bye this week."}
              </p>
            </div>
          </motion.section>
        </div>

        {/* History + Leaderboard */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr,1.5fr]">
          {/* History */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/40 backdrop-blur"
          >
            <h2 className="text-xl font-semibold mb-3">Your Survivor History</h2>

            {history.length === 0 && (
              <p className="text-slate-400 text-sm">No picks yet.</p>
            )}

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {history.map((h) => (
                <motion.div
                  key={h.week}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    {h.logo && (
                      <img
                        src={h.logo}
                        alt={h.team}
                        className="w-7 h-7 rounded-full border border-slate-700"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100 text-sm">
                        Week {h.week}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {h.team} ({h.abbrev})
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span
                      className={
                        h.correct
                          ? "text-emerald-400 font-semibold text-xs"
                          : "text-red-400 font-semibold text-xs"
                      }
                    >
                      {h.correct ? "Correct" : "Incorrect"}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {h.points} pts
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Full leaderboard */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/40 backdrop-blur"
          >
            <h2 className="text-xl font-semibold mb-3">Survivor Leaderboard</h2>

            {leaderboard.length === 0 && (
              <p className="text-slate-400 text-sm">No leaderboard data yet.</p>
            )}

            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
              {leaderboard.map((r, i) => (
                <motion.div
                  key={r.user_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex justify-between items-center px-3 py-2 rounded-lg border text-sm ${
                    i === 0
                      ? "bg-emerald-900/40 border-emerald-500/60"
                      : "bg-slate-900/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-slate-400">{r.rank}.</span>
                    <span className="font-medium">
                      {r.name || `User ${r.user_id.slice(0, 6)}`}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="font-semibold text-slate-100 text-xs">
                      {r.longestStreak} wk streak
                    </span>

                    {r.eliminatedWeek === null ? (
                      <span className="text-emerald-400 text-[11px] font-medium">
                        Still Alive
                      </span>
                    ) : (
                      <span className="text-red-400 text-[11px] font-medium">
                        Eliminated (W{r.eliminatedWeek})
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="px-4 py-2 rounded-lg bg-slate-900/90 border border-emerald-500/40 shadow-xl text-sm text-white">
                {toast}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
