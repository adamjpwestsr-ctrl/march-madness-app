"use client";

import { useEffect, useState } from "react";

export default function ScoreTicker() {
  const [games, setGames] = useState<any[]>([]);

  const fetchScores = async () => {
    try {
      const res = await fetch("/api/scoreboard/all", { cache: "no-store" });
      if (!res.ok) {
        console.error("Scoreboard API error:", res.status);
        setGames([]);
        return;
      }

      const data = await res.json();
      const events = data?.events || [];

      console.log("RAW EVENTS COUNT:", events.length);
      console.log("RAW SAMPLE:", events.slice(0, 10));

      setGames(events);
    } catch (err) {
      console.error("Unified scoreboard error:", err);
      setGames([]);
    }
  };

  useEffect(() => {
    fetchScores();
    const refresh = setInterval(fetchScores, 60000);
    return () => clearInterval(refresh);
  }, []);

  return (
    <div className="relative w-full overflow-hidden py-2 min-h-[40px] bg-slate-900/60 border-t border-b border-slate-800 backdrop-blur">
      <div className="w-full overflow-hidden">
        {games.length === 0 ? (
          <div className="text-slate-500 text-sm px-6">
            No recent or live scores available.
          </div>
        ) : (
          <div
            key={games.length}
            className="flex items-center gap-8 whitespace-nowrap animate-ticker w-[100vw] max-w-[100vw] overflow-hidden"
          >
            {games.map((game: any) => {
              const leagueSlug =
                game?.league?.slug ||
                game?.league?.name ||
                "unknown-league";

              const label =
                game.label ||
                game.name ||
                game.shortName ||
                game.id ||
                "Unknown event";

              return (
                <div
                  key={game.id || `${leagueSlug}-${label}`}
                  className="flex items-center gap-3 px-6 text-sm text-slate-300"
                >
                  <span className="font-semibold text-white">
                    {leagueSlug}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-ticker {
          animation: ticker 60s linear infinite;
        }
        @keyframes ticker {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
