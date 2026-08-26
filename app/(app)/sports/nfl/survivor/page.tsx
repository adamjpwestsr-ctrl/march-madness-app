"use client";

import { useEffect, useState } from "react";
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

export default function SurvivorPage() {
  const supabase = createSupabaseBrowserClient();

  const [week, setWeek] = useState<number | null>(null);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [teamsById, setTeamsById] = useState<Record<string, Team>>({});
  const [lockTime, setLockTime] = useState<string | null>(null);

  const [currentPick, setCurrentPick] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [streaks, setStreaks] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [byes, setByes] = useState<any[]>([]);

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
    loadState();
  }, []);

  async function loadState() {
    setLoading(true);

    // 1. Load Survivor state
    const res = await fetch("/api/nfl/survivor/state");
    const data = await res.json();

    setWeek(data.week);
    setMatchups(data.matchups);
    setTeamsById(data.teams);
    setLockTime(data.lockTime);

    // 2. Load user's Survivor pick
    if (user) {
      const { data: picks } = await supabase
        .from("user_picks")
        .select("winner_team_id")
        .eq("user_id", user.userId)
        .eq("sport", "NFL")
        .eq("week_number", data.week)
        .is("game_id", null)
        .single();

      setCurrentPick(picks?.winner_team_id ?? null);
    }

    // 3. Load streaks
    const streakRes = await fetch("/api/nfl/survivor/streaks");
    const streakData = await streakRes.json();
    setStreaks(streakData);

    // 4. Load history
    const historyRes = await fetch("/api/nfl/survivor/history");
    const historyData = await historyRes.json();
    setHistory(historyData.rows || []);

    // 5. Load bye teams
    const byesRes = await fetch(`/api/nfl/survivor/byes?week=${data.week}`);
    const byesData = await byesRes.json();
    setByes(byesData.byes || []);

    setLoading(false);
  }

  async function submitPick(teamId: string) {
    if (!user || !week || submitting) return;

    setSubmitting(true);

    await fetch("/api/nfl/survivor/pick", {
      method: "POST",
      body: JSON.stringify({ week, teamId }),
    });

    await loadState();
    setSubmitting(false);

    const pickedTeam = teamsById[teamId];

    setToast(
      pickedTeam
        ? `You picked ${pickedTeam.name} for Week ${week}`
        : "Pick updated"
    );

    setTimeout(() => setToast(null), 2500);
  }

  if (loading) {
    return <p className="text-slate-400 text-sm">Loading Survivor…</p>;
  }

  const locked = lockTime ? new Date(lockTime) <= new Date() : false;

  return (
    <div className="min-h-screen text-white flex flex-col gap-10 p-6">
      {/* Header */}
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">NFL Survivor</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Choose one team for Week {week}. If your team loses, you're eliminated.
        </p>
        <div className="text-xs text-slate-500">
          Status:{" "}
          <span
            className={
              locked ? "text-red-400 font-medium" : "text-emerald-400"
            }
          >
            {locked ? "Locked" : "Open for picks"}
          </span>
        </div>
      </section>

      {/* Matchups */}
      <section className="grid gap-6 md:grid-cols-2">
        {matchups.map((m) => {
          const home = m.home;
          const away = m.away;

          const homeDisabled = submitting || locked;
          const awayDisabled = submitting || locked;

          return (
            <div
              key={m.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-center gap-4">
                {/* Home */}
                <div className="flex items-center gap-3">
                  {home.logo_url && (
                    <img
                      src={home.logo_url}
                      alt={home.name}
                      className="w-9 h-9 rounded-full border border-slate-700 object-contain"
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
                    <img
                      src={away.logo_url}
                      alt={away.name}
                      className="w-9 h-9 rounded-full border border-slate-700 object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  disabled={homeDisabled}
                  onClick={() => submitPick(home.id)}
                  className={`flex-1 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    currentPick === home.id
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/40"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  Pick {home.abbreviation}
                </button>

                <button
                  disabled={awayDisabled}
                  onClick={() => submitPick(away.id)}
                  className={`flex-1 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    currentPick === away.id
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/40"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                  }`}
                >
                  Pick {away.abbreviation}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Bye Teams */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-3">Bye Week Teams</h2>
        <p className="text-slate-400 text-sm">
          {byes.length
            ? byes.map((b) => b.name).join(", ")
            : "No teams on bye this week."}
        </p>
      </section>

      {/* Streaks */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-3">Your Survivor Stats</h2>
        <div className="text-slate-300 text-sm flex flex-col gap-1">
          <span>Current Streak: {streaks?.currentStreak ?? 0}</span>
          <span>Longest Streak: {streaks?.longestStreak ?? 0}</span>
          <span>Total Correct: {streaks?.totalCorrect ?? 0}</span>
          <span>Perfect Weeks: {streaks?.perfectWeeks ?? 0}</span>
        </div>
      </section>

      {/* History */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-3">Your Survivor History</h2>

        {history.length === 0 && (
          <p className="text-slate-400 text-sm">No picks yet.</p>
        )}

        {history.length > 0 &&
          history.map((h) => (
            <div
              key={h.week}
              className="flex items-center justify-between px-4 py-3 border-b border-slate-800"
            >
              <div className="flex items-center gap-3">
                {h.logo && (
                  <img
                    src={h.logo}
                    alt={h.team}
                    className="w-8 h-8 rounded-full border border-slate-700"
                  />
                )}
                <div className="flex flex-col">
                  <span className="font-medium text-slate-100">
                    Week {h.week}
                  </span>
                  <span className="text-slate-400 text-sm">
                    {h.team} ({h.abbrev})
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span
                  className={
                    h.correct
                      ? "text-emerald-400 font-semibold"
                      : "text-red-400 font-semibold"
                  }
                >
                  {h.correct ? "Correct" : "Incorrect"}
                </span>
                <span className="text-slate-400 text-xs">
                  {h.points} pts
                </span>
              </div>
            </div>
          ))}
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-4 py-2 rounded-lg bg-slate-900/90 border border-white/10 shadow-xl text-sm text-white">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
