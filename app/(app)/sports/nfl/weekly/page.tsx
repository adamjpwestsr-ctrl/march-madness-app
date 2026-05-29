"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

type WeeklyState = {
  week: number;
  matchups: Matchup[];
  currentPick: { selected_team_id: string } | null;
  usedTeamIds: string[];
  usedTeams: string[];
  locked: boolean;
};

type Streaks = {
  currentStreak: number;
  longestStreak: number;
  totalCorrect: number;
  perfectWeeks: number;
};

type ByeWeeks = Record<number, string[]>;

export default function NFLWeeklyPage() {
  const [state, setState] = useState<WeeklyState | null>(null);
  const [streaks, setStreaks] = useState<Streaks | null>(null);
  const [byeWeeks, setByeWeeks] = useState<ByeWeeks>({});
  const [loading, setLoading] = useState(true);
  const [byeOpen, setByeOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [stateRes, streakRes, byeRes] = await Promise.all([
        fetch("/api/nfl/weekly/state"),
        fetch("/api/nfl/weekly/streaks"),
        fetch("/api/nfl/weekly/byes"), // You will create this small API route
      ]);

      setState(await stateRes.json());
      setStreaks(await streakRes.json());
      setByeWeeks(await byeRes.json());

      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen text-white flex flex-col gap-8">
      {/* Header */}
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          NFL Weekly Challenge
        </h1>
        <p className="text-slate-400 max-w-2xl">
          Pick one team each week. You can’t reuse teams from previous weeks.
          Survive as long as you can and climb the leaderboard.
        </p>

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

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Matchups */}
        <div className="lg:col-span-2 rounded-xl bg-slate-900/60 border border-white/10 p-4 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-semibold">
              {state ? `Week ${state.week} Matchups` : "Loading week…"}
            </h2>
            {state && (
              <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {state.locked ? "Locked" : "Open for picks"}
              </span>
            )}
          </div>

          {loading && (
            <p className="text-slate-400 text-sm">Loading matchups…</p>
          )}

          {!loading && state && state.matchups.length === 0 && (
            <p className="text-slate-400 text-sm">
              No matchups found for this week.
            </p>
          )}

          {!loading && state && state.matchups.length > 0 && (
            <div className="flex flex-col gap-3">
              {state.matchups.map((m) => {
                const homeUsed = state.usedTeamIds.includes(m.home.id);
                const awayUsed = state.usedTeamIds.includes(m.away.id);
                const currentId = state.currentPick?.selected_team_id ?? null;

                return (
                  <div
                    key={m.id}
                    className="flex flex-col gap-2 bg-slate-800/40 px-4 py-3 rounded-lg border border-slate-700/60"
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Home */}
                      <div className="flex items-center gap-3">
                        {m.home.logo_url && (
                          <img
                            src={m.home.logo_url}
                            alt={m.home.name}
                            className="w-9 h-9 rounded-full border border-slate-700 object-contain"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="text-slate-100 text-sm font-medium">
                            {m.home.name}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {m.home.abbreviation}
                          </span>
                        </div>
                      </div>

                      <span className="text-slate-500 text-xs">vs</span>

                      {/* Away */}
                      <div className="flex items-center gap-3">
                        {m.away.logo_url && (
                          <img
                            src={m.away.logo_url}
                            alt={m.away.name}
                            className="w-9 h-9 rounded-full border border-slate-700 object-contain"
                          />
                        )}
                        <div className="flex flex-col items-end">
                          <span className="text-slate-100 text-sm font-medium">
                            {m.away.name}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {m.away.abbreviation}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {homeUsed && "Home team already used · "}
                        {awayUsed && "Away team already used"}
                        {!homeUsed && !awayUsed && "Both teams available"}
                      </span>

                      {currentId && (
                        <span className="text-emerald-400">
                          Current pick:{" "}
                          {currentId === m.home.id
                            ? m.home.name
                            : currentId === m.away.id
                            ? m.away.name
                            : "Another matchup"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="rounded-xl bg-slate-900/60 border border-white/10 p-4 shadow-lg flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Challenge Overview</h2>

          <p className="text-slate-400 text-sm">
            Each week, pick one team to win. Once you use a team, you can’t pick
            them again in future weeks.
          </p>

          {/* Stats */}
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Current Week</span>
              <span className="text-slate-100 font-semibold">
                {state?.week ?? "—"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Matchups</span>
              <span className="text-slate-100 font-semibold">
                {state?.matchups.length ?? "—"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300">Used Teams</span>
              <span className="text-slate-100 font-semibold">
                {state?.usedTeams.length ?? 0}
              </span>
            </div>
          </div>

          {/* Streaks */}
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

          {/* Bye Weeks */}
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
