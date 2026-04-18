"use client";

import { useEffect, useState } from "react";

const WEEKS = Array.from({ length: 17 }, (_, i) => i + 1);

// ⭐ Added props interface (fixes Vercel TS error)
interface AdminWeeklyProps {
  teams: any[];
  settings: any;
}

export default function AdminWeeklyClient({ teams, settings }: AdminWeeklyProps) {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [winningTeams, setWinningTeams] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [overrideUser, setOverrideUser] = useState("");
  const [overrideTeam, setOverrideTeam] = useState("");
  const [overrideWeek, setOverrideWeek] = useState(1);

  // ⭐ Lock Time State (correct location)
  const [lockTime, setLockTime] = useState(settings?.lock_time || "");

  // ⭐ Update Lock Time (correct location)
  const updateLockTime = async () => {
    const res = await fetch("/api/admin/nfl/weekly/lock", {
      method: "POST",
      body: JSON.stringify({ lock_time: lockTime }),
    });

    if (res.ok) {
      alert("Lock time updated!");
    } else {
      alert("Error updating lock time");
    }
  };

  // Load leaderboard on mount
  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const res = await fetch("/api/nfl/weekly/leaderboard");
    const data = await res.json();
    setLeaderboard(data || []);
  };

  const toggleWinner = (teamId: string) => {
    if (winningTeams.includes(teamId)) {
      setWinningTeams(winningTeams.filter((t) => t !== teamId));
    } else {
      setWinningTeams([...winningTeams, teamId]);
    }
  };

  const submitWinners = async () => {
    const res = await fetch("/api/nfl/weekly/results", {
      method: "POST",
      body: JSON.stringify({
        week: currentWeek,
        winningTeams,
      }),
    });

    if (res.ok) {
      alert("Results submitted + points awarded!");
      loadLeaderboard();
      setWinningTeams([]);
    } else {
      alert("Error submitting results");
    }
  };

  const overridePick = async () => {
    const res = await fetch("/api/nfl/weekly/pick", {
      method: "POST",
      body: JSON.stringify({
        week: overrideWeek,
        teamId: overrideTeam,
        userId: overrideUser,
      }),
    });

    if (res.ok) {
      alert("Pick overridden!");
      loadLeaderboard();
    } else {
      alert("Error overriding pick");
    }
  };

  const resetWeek = async () => {
    if (!confirm("Reset this week? This will remove all picks + points.")) return;

    const res = await fetch("/api/admin/nfl/weekly/reset", {
      method: "POST",
      body: JSON.stringify({ week: currentWeek }),
    });

    if (res.ok) {
      alert("Week reset!");
      loadLeaderboard();
    } else {
      alert("Error resetting week");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-8">NFL Weekly Picks — Admin Tools</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT COLUMN — WEEK SELECTOR + WINNERS */}
        <div className="lg:col-span-2 space-y-8">

          {/* Week Selector */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Select Week</h2>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {WEEKS.map((week) => (
                <button
                  key={week}
                  onClick={() => {
                    setCurrentWeek(week);
                    setWinningTeams([]);
                  }}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold
                    ${
                      week === currentWeek
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-800 hover:bg-slate-700"
                    }
                  `}
                >
                  Week {week}
                </button>
              ))}
            </div>
          </div>

          {/* Winner Selection */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Select Winning Teams</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {teams.map((team: any) => (
                <button
                  key={team.id}
                  onClick={() => toggleWinner(team.id)}
                  className={`
                    p-4 rounded-xl border text-center transition
                    ${
                      winningTeams.includes(team.id)
                        ? "border-emerald-400 bg-emerald-500/20"
                        : "border-slate-700 bg-slate-800 hover:border-emerald-400"
                    }
                  `}
                >
                  {team.logo_url ? (
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      className="h-10 w-10 mx-auto mb-2 object-contain"
                    />
                  ) : (
                    <div className="text-3xl mb-2">{team.emoji}</div>
                  )}

                  <div className="font-semibold">{team.name}</div>
                </button>
              ))}
            </div>

            <button
              onClick={submitWinners}
              className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg"
            >
              Submit Winners + Award Points
            </button>
          </div>

          {/* Reset Week */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Reset Week</h2>

            <button
              onClick={resetWeek}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Reset Week {currentWeek}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN — LEADERBOARD + OVERRIDES */}
        <div className="space-y-8">

          {/* Leaderboard */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Leaderboard</h2>

            <div className="space-y-3">
              {leaderboard.map((entry: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between bg-slate-800 px-3 py-2 rounded-lg"
                >
                  <span>{entry.email}</span>
                  <span className="font-bold text-emerald-400">
                    {entry.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Override Pick */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Override User Pick</h2>

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

            <button
              onClick={overridePick}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg"
            >
              Override Pick
            </button>
          </div>

          {/* ⭐ Weekly Lock Time */}
          <div className="p-4 border border-slate-700 rounded-xl bg-slate-900/70">
            <h3 className="text-lg font-semibold mb-2">Weekly Lock Time</h3>

            <input
              type="datetime-local"
              value={lockTime?.slice(0, 16)}
              onChange={(e) => setLockTime(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm"
            />

            <button
              onClick={updateLockTime}
              className="ml-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold"
            >
              Update Lock Time
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
