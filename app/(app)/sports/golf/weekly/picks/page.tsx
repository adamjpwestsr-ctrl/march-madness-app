"use client";

import { useEffect, useState } from "react";

export default function GolfWeeklyPicksPage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/golf/weekly/state");
      const data = await res.json();
      setState(data);
      setLoading(false);
    }
    load();
  }, []);

  async function submitPick(golferId: number) {
    setSubmitting(true);

    await fetch("/api/golf/weekly/pick", {
      method: "POST",
      body: JSON.stringify({ golferId }),
    });

    const res = await fetch("/api/golf/weekly/state");
    setState(await res.json());
    setSubmitting(false);
  }

  if (loading) return <p className="text-slate-400">Loading golfers…</p>;

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-semibold mb-2">Golf Weekly Picks</h1>
        <p className="text-slate-400">
          Select your golfer for this week's PGA event.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {state.golfers.map((g: any) => {
          const isPick = state.currentPick?.golferId === g.id;

          return (
            <button
              key={g.id}
              disabled={submitting || state.locked}
              onClick={() => submitPick(g.id)}
              className={`p-4 rounded-xl border text-left ${
                isPick
                  ? "bg-emerald-600 border-emerald-500"
                  : "bg-slate-900/40 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-4">
                {g.photo ? (
                  <img
                    src={g.photo}
                    alt={g.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-700" />
                )}

                <div>
                  <p className="text-lg font-medium">{g.name}</p>
                  <p className="text-slate-400 text-sm">{g.country}</p>
                  <p className="text-slate-500 text-xs">
                    World Rank: {g.rank}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">Your Pick</h2>
        <p className="text-slate-400">
          {state.currentPick
            ? state.currentPick.name
            : "You haven't made a pick yet."}
        </p>
      </section>
    </div>
  );
}
