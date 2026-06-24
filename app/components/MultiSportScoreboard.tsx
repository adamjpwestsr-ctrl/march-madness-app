"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

const SPORTS = {
  GOLF: "golf/pga",
  NBA: "basketball/nba",
  NFL: "football/nfl",
  MLB: "baseball/mlb",
  NHL: "hockey/nhl",
  NCAAM: "basketball/mens-college-basketball",
};

export default function MultiSportScoreboard() {
  const [sport, setSport] = useState<keyof typeof SPORTS>("NBA");
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scoreboard/${sport}`, { cache: "no-store" });
      const data = await res.json();
      setGames(data?.events || []);
    } catch (err) {
      console.error("Scoreboard error:", err);
      setGames([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScores();
    const interval = setInterval(fetchScores, 60000);
    return () => clearInterval(interval);
  }, [sport]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Trophy size={18} className="text-emerald-400" />
        <h2 className="text-lg font-semibold text-white">Live Scoreboard</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.keys(SPORTS).map((key) => (
          <button
            key={key}
            onClick={() => setSport(key as keyof typeof SPORTS)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition
              ${
                sport === key
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-800/40 text-slate-400 hover:bg-slate-800/60"
              }
            `}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Scoreboard */}
      {loading ? (
        <p className="text-slate-400 text-sm">Loading scores...</p>
      ) : games.length === 0 ? (
        <p className="text-slate-400 text-sm">No games available.</p>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {games.map((game: any) => {
            // GOLF SPECIAL HANDLING
            if (sport === "GOLF") {
              return <GolfScoreCard key={game.id} game={game} />;
            }

            // TEAM SPORTS (existing layout)
            const comp = game.competitions?.[0];
            const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
            const away = comp?.competitors?.find((c: any) => c.homeAway === "away");

            const homeColor = `#${home?.team?.color || "ffffff"}`;
            const awayColor = `#${away?.team?.color || "ffffff"}`;

            return (
              <div
                key={game.id}
                className="min-w-[240px] rounded-xl bg-slate-800/60 border border-white/5 p-4 shadow hover:shadow-md transition-all"
              >
                <p className="text-xs text-slate-400 mb-2">{game.shortName}</p>

                {/* Away Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={away?.team?.logo}
                      alt={away?.team?.abbreviation}
                      className="w-6 h-6 rounded"
                    />
                    <span className="text-slate-300">{away?.team?.abbreviation}</span>
                  </div>
                  <span className="text-white font-semibold">{away?.score}</span>
                </div>

                {/* Home Team */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={home?.team?.logo}
                      alt={home?.team?.abbreviation}
                      className="w-6 h-6 rounded"
                    />
                    <span className="text-slate-300">{home?.team?.abbreviation}</span>
                  </div>
                  <span className="text-white font-semibold">{home?.score}</span>
                </div>

                {/* Status */}
                <p className="text-xs text-slate-500 mt-3">
                  {game.status?.type?.shortDetail}
                </p>

                {/* Color bars */}
                <div className="flex mt-3 h-1 rounded overflow-hidden">
                  <div className="flex-1" style={{ backgroundColor: awayColor }} />
                  <div className="flex-1" style={{ backgroundColor: homeColor }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------
   GOLF SCORECARD COMPONENT
------------------------------ */
function GolfScoreCard({ game }: { game: any }) {
  const comp = game.competitions?.[0];
  const players = comp?.competitors || [];

  return (
    <div className="min-w-[260px] rounded-xl bg-slate-800/60 border border-white/5 p-4 shadow hover:shadow-md transition-all">
      <p className="text-xs text-slate-400 mb-3">{game.name}</p>

      <div className="space-y-3">
        {players.map((p: any) => {
          const score = p.score; // e.g. -5, E, +2
          const thru = p.statistics?.find((s: any) => s.name === "thru")?.value;
          const pos = p.order; // leaderboard position

          return (
            <div key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={p.athlete?.headshot}
                  alt={p.athlete?.shortName}
                  className="w-7 h-7 rounded-full"
                />
                <span className="text-slate-200 text-sm">{p.athlete?.shortName}</span>
              </div>

              <div className="text-right">
                <p className="text-white font-semibold">{score}</p>
                <p className="text-xs text-slate-500">Thru {thru || "-"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
