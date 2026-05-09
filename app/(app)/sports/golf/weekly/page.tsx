"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GolfWeeklyDashboardPage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/golf/weekly/state");
      const data = await res.json();
      setState(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-slate-400">Loading…</p>;

  return (
    <div className="relative min-h-screen bg-[url('/images/golf-bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 pointer-events-none" />

      <div className="relative backdrop-blur-sm bg-slate-950/70 min-h-screen p-8">
        <Header tournament={state.tournament} />
        <SeasonProgress season={state.season} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            <CurrentTournamentCard tournament={state.tournament} />
            <QuickPickScroll golfers={state.golfers} userPick={state.pick} />
          </div>

          <div className="space-y-8">
            <PastTournaments history={state.history || []} />
          </div>
        </div>

        <LeaderboardSection leaderboard={state.leaderboard} userId={state.user_id} />
        <ScoringRules />
      </div>
    </div>
  );
}

function Header({ tournament }: any) {
  return (
    <section className="mb-10 opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
        Golf Weekly Challenge
      </h1>
      <p className="text-slate-300 mt-2 max-w-2xl">
        Pick your golfer, track your performance, and climb the leaderboard.
      </p>

      {tournament && (
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-xs text-slate-300">
          <span>🏌️‍♂️ {tournament.name}</span>
          <span className="text-slate-500">•</span>
          <span>{tournament.course || "Course TBA"}</span>
        </div>
      )}
    </section>
  );
}

function SeasonProgress({ season }: any) {
  if (!season) {
    return (
      <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl p-4 opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
        <div className="flex justify-between text-sm text-slate-300 mb-2">
          <span>Season Progress</span>
          <span className="text-slate-500">Unavailable</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div className="h-full bg-slate-700 w-1/4 animate-pulse" />
        </div>
      </div>
    );
  }

  const pct =
    season.total_events > 0
      ? Math.round((season.completed_events / season.total_events) * 100)
      : 0;

  return (
    <div className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl p-4 opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
      <div className="flex justify-between text-sm text-slate-300 mb-2">
        <span>Season Progress</span>
        <span>
          {season.completed_events} / {season.total_events} events ({pct}%)
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function CurrentTournamentCard({ tournament }: any) {
  if (!tournament) return null;

  let countdownLabel = null;
  if (tournament.lock_time) {
    const lockTime = new Date(tournament.lock_time);
    const now = new Date();
    const msLeft = lockTime.getTime() - now.getTime();

    if (msLeft > 0) {
      const hours = Math.floor(msLeft / (1000 * 60 * 60));
      const minutes = Math.floor((msLeft / (1000 * 60)) % 60);
      countdownLabel = `${hours}h ${minutes}m until picks lock`;
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl p-6 transition-all duration-300 opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
      <h2 className="text-xl font-semibold text-white mb-2">This Week’s Tournament</h2>

      <p className="text-slate-300">
        <strong>{tournament.name}</strong>
        <br />
        {tournament.course || "Course TBA"}
        <br />
        {new Date(tournament.start_date).toLocaleDateString()} →{" "}
        {new Date(tournament.end_date).toLocaleDateString()}
      </p>

      {countdownLabel && (
        <p className="text-emerald-300 text-sm mt-3">⏰ {countdownLabel}</p>
      )}
    </div>
  );
}

function QuickPickScroll({ golfers, userPick }: any) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl p-6 transition-all duration-300 opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
      <h2 className="text-xl font-semibold text-white mb-4">Quick Pick</h2>

      <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
        {golfers.slice(0, 25).map((g: any) => {
          const isPick = userPick?.player_id === g.id;

          return (
            <Link
              key={g.id}
              href="/sports/golf/weekly/picks"
              className={`w-full flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:scale-[1.02] ${
                isPick
                  ? "bg-emerald-600 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                  : "bg-slate-800/40 border-slate-700 hover:bg-slate-800"
              }`}
            >
              {g.photo_url ? (
                <img src={g.photo_url} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-700" />
              )}

              <div className="text-left">
                <p className="text-white font-medium">{g.name}</p>
                <p className="text-slate-400 text-sm">{g.country}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/sports/golf/weekly/picks"
        className="block text-center mt-4 text-emerald-400 hover:text-emerald-300"
      >
        View full player list →
      </Link>
    </div>
  );
}

function PastTournaments({ history }: any) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl p-6 transition-all duration-300 opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
      <h2 className="text-xl font-semibold text-white mb-4">Your Recent Rounds</h2>

      <div className="space-y-4">
        {history.slice(0, 5).map((h: any) => (
          <div
            key={h.id}
            className="p-4 rounded-lg bg-slate-800/40 border border-slate-700 backdrop-blur-md shadow-lg transition-all duration-300"
          >
            <p className="text-white font-medium">{h.tournament_name}</p>
            <p className="text-slate-400 text-sm">
              Your pick:{" "}
              {h.player_name || <span className="text-red-400">No selection made</span>}
            </p>
            <p className="text-slate-400 text-sm">Score: {h.points ?? 0}</p>
          </div>
        ))}
      </div>

      <Link
        href="/sports/golf/weekly/history"
        className="block text-center mt-4 text-emerald-400 hover:text-emerald-300"
      >
        View full history →
      </Link>
    </div>
  );
}

function LeaderboardSection({ leaderboard, userId }: any) {
  return (
    <section className="mt-12 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl p-6 transition-all duration-300 opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
      <h2 className="text-xl font-semibold text-white mb-4">Leaderboard</h2>

      <table className="w-full text-left text-slate-300">
        <thead>
          <tr className="text-slate-400 text-sm">
            <th className="pb-2">Rank</th>
            <th className="pb-2">Player</th>
            <th className="pb-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.slice(0, 10).map((entry: any, i: number) => {
            const isUser = entry.user_id === userId;

            return (
              <tr
                key={i}
                className={`border-t border-slate-800 transition-all duration-300 ${
                  isUser
                    ? "bg-emerald-600/20 text-emerald-300 font-semibold animate-pulse"
                    : ""
                }`}
              >
                <td className="py-2">{i + 1}</td>

                <td className="py-2 flex items-center gap-3">
                  {entry.avatar_url ? (
                    <img
                      src={entry.avatar_url}
                      className="w-8 h-8 rounded-full object-cover"
                      alt={entry.user_name}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700" />
                  )}
                  <span>{entry.user_name}</span>
                </td>

                <td>{entry.total_points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function ScoringRules() {
  return (
    <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl p-6 transition-all duration-300 opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
      <h2 className="text-xl font-semibold text-white mb-4">How Scoring Works</h2>

      <ul className="text-slate-300 space-y-2">
        <li>🏆 Win: 25 points</li>
        <li>🥈 Top 10 finish: 10 points</li>
        <li>📉 Missed cut: 0 points</li>
        <li>🔥 Bonus points for streaks and consistency</li>
      </ul>
    </section>
  );
}
