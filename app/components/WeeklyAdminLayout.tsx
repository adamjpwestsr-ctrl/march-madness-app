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

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Load teams
      const { data: teamData } = await supabase
        .from("teams_sports")
        .select("*")
        .eq("sport", sport);

      // Load games
      const { data: gameData } = await supabase
        .from("sport_schedule")
        .select("*")
        .eq("sport", sport)
        .eq("week_number", week)
        .order("game_date");

      // Load lock time
      const { data: lock } = await supabase
        .from("sport_lock_times")
        .select("*")
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

  return (
    <div className="p-6 space-y-8 text-white">
      <h1 className="text-2xl font-semibold">
        {sport} Weekly Admin
      </h1>

      {/* Week Selector */}
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 18 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setWeek(i + 1)}
            className={`px-3 py-2 rounded ${
              week === i + 1 ? "bg-emerald-600" : "bg-slate-800"
            }`}
          >
            Week {i + 1}
          </button>
        ))}
      </div>

      {/* Teams */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Teams</h2>
        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teams.map((t) => (
              <div
                key={t.id}
                className="border border-slate-700 bg-slate-900 p-4 rounded-xl"
              >
                <p className="font-semibold">{t.name}</p>
                <p className="text-slate-400 text-sm">{t.abbreviation}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Games */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Games</h2>
        {games.length === 0 ? (
          <p className="text-slate-400">No games for this week.</p>
        ) : (
          <div className="space-y-3">
            {games.map((g) => (
              <div
                key={g.id}
                className="border border-slate-700 bg-slate-900 p-4 rounded-xl"
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

      {/* Lock Time */}
      <section className="border border-slate-700 bg-slate-900 p-4 rounded-xl">
        <h2 className="text-xl font-semibold mb-3">Lock Time</h2>
        <p className="text-slate-400 mb-3">
          {lockTime ? new Date(lockTime).toLocaleString() : "Not set"}
        </p>
        <button
          onClick={updateLockTime}
          className="px-4 py-2 bg-emerald-600 rounded"
        >
          Update Lock Time
        </button>
      </section>
    </div>
  );
}
