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

    const { data: userData } = await supabase.auth.getUser();
    setUser(userData.user);

    const queryWeek = selectedWeek ?? week ?? 1;
    setWeek(queryWeek);

    // Load games from unified sport_schedule
    const { data: games, error: gamesError } = await supabase
      .from("sport_schedule")
      .select(
        "id,sport,week_number,home_team_id,away_team_id,game_date,season_year"
      )
      .eq("sport", "NFL")
      .eq("week_number", queryWeek)
      .order("game_date", { ascending: true });

    if (gamesError) {
      console.error(gamesError);
      setMatchups([]);
      setTeams([]);
      setLockTime(null);
      setLocked(false);
      setLoading(false);
      return;
    }

    const teamIds = Array.from(
      new Set(
        (games ?? []).flatMap((g) => [g.home_team_id, g.away_team_id])
      )
    );

    const { data: teamRows, error: teamsError } = await supabase
      .from("teams_sports")
      .select("id,name,abbreviation,logo_url")
      .in("id", teamIds);

    if (teamsError) {
      console.error(teamsError);
      setTeams([]);
      setMatchups([]);
      setLockTime(null);
      setLocked(false);
      setLoading(false);
      return;
    }

    const teamsMap: Record<string, Team> = {};
    (teamRows ?? []).forEach((t) => {
      teamsMap[t.id] = {
        id: t.id,
        name: t.name,
        abbreviation: t.abbreviation ?? "",
        logo_url: t.logo_url ?? null,
      };
    });

    setTeams(Object.values(teamsMap));

    const builtMatchups: Matchup[] =
      games?.map((g: any) => ({
        id: g.id,
        home: teamsMap[g.home_team_id],
        away: teamsMap[g.away_team_id],
      })) ?? [];

    setMatchups(builtMatchups);

    const lock =
      games && games.length
        ? games.reduce<string | null>((min, g) => {
            const d = g.game_date as string;
            if (!min) return d;
            return new Date(d) < new Date(min) ? d : min;
          }, null)
        : null;

    setLockTime(lock);
    setLocked(lock ? new Date(lock) <= new Date() : false);

    if (userData.user) {
      // Survivor picks from unified user_picks
      const { data: picksRows, error: picksError } = await supabase
        .from("user_picks")
        .select("week_number,winner_team_id")
        .eq("user_id", userData.user.id)
        .eq("sport", "NFL");

      if (picksError) {
        console.error(picksError);
      } else {
        const current = picksRows?.find(
          (p) => p.week_number === queryWeek
        );
        setCurrentPick(current?.winner_team_id ?? null);

        const usedIds =
          picksRows
            ?.filter((p) => p.week_number < queryWeek)
            .map((p) => p.winner_team_id) ?? [];
        setUsedTeamIds(usedIds);

        setUsedTeams(
          Object.values(teamsMap)
            .filter((t) => usedIds.includes(t.id))
            .map((t) => t.name)
        );
      }

      // Keep existing streaks + bye weeks endpoints for now
      try {
        const streakRes = await fetch("/api/nfl/weekly/streaks");
        if (streakRes.ok) {
          setStreaks(await streakRes.json());
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const byeRes = await fetch("/api/nfl/weekly/byes");
        if (byeRes.ok) {
          setByeWeeks(await byeRes.json());
        }
      } catch (e) {
        console.error(e);
      }
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

    const { error } = await supabase.from("user_picks").upsert(
      {
        user_id: user.id,
        sport: "NFL",
        week_number: week,
        game_id: null,
        winner_team_id: teamId,
      },
      { onConflict: "user_id,sport,week_number" }
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

      {/* MAIN GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
	{/* MATCHUPS */}
        {/* TEAM SELECTION GRID (REPLACES MATCHUPS SECTION) */}
<div className="lg:col-span-2 rounded-xl bg-slate-900/60 border border-white/10 p-4 shadow-lg flex flex-col gap-6">

  <div className="flex items-center justify-between mb-1">
    <h2 className="text-xl font-semibold">
      {week ? `Week ${week} — Pick Your Team` : "Loading week…"}
    </h2>
    <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
      {locked ? "Locked" : "Open for picks"}
    </span>
  </div>

  {/* Current Pick Summary */}
  {currentPick && (
    <div className="rounded-lg bg-blue-950/40 border border-blue-700/40 px-4 py-3 text-sm text-blue-200">
      You picked:{" "}
      <span className="font-semibold">
        {teams.find((t) => t.id === currentPick)?.name}
      </span>
    </div>
  )}

  {/* Team Grid */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {teams.map((team) => {
      const isUsed = usedTeamIds.includes(team.id);
      const isSelected = currentPick === team.id;

      // Find opponent from matchups
      const opponent = matchups
        .flatMap((m) => [m.home, m.away])
        .find(
          (t) =>
            t.id !== team.id &&
            matchups.some(
              (m) =>
                (m.home.id === team.id && m.away.id === t.id) ||
                (m.away.id === team.id && m.home.id === t.id)
            )
        );

      return (
        <button
          key={team.id}
          onClick={() => !locked && !isUsed && submitPick(team.id, 0)}
          disabled={isUsed || locked}
          className={[
            "rounded-xl border p-4 flex flex-col items-center gap-2 transition",
            isUsed
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-slate-800 hover:border-blue-600",
            isSelected ? "border-blue-600 bg-blue-50 text-black" : "",
          ].join(" ")}
        >
          {team.logo_url && (
            <img
              src={team.logo_url}
              alt={team.name}
              className="w-16 h-16 rounded-full object-contain"
            />
          )}

          <span className="font-semibold text-center">{team.name}</span>

          {opponent && (
            <span className="text-xs text-slate-400">
              vs {opponent.name}
            </span>
          )}
        </button>
      );
    })}
  </div>

  {teams.length === 0 && (
    <p className="text-sm text-slate-400">
      No teams found for Week {week}.
    </p>
  )}
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
                {Object.entries(byeWeeks).map(([weekLabel, teams]) => (
                  <li key={weekLabel}>
                    <span className="text-slate-300 font-medium">
                      Week {weekLabel}:
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

