"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GolfWeeklyFullPickPage() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/golf/weekly/state");
      const data = await res.json();
      setState(data);
      setLoading(false);
    }
    load();
  }, []);

  async function submitPick(playerId: number) {
    setSubmitting(true);

    await fetch("/api/golf/weekly/pick", {
      method: "POST",
      body: JSON.stringify({ golferId: playerId }),
    });

    const res = await fetch("/api/golf/weekly/state");
    setState(await res.json());
    setSubmitting(false);

    setToast("Pick saved!");
    setTimeout(() => setToast(null), 2000);
  }

  if (loading) return <p className="text-slate-400">Loading players…</p>;

  const userPick = state.pick;

  const filteredGolfers = state.golfers.filter((g: any) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filteredGolfers.reduce((acc: any, golfer: any) => {
    const letter = golfer.name[0].toUpperCase();
    acc[letter] = acc[letter] || [];
    acc[letter].push(golfer);
    return acc;
  }, {});

  return (
    <div className="relative min-h-screen bg-[url('/images/golf-bg.jpg')] bg-cover bg-center bg-fixed bg-no-repeat">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 pointer-events-none" />

      <div className="relative backdrop-blur-sm bg-slate-950/70 min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-10">

          <Link
            href="/sports/golf/weekly"
            className="text-emerald-400 hover:text-emerald-300 transition-all duration-300"
          >
            ← Back to Weekly Dashboard
          </Link>

          <section className="opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Select Your Golfer
            </h1>
            <p className="text-slate-300 mt-2">
              Browse the full field and choose your golfer for this week’s event.
            </p>
          </section>

          <div className="opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
            <input
              type="text"
              placeholder="Search players…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 backdrop-blur-md shadow-lg transition-all duration-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-8">
            {Object.keys(grouped)
              .sort()
              .map((letter: string) => (
                <div
                  key={letter}
                  className="opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]"
                >
                  <h2 className="text-xl font-semibold text-white mb-4">
                    {letter}
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    {grouped[letter].map((g: any) => {
                      const isPick = userPick?.player_id === g.id;

                      return (
                        <button
                          key={g.id}
                          disabled={submitting}
                          onClick={() => submitPick(g.id)}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] hover:scale-[1.02] ${
                            isPick
                              ? "bg-emerald-600 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                              : "bg-slate-900/40 border-slate-800 hover:bg-slate-800"
                          }`}
                        >
                          {g.photo_url ? (
                            <img
                              src={g.photo_url}
                              alt={g.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-700" />
                          )}

                          <div className="text-left">
                            <p className="text-white font-medium">{g.name}</p>
                            <p className="text-slate-400 text-sm">{g.country}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl p-6 transition-all duration-300 opacity-0 translate-y-4 animate-[fadeUp_0.6s_ease-out_forwards]">
            <h2 className="text-xl font-semibold mb-4 text-white">Your Pick</h2>
            <p className="text-slate-300">
              {userPick
                ? state.golfers.find((g: any) => g.id === userPick.player_id)?.name
                : "You haven't made a pick yet."}
            </p>
          </section>
        </div>

        {toast && (
          <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg animate-[fadeUp_0.4s_ease-out_forwards]">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
