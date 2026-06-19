"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

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

export default function NFLWeeklyPicksPage() {
  const supabase = createSupabaseBrowserClient();

  const [week, setWeek] = useState<number | null>(null);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [currentPick, setCurrentPick] = useState<string | null>(null);
  const [usedTeamIds, setUsedTeamIds] = useState<string[]>([]);
  const [usedTeams, setUsedTeams] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    // Get user
    const { data: userData } = await supabase.auth.getUser();
    setUser(userData.user);

    // Determine active week (same logic as NFLWeeklyPage)
    const { data: activeWeek } = await supabase
      .from("game_date")
      .select("active_week")
      .eq("sport", "NFL")
      .single();

    const w = activeWeek?.active_week ?? 1;
    setWeek(w);

    // Load matchups
    const { data: games } = await supabase
      .from("sport_schedule")
      .select(
        "id,home_team_id,away_team_id,game_date"
      )
      .eq("sport", "NFL")
      .eq("week_number", w)
      .order("game_date", { ascending: true });

    if (!games || games.length === 0) {
      setMatchups([]);
      setLoading(false);
      return;
    }

    // Load teams
    const teamIds = Array.from(
      new Set(games.flatMap((g) => [g.home_team_id, g.away_team_id]))
    );

    const { data: teamRows } = await supabase
      .from("teams_sports")
      .select("id,name,abbreviation,logo_url")
      .in("id", teamIds);

    const teamsMap: Record<string, Team> = {};
    (teamRows ?? []).forEach((t) => {
      teamsMap[t.id] = {
        id: t.id,
        name: t.name,
        abbreviation: t.abbreviation ?? "",
        logo_url: t.logo_url ?? null,
      };
    });

    const builtMatchups: Matchup[] = games.map((g) => ({
      id: g.id,
      home: teamsMap[g.home_team_id],
      away: teamsMap[g.away_team_id],
    }));

    setMatchups(builtMatchups);

    // Lock logic
    const lockTime = games.reduce<string | null>((min, g) => {
      const d = g.game_date;
      if (!min) return d;
      return new Date(d) < new Date(min) ? d : min;
    }, null);

    setLocked(lockTime ? new Date(lockTime) <= new Date() : false);

    // Load user picks
    if (userData.user) {
      const { data: picks } = await supabase
        .from("user_picks")
        .select("week_number,winner_team_id")
        .eq("user_id", userData.user.id)
        .eq("sport", "NFL");

      const current = picks?.find((p) => p.week_number === w);
      setCurrentPick(current?.winner_team_id ?? null);

      const usedIds =
        picks?.filter((p) => p.week_number < w).map((p) => p.winner_team_id) ??
        [];
      setUsedTeamIds(usedIds);

      setUsedTeams(
        Object.values(teamsMap)
          .filter((t) => usedIds.includes(t.id))
          .map((t) => t.name)
      );
    }

    setLoading(false);
  }

  async function submitPick(teamId: string) {
    if (!user || locked) return;

    setSubmitting(true);

    await supabase.from("user_picks").upsert(
      {
        user_id: user.id,
        sport: "NFL",
        week_number: week,
        game_id: null,
        winner_team_id: teamId,
      },
      { onConflict: "user_id,sport,week_number" }
    );

    await load();
    setSubmitting(false);

    const pickedTeam =
      matchups
        .flatMap((m) => [m.home, m.away])
        .find((t) => t.id === teamId) || null;

    setToast(
      pickedTeam
        ? `You picked ${pickedTeam.name} for Week ${week}`
        : "Pick updated"
    );

    setTimeout(() => setToast(null), 2500);
  }

  if (loading) {
    return <p className="text-slate-400 text-sm">Loading matchups…</p>;
  }

  return (
    <div className="min-h-screen text-white flex flex-col gap-8">
      {/* Header */}
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold mb-1">NFL Weekly Picks</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Choose one team for Week {week}. You cannot reuse teams from previous
          weeks, and picks may lock before kickoff.
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
          const homeUsed = usedTeamIds.includes(m.home.id);
          const awayUsed = usedTeamIds.includes(m.away.id);

          return (
            <div
              key={m.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-4 shadow-sm"
            >
              <div className="flex justify-between items-center gap-4">
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
                    <span className="text-slate-200 text-sm font-medium">
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
                  <div className="flex flex-col items-end">
                    <span className="text-slate-200 text-sm font-medium">
                      {m.away.name}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {m.away.abbreviation}
                    </span>
                  </div>
                  {m.away.logo_url && (
                    <img
                      src={m.away.logo_url}
                      alt={m.away.name}
                      className="w-9 h-9 rounded-full border border-slate-700 object-contain"
                    />
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  disabled={homeUsed || submitting || locked}
                  onClick={() => submitPick(m.home.id)}
                  className={`flex-1 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    currentPick === m.home.id
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/40"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                  } ${homeUsed ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {homeUsed ? "Used" : `Pick ${m.home.abbreviation}`}
                </button>

                <button
                  disabled={awayUsed || submitting || locked}
                  onClick={() => submitPick(m.away.id)}
                  className={`flex-1 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    currentPick === m.away.id
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/40"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                  } ${awayUsed ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {awayUsed ? "Used" : `Pick ${m.away.abbreviation}`}
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                {homeUsed || awayUsed ? (
                  <span>
                    {homeUsed && `You’ve already used ${m.home.name}. `}
                    {awayUsed && `You’ve already used ${m.away.name}.`}
                  </span>
                ) : (
                  <span>Both teams are available for selection.</span>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* Used Teams */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-3">Used Teams</h2>
        <p className="text-slate-400 text-sm">
          {usedTeams.length
            ? usedTeams.join(", ")
            : "You haven't used any teams yet."}
        </p>
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

