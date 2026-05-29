"use client";

import { useEffect, useState } from "react";

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

export default function NFLWeeklyPicksPage() {
  const [state, setState] = useState<WeeklyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/nfl/weekly/state");
      const data = await res.json();
      setState(data);
      setLoading(false);
    }
    load();
  }, []);

  async function submitPick(teamId: string) {
    if (!state || state.locked) return;
    setSubmitting(true);

    await fetch("/api/nfl/weekly/pick", {
      method: "POST",
      body: JSON.stringify({ teamId }),
    });

    const res = await fetch("/api/nfl/weekly/state");
    const data = await res.json();
    setState(data);
    setSubmitting(false);

    const pickedTeam =
      data.matchups
        .flatMap((m: Matchup) => [m.home, m.away])
        .find((t: Team) => t.id === teamId) || null;

    setToast(
      pickedTeam
        ? `You picked ${pickedTeam.name} for Week ${data.week}`
        : "Pick updated"
    );
    setTimeout(() => setToast(null), 2500);
  }

  if (loading || !state) {
    return <p className="text-slate-400 text-sm">Loading matchups…</p>;
  }

  return (
    <div className="min-h-screen text-white flex flex-col gap-8">
      {/* Header */}
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold mb-1">NFL Weekly Picks</h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Choose one team for Week {state.week}. You cannot reuse teams from
          previous weeks, and picks may lock before kickoff.
        </p>
        <div className="text-xs text-slate-500">
          Status:{" "}
          <span
            className={
              state.locked ? "text-red-400 font-medium" : "text-emerald-400"
            }
          >
            {state.locked ? "Locked" : "Open for picks"}
          </span>
        </div>
      </section>

      {/* Matchup Grid */}
      <section className="grid gap-6 md:grid-cols-2">
        {state.matchups.map((m) => {
          const homeUsed = state.usedTeamIds.includes(m.home.id);
          const awayUsed = state.usedTeamIds.includes(m.away.id);
          const currentId = state.currentPick?.selected_team_id ?? null;

          const isCurrentPick = (teamId: string) => currentId === teamId;

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

              <div className="flex gap-3">
                <button
                  disabled={homeUsed || submitting || state.locked}
                  onClick={() => submitPick(m.home.id)}
                  className={`flex-1 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    isCurrentPick(m.home.id)
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-500/40"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                  } ${homeUsed ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {homeUsed ? "Used" : `Pick ${m.home.abbreviation}`}
                </button>

                <button
                  disabled={awayUsed || submitting || state.locked}
                  onClick={() => submitPick(m.away.id)}
                  className={`flex-1 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                    isCurrentPick(m.away.id)
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
          {state.usedTeams.length
            ? state.usedTeams.join(", ")
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
