// /app/components/WeeklyAdminLayout.tsx

"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

type Props = {
  sport: "NFL" | "NBA" | "NHL";
};

export default function WeeklyAdminLayout({ sport }: Props) {
  const supabase = createSupabaseBrowserClient();

  const [week, setWeek] = useState(1);
  const [teams, setTeams] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [lockTime, setLockTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [overrideUser, setOverrideUser] = useState("");
  const [overrideGame, setOverrideGame] = useState<number | null>(null);
  const [overrideWinner, setOverrideWinner] = useState("");

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // -----------------------------------------------------
  // LOAD TEAMS, GAMES, LOCK TIME
  // -----------------------------------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: teamData } = await supabase
        .from("teams_sports")
        .select("*")
        .eq("sport", sport)
        .order("name");

      const { data: gameData } = await supabase
        .from("sport_schedule")
        .select("*")
        .eq("sport", sport)
        .eq("week_number", week)
        .order("game_date");

      const { data: lock } = await supabase
        .from("sport_lock_times")
        .select("lock_time")
        .eq("sport", sport)
        .eq("week_number", week)
        .single();

      setTeams(teamData ?? []);
      setGames(gameData ?? []);
      setLockTime(lock?.lock_time ?? null);
      setLoading(false);
    }

    load();
  }, [sport, week]);

  // -----------------------------------------------------
  // UPDATE LOCK TIME
  // -----------------------------------------------------
  const updateLockTime = async () => {
    const newTime = prompt("Enter new lock time (YYYY-MM-DD HH:mm:ss)");
    if (!newTime) return;

    await supabase
      .from("sport_lock_times")
      .upsert(
        { sport, week_number: week, lock_time: newTime },
        { onConflict: "sport,week_number" }
      );

    setLockTime(newTime);
    alert("Lock time updated.");
  };

  // -----------------------------------------------------
  // OVERRIDE PICK
  // -----------------------------------------------------
  const submitOverride = async () => {
    if (!overrideUser || !overrideGame || !overrideWinner) {
      alert("Missing fields.");
      return;
    }

    await supabase.from("user_picks").upsert(
      {
        user_id: overrideUser,
        game_id: overrideGame,
        sport,
        week_number: week,
        winner_team_id: overrideWinner,
      },
      { onConflict: "user_id,game_id,sport,week_number" }
    );

    alert("Override applied.");
    setOverrideUser("");
    setOverrideGame(null);
    setOverrideWinner("");
  };

  // -----------------------------------------------------
  // LOAD LEADERBOARD
  // -----------------------------------------------------
  const loadLeaderboard = async () => {
    setLoadingLeaderboard(true);

    const { data } = await supabase.rpc("weekly_leaderboard", {
      p_sport: sport,
      p_week: week,
    });

    setLeaderboard(data ?? []);
    setLoadingLeaderboard(false);
  };

  return (
    <div className="p-6 space-y-10 text-white bg-slate-950 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">
        {sport} Weekly Picks — Admin Tools
      </h1>

      {/* -----------------------------------------------------
          WEEK SELECTOR
      ----------------------------------------------------- */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: 18 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setWeek(i + 1)}
            className={`px-3 py-2 rounded ${
              week === i + 1 ? "bg-emerald-600" : "bg-slate-800"
            } hover:bg-emerald-700 transition`}
          >
            Week {i + 1}
          </button>
        ))}
      </div>

      {/* -----------------------------------------------------
          TEAMS
      ----------------------------------------------------- */}
      <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-3">Teams</h2>

        {loading ? (
          <p className="text-slate-400">Loading teams…</p>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teams.map((t) => (
              <div
                key={t.id}
                className="border border-slate-700 bg-slate-800 p-4 rounded-lg"
              >
                <p className="font-semibold">{t.name}</p>
                <p className="text-slate-400 text-sm">{t.abbreviation}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* -----------------------------------------------------
          GAMES
      ----------------------------------------------------- */}
      <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-3">Games</h2>

        {loading ? (
          <p className="text-slate-400">Loading games…</p>
        ) : games.length === 0 ? (
          <p className="text-slate-400">No games for this week.</p>
        ) : (
          <div className="space-y-3">
            {games.map((g) => (
              <div
                key={g.id}
                className="border border-slate-700 bg-slate-800 p-4 rounded-lg"
              >
                <p className="font-semibold">
                  {g.home_team_id} vs {g.away_team_id}
                </p>
                <p className="text-slate-400 text-sm">
                  {new Date(g.game_date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* -----------------------------------------------------
          LOCK TIME
      ----------------------------------------------------- */}
      <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-3">Lock Time</h2>
        <p className="text-slate-400 mb-3">
          {lockTime ? new Date(lockTime).toLocaleString() : "Not set"}
        </p>
        <button
          onClick={updateLockTime}
          className="px-4 py-2 bg-emerald-600 rounded hover:bg-emerald-700 transition"
        >
          Update Lock Time
        </button>
      </section>

      {/* -----------------------------------------------------
          OVERRIDE PICK
      ----------------------------------------------------- */}
      <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-3">Override User Pick</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            value={overrideUser}
            onChange={(e) => setOverrideUser(e.target.value)}
            placeholder="User ID"
            className="bg-slate-800 border border-slate-700 rounded p-2"
          />

          <select
            value={overrideGame ?? ""}
            onChange={(e) => setOverrideGame(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded p-2"
          >
            <option value="">Select Game</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.home_team_id} vs {g.away_team_id}
              </option>
            ))}
          </select>

          <select
            value={overrideWinner}
            onChange={(e) => setOverrideWinner(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded p-2"
          >
            <option value="">Select Winner</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={submitOverride}
          className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Apply Override
        </button>
      </section>

      {/* -----------------------------------------------------
          LEADERBOARD
      ----------------------------------------------------- */}
      <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="text-xl font-semibold mb-3">Leaderboard</h2>

        <button
          onClick={loadLeaderboard}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition mb-4"
        >
          Load Leaderboard
        </button>

        {loadingLeaderboard ? (
          <p className="text-slate-400">Loading leaderboard…</p>
        ) : leaderboard.length === 0 ? (
          <p className="text-slate-400">No leaderboard data.</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((row, i) => (
              <div
                key={i}
                className="border border-slate-700 bg-slate-800 p-3 rounded-lg flex justify-between"
              >
                <span>{row.username}</span>
                <span className="font-bold">{row.points}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
