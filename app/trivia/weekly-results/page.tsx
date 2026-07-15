"use client";

import { useEffect, useState } from "react";

export default function WeeklyResultsPage() {
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[] | null>(null);
  const [streaks, setStreaks] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch weekly results (winning teams)
        const resResults = await fetch("/api/trivia/weekly/results", {
          cache: "no-store",
        });
        const jsonResults = await resResults.json();

        if (!jsonResults || !jsonResults.week || !jsonResults.winning_team_ids) {
          throw new Error("Invalid weekly results format");
        }

        setWeekStart(jsonResults.week);
        setResults(jsonResults);

        // Fetch leaderboard
        const resLeaderboard = await fetch(
          "/api/trivia/weekly/leaderboard",
          { cache: "no-store" }
        );
        const jsonLeaderboard = await resLeaderboard.json();

        if (!jsonLeaderboard || !Array.isArray(jsonLeaderboard.leaderboard)) {
          throw new Error("Invalid leaderboard format");
        }

        setLeaderboard(jsonLeaderboard.leaderboard);

        // Fetch streaks
        const resStreaks = await fetch("/api/trivia/weekly/streaks", {
          cache: "no-store",
        });
        const jsonStreaks = await resStreaks.json();

        if (!jsonStreaks || !Array.isArray(jsonStreaks.streaks)) {
          throw new Error("Invalid streaks format");
        }

        setStreaks(jsonStreaks.streaks);

      } catch (err: any) {
        console.error("Weekly results page error:", err);
        setError("Unable to load weekly results.");
      }
    }

    load();
  }, []);

  if (error) {
    return (
      <div className="mt-10 p-6 rounded-xl bg-red-900/20 border border-red-800 text-red-300">
        {error}
      </div>
    );
  }

  if (!results || !leaderboard || !streaks) {
    return (
      <div className="mt-10 p-6 rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400">
        Loading weekly results…
      </div>
    );
  }

  return (
    <div className="space-y-10 mt-10">
      {/* Weekly Summary */}
      <section className="p-6 rounded-xl bg-slate-900/40 border border-slate-800">
        <h1 className="text-3xl font-semibold mb-2">Weekly Results</h1>
        <p className="text-slate-400 mb-4">
          Week starting {results.week}
        </p>

        <h3 className="text-xl font-semibold mb-2">Winning Teams</h3>
        <ul className="space-y-2">
          {results.winning_team_ids.map((team: string, i: number) => (
            <li
              key={i}
              className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 text-slate-200"
            >
              {team}
            </li>
          ))}
        </ul>
      </section>

      {/* Leaderboard */}
      <section className="p-6 rounded-xl bg-slate-900/40 border border-slate-800">
        <h2 className="text-2xl font-semibold mb-4">Top Scores</h2>

        {leaderboard.length === 0 && (
          <p className="text-slate-400">No scores yet for this week.</p>
        )}

        <div className="space-y-3">
          {leaderboard.map((entry: any, i: number) => (
            <div
              key={entry.id}
              className="p-3 rounded-lg bg-slate-800/40 border border-slate-700"
            >
              <strong className="text-slate-200">
                {i + 1}. {entry.display_name}
              </strong>
              <span className="text-slate-400"> — {entry.score} pts</span>
            </div>
          ))}
        </div>
      </section>

      {/* Streak Leaders */}
      <section className="p-6 rounded-xl bg-slate-900/40 border border-slate-800">
        <h2 className="text-2xl font-semibold mb-4">Streak Leaders</h2>

        {streaks.length === 0 && (
          <p className="text-slate-400">No streaks recorded yet.</p>
        )}

        <div className="space-y-3">
          {streaks.map((entry: any, i: number) => (
            <div
              key={entry.id}
              className="p-3 rounded-lg bg-slate-800/40 border border-slate-700"
            >
              <strong className="text-slate-200">
                {i + 1}. {entry.display_name}
              </strong>
              <span className="text-slate-400">
                {" "}
                — {entry.streak} week streak
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
