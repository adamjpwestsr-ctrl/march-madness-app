"use client";

import { useEffect, useState } from "react";

type GolfCompetitor = {
  id: string;
  athlete?: {
    shortName?: string;
    headshot?: string;
  };
  score: string | number;
  statistics?: { name: string; value: string | number }[];
};

type GolfEvent = {
  id: string;
  name: string;
  competitions?: {
    competitors?: GolfCompetitor[];
  }[];
};

export default function GolfScoreboardPage() {
  const [events, setEvents] = useState<GolfEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGolfScores = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scoreboard/GOLF", { cache: "no-store" });
      const data = await res.json();
      setEvents(data?.events || []);
    } catch (err) {
      console.error("Golf scoreboard error:", err);
      setEvents([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGolfScores();
    const interval = setInterval(fetchGolfScores, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold text-white">
        Golf Scoreboard
      </h1>
      <p className="text-slate-400 text-sm">
        Live leaderboard and tournament updates.
      </p>

      {loading ? (
        <p className="text-slate-400">Loading scores...</p>
      ) : events.length === 0 ? (
        <p className="text-slate-400">No active tournaments.</p>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <GolfTournamentCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function GolfTournamentCard({ event }: { event: GolfEvent }) {
  const comp = event.competitions?.[0];
  const players = (comp?.competitors || []) as GolfCompetitor[];

  // Normalize leaderboard
  const leaderboard = players
    .map((p) => {
      const thruStat = p.statistics?.find((s) => s.name === "thru");
      const scoreNum = Number(p.score);
      return {
        id: p.id,
        athlete: p.athlete,
        score: isNaN(scoreNum) ? p.score : scoreNum,
        thru: thruStat?.value ?? "-",
      };
    })
    .sort((a, b) => {
      const aScore = typeof a.score === "number" ? a.score : 999;
      const bScore = typeof b.score === "number" ? b.score : 999;
      return aScore - bScore;
    });

  const topFive = leaderboard.slice(0, 5);

  return (
    <section className="rounded-xl bg-slate-800/60 border border-white/10 p-5 shadow-xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide">
          Current Tournament
        </p>
        <h2 className="text-lg md:text-xl font-semibold text-white">
          {event.name}
        </h2>
      </div>

      {/* Top 5 Leaderboard */}
      {topFive.length > 0 && (
        <div className="rounded-lg bg-slate-900/60 border border-white/10 p-4 shadow-inner">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Top 5 Leaderboard
          </h3>

          <div className="space-y-3">
            {topFive.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs w-4">
                    {idx + 1}
                  </span>

                  {p.athlete?.headshot && (
                    <img
                      src={p.athlete.headshot}
                      alt={p.athlete.shortName || ""}
                      className="w-7 h-7 rounded-full"
                    />
                  )}

                  <span className="text-slate-200 text-sm">
                    {p.athlete?.shortName || "Unknown"}
                  </span>
                </div>

                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      typeof p.score === "number"
                        ? p.score < 0
                          ? "text-emerald-400"
                          : p.score > 0
                          ? "text-red-400"
                          : "text-slate-300"
                        : "text-slate-300"
                    }`}
                  >
                    {p.score}
                  </p>
                  <p className="text-xs text-slate-500">
                    Thru {p.thru || "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="rounded-lg bg-slate-900/40 border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">
            Full Leaderboard
          </h3>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {leaderboard.map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 py-1"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs w-4">
                    {idx + 1}
                  </span>

                  {p.athlete?.headshot && (
                    <img
                      src={p.athlete.headshot}
                      alt={p.athlete.shortName || ""}
                      className="w-6 h-6 rounded-full"
                    />
                  )}

                  <span className="text-slate-200 text-xs md:text-sm">
                    {p.athlete?.shortName || "Unknown"}
                  </span>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xs md:text-sm font-semibold ${
                      typeof p.score === "number"
                        ? p.score < 0
                          ? "text-emerald-400"
                          : p.score > 0
                          ? "text-red-400"
                          : "text-slate-300"
                        : "text-slate-300"
                    }`}
                  >
                    {p.score}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Thru {p.thru || "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
