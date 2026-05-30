"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Team = {
  id: string;
  name: string;
  abbreviation?: string;
  logo_url?: string | null;
};

type Matchup = {
  id: number;
  home: Team;
  away: Team;
};

type Streaks = {
  currentStreak: number;
  longestStreak: number;
  totalCorrect: number;
  perfectWeeks: number;
};

type ByeWeeks = Record<number, string[]>;

export default function NFLWeeklyPage() {
  const [week, setWeek] = useState<number | null>(null);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentPick, setCurrentPick] = useState<string | null>(null);
  const [usedTeamIds, setUsedTeamIds] = useState<string[]>([]);
  const [usedTeams, setUsedTeams] = useState<string[]>([]);
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [byeWeeks, setByeWeeks] = useState<ByeWeeks>({});
  const [locked, setLocked] = useState(false);
  const [lockTime, setLockTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [byeOpen, setByeOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load(selectedWeek?: number) {
    setLoading(true);

    // 1. Load user
    const { data: userData } = await supabase.auth.getUser();
    setUser(userData.user);

    // 2. Load weekly state (supports ?week=)
    const queryWeek = selectedWeek ?? week;
    const stateRes = await fetch(
      `/api/nfl/weekly/state${queryWeek ? `?week=${queryWeek}` : ""}`
    );
    const stateJson = await stateRes.json();

    setWeek(stateJson.week);
    setTeams(stateJson.teams || []);
    setLocked(stateJson.locked ?? false);
    setLockTime(stateJson.lock_time ?? null);

    // Build matchups client-side
    const built =
      stateJson.games?.map((g: any) => ({
        id: g.id,
        home: stateJson.teams.find((t: Team) => t.id === g.home_team_id),
        away: stateJson.teams.find((t: Team) => t.id === g.away_team_id),
      })) ?? [];

    setMatchups(built);

    if (userData.user) {
      // 3. Load current pick
      const { data: pick } = await supabase
        .from("nfl_challenge_selections")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("week_number", stateJson.week)
        .maybeSingle();

      setCurrentPick(pick?.selected_team_id ?? null);

      // 4. Load used teams
      const { data: used } = await supabase
        .from("nfl_challenge_selections")
        .select("selected_team_id")
        .eq("user_id", userData.user.id);

      const usedIds = used?.map((u) => u.selected_team_id) ?? [];
      setUsedTeamIds(usedIds);

      setUsedTeams(
        stateJson.teams
          .filter((t: Team) => usedIds.includes(t.id))
          .map((t: Team) => t.name)
      );

      // 5. Load streaks
      const streakRes = await fetch("/api/nfl/weekly/streaks");
      setStreaks(await streakRes.json());

      // 6. Load bye weeks
      const byeRes = await fetch("/api/nfl/weekly/byes");
      setByeWeeks(await byeRes.json());
    }

    setLoading(false);
  }

  async function submitPick(teamId: string, gameId: number) {
    if (!user) {
      alert("You must be logged in to make a pick.");
      return;
    }

    if (locked) {
      alert("Picks are locked for this week.");
      return;
    }

    const { error } = await supabase.from("nfl_challenge_selections").upsert(
      {
        user_id: user.id,
        week_number: week,
        selected_team_id: teamId,
        game_id: gameId,
      },
      { onConflict: "user_id,week_number" }
    );

    if (error) {
      console.error(error);
      alert("Failed to submit pick.");
    } else {
      await load();
    }
  }

  function handleWeekChange(newWeek: number) {
    setWeek(newWeek);
    load(newWeek);
  }

  return (
    <div className="min-h-screen text-white flex flex-col gap-8">

      {/* 🔒 LOCK BANNER */}
      <section
        className={`rounded-xl border px-4 py-3 text-sm md:text-base flex flex-col md:flex-row md:items-center md:justify-between ${
          locked
            ? "border-red-500/60 bg-red-950/40 text-red-200"
            : "border-emerald-500/60 bg-emerald-950/40 text-emerald-100"
        }`}
      >
        <div className="font-semibold">
          {locked
            ? "Week Locked — Picks are closed."
            : "Lock in your pick before kickoff — don’t take the L."}
        </div>

        <div className="mt-2 md:mt-0 text-xs md:text-sm opacity-90">
          {lockTime
            ? `Picks lock at ${new Date(lockTime).toLocaleString("en-US", {
                weekday: "long",
                hour: "numeric",
                minute: "2-digit",
                timeZoneName: "short",
              })}`
            : "Lock time not set"}
        </div>
      </section>

      {/* HEADER + WEEK SELECTOR */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              NFL Weekly Challenge
            </h1>
            <p className="text-slate-400 max-w-2xl">
              Pick one team each week. You can’t reuse teams from previous
              weeks. Survive as long as you can and climb the leaderboard.
            </p>
          </div>

          {/* WEEK SELECTOR */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-300">Week</span>
            <select
              value={week ?? 1}
              onChange={(e) => handleWeekChange(Number(e.target.value))}
              className="bg-slate-900 text-slate-100 border border-slate-700 rounded-md px-3 py-1 text-sm"
            >
              {[...Array(18)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Week {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/sports/nfl/weekly/picks"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium shadow-lg shadow-blue-600/30"
          >
            Make Your Pick
          </Link>

          <Link
            href="/sports/nfl/weekly/leaderboard"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium border border-slate-700"
          >
            View Leaderboard
          </Link>

          <Link
            href="/sports/nfl/weekly/history"
            className="inline-flex items-center px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-sm font-medium border border-slate-700"
          >
            View History
          </Link>
        </div>
      </section>

      {/* MAIN GRID STARTS HERE — MATCHUPS + SIDE PANEL */}
      {/* MAIN GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MATCHUPS */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/60 border border-white/10 p-4 shadow-lg flex flex-col gap-4">

          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-semibold">
              {week ? `Week ${week} Matchups` : "Loading week…"}
            </h2>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {locked ? "Locked" : "Open for picks"}
            </span>
          </div>

          {loading && (
            <p className="text-slate-400 text-sm">Loading matchups…</p>
          )}

          {!loading && matchups.length === 0 && (
            <p className="text-slate-400 text-sm">
              No matchups found for this week.
            </p>
          )}

          {!loading && matchups.length > 0 && (
            <div className="max-w-3xl mx-auto flex flex-col gap-3">

              {matchups.map((m) => {
                const homeUsed = usedTeamIds.includes(m.home.id);
                const awayUsed = usedTeamIds.includes(m.away.id);

                return (
                  <div
                    key={m.id}
                    className="flex flex-col gap-2 bg-slate-800/40 px-4 py-3 rounded-lg border border-slate-700/60"
                  >
                    {/* TEAM ROW */}
                    <div className="flex items-center justify-between gap-4">

                      {/* HOME */}
                      <div className="flex items-center gap-3 w-1/2 justify-end">
                        {m.home.logo_url && (
                          <img
                            src={m.home.logo_url}
                            alt={m.home.name}
                            className="w-9 h-9 rounded-full border border-slate-700 object-contain"
                          />
                        )}
                        <div className="flex flex-col items-end">
                          <span className="text-slate-100 text-sm font-medium">
                            {m.home.name}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {m.home.abbreviation}
                          </span>
                        </div>
                      </div>

                      <span className="text-slate-500 text-xs">vs</span>

                      {/* AWAY */}
                      <div className="flex items-center gap-3 w-1/2 justify-start">
                        {m.away.logo_url && (
                          <img
                            src={m.away.logo_url}
                            alt={m.away.name}
                            className="w-9 h-9 rounded-full border border-slate-700 object-contain"
                          />
                        )}
                        <div className="flex flex-col items-start">
                          <span className="text-slate-100 text-sm font-medium">
                            {m.away.name}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {m.away.abbreviation}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* STATUS ROW */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {homeUsed && "Home team already used · "}
                        {awayUsed && "Away team already used"}
                        {!homeUsed && !awayUsed && "Both teams available"}
                      </span>

                      {currentPick && (
                        <span className="text-emerald-400">
                          Current pick:{" "}
                          {currentPick === m.home.id
                            ? m.home.name
                            : currentPick === m.away.id
                            ? m.away.name
                            : "Another matchup"}
                        </span>
                      )}
                    </div>

                    {/* PICK BUTTONS */}
                    {!locked && (
                      <div className="flex gap-3 mt-2 justify-center">
                        <button
                          disabled={homeUsed}
                          onClick={() => submitPick(m.home.id, m.id)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                            homeUsed
                              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-500"
                          }`}
                        >
                          Pick {m.home.name}
                        </button>

                        <button
                          disabled={awayUsed}
                          onClick={() => submitPick(m.away.id, m.id)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                            awayUsed
                              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-500"
                          }`}
                        >
                          Pick {m.away.name}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          )}
        </div>

        {/* SIDE PANEL */}
        <div className="rounded-xl bg-slate-900/60 border border-white/10 p-4 shadow-lg flex flex-col gap-6">

          <h2 className="text-xl font-semibold">Challenge Overview</h2>

          <p className="text-slate-400 text-sm">
            Each week, pick one team to win. Once you use a team, you can’t pick
            them again in future weeks.
          </p>

          {/* STATS */}
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Current Week</span>
              <span className="text-slate-100 font-semibold">
                {week ?? "—"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Matchups</span>
              <span className="text-slate-100 font-semibold">
                {matchups.length ?? "—"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Used Teams</span>
              <span className="text-slate-100 font-semibold">
                {usedTeams.length ?? 0}
              </span>
            </div>
          </div>

          {/* STREAKS */}
          <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3">
            <h3 className="text-sm font-semibold mb-2">Your Streaks</h3>

            {!streaks && (
              <p className="text-slate-500 text-xs">Loading streaks…</p>
            )}

            {streaks && (
              <ul className="text-slate-400 text-xs space-y-1.5">
                <li>Current streak: {streaks.currentStreak} weeks</li>
                <li>Longest streak: {streaks.longestStreak} weeks</li>
                <li>Total correct picks: {streaks.totalCorrect}</li>
                <li>Perfect weeks: {streaks.perfectWeeks}</li>
              </ul>
            )}
          </div>

          {/* BYE WEEKS */}
          <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-3">
            <button
              onClick={() => setByeOpen(!byeOpen)}
              className="w-full text-left text-sm font-semibold mb-2 flex justify-between items-center"
            >
              Bye Weeks
              <span className="text-slate-400 text-xs">
                {byeOpen ? "▲" : "▼"}
              </span>
            </button>

            {byeOpen && (
              <ul className="text-slate-400 text-xs space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {Object.entries(byeWeeks).map(([week, teams]) => (
                  <li key={week}>
                    <span className="text-slate-300 font-medium">
                      Week {week}:
                    </span>{" "}
                    {teams.join(", ")}
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}
