"use client";

import { useEffect, useState } from "react";

export default function NFLWeeklyPicksPage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/nfl/weekly/state");
      const data = await res.json();
      setState(data);
      setLoading(false);
    }
    load();
  }, []);

  async function submitPick(teamId: number) {
    setSubmitting(true);

    await fetch("/api/nfl/weekly/pick", {
      method: "POST",
      body: JSON.stringify({ teamId }),
    });

    const res = await fetch("/api/nfl/weekly/state");
    setState(await res.json());
    setSubmitting(false);
  }

  if (loading) return <p className="text-slate-400">Loading matchups…</p>;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-semibold mb-2">NFL Weekly Picks</h1>
        <p className="text-slate-400">
          Choose one team for this week. You cannot reuse teams from previous weeks.
        </p>
      </section>

      {/* Matchup Grid */}
      <section className="grid gap-6 md:grid-cols-2">
        {state.matchups.map((m: any) => {
          const homeUsed = state.usedTeamIds.includes(m.home.id);
          const awayUsed = state.usedTeamIds.includes(m.away.id);

          const isCurrentPick = (teamId: number) =>
            state.currentPick?.teamId === teamId;

          return (
            <div
              key={m.id}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-slate-300">{m.home.name}</span>
                  <span className="text-slate-500 text-sm">{m.home.abbrev}</span>
                </div>

                <span className="text-slate-500 text-sm">vs</span>

                <div className="flex flex-col">
                  <span className="text-slate-300">{m.away.name}</span>
                  <span className="text-slate-500 text-sm">{m.away.abbrev}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  disabled={homeUsed || submitting || state.locked}
                  onClick={() => submitPick(m.home.id)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isCurrentPick(m.home.id)
                      ? "bg-emerald-600 border-emerald-500"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                  } ${
                    homeUsed ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  Pick {m.home.abbrev}
                </button>

                <button
                  disabled={awayUsed || submitting || state.locked}
                  onClick={() => submitPick(m.away.id)}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    isCurrentPick(m.away.id)
                      ? "bg-emerald-600 border-emerald-500"
                      : "bg-slate-800 border-slate-700 hover:bg-slate-700"
                  } ${
                    awayUsed ? "opacity-40 cursor-not-allowed" : ""
                  }`}
                >
                  Pick {m.away.abbrev}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Used Teams */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">Used Teams</h2>
        <p className="text-slate-400">
          {state.usedTeams.length
            ? state.usedTeams.join(", ")
            : "You haven't used any teams yet."}
        </p>
      </section>
    </div>
  );
}
