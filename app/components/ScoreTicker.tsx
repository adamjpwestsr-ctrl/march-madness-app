"use client";

import { useEffect, useState } from "react";

const SPORTS = {
  MLB: { path: "mlb", icon: "⚾️" },
  NBA: { path: "nba", icon: "🏀" },
  NFL: { path: "nfl", icon: "🏈" },
  NHL: { path: "nhl", icon: "🏒" },
  NCAAM: { path: "ncaam", icon: "🎓" },
  TENNIS: { path: "tennis", icon: "🎾" },
};

export default function ScoreTicker() {
  const [games, setGames] = useState<any[]>([]);

  const fetchAllSports = async () => {
    try {
      const all: any[] = [];

      // Fetch each sport feed from your backend
      for (const sport of Object.keys(SPORTS)) {
        const url = `/api/scoreboard/${SPORTS[sport as keyof typeof SPORTS].path}`;
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        if (data?.events?.length) all.push(...data.events);
      }

      // 🔹 Filter to last 48 hours
      const now = new Date();
      const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const recentGames = all.filter((game) => {
        const date = new Date(
          game.date || game.startDate || game.competitions?.[0]?.startDate
        );
        return date >= cutoff;
      });

      setGames(recentGames);
    } catch (err) {
      console.error("Ticker load failed:", err);
      setGames([]);
    }
  };

  useEffect(() => {
    fetchAllSports();
    const refresh = setInterval(fetchAllSports, 60000);
    return () => clearInterval(refresh);
  }, []);

  const marqueeGames = [...games, ...games];

  return (
    <div className="relative w-full overflow-hidden py-2 min-h-[40px] bg-slate-900/60 border-t border-b border-slate-800 backdrop-blur group">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-slate-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />

      {marqueeGames.length === 0 ? (
        <div className="text-slate-500 text-sm px-6">
          No recent or live scores available.
        </div>
      ) : (
        <div
          key={games.length}
          className="flex items-center gap-8 whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused] w-full"
        >
          {marqueeGames.map((game: any) => {
            const comp = game.competitions?.[0];
            const home = comp?.competitors?.find(
              (c: any) => c.homeAway === "home"
            );
            const away = comp?.competitors?.find(
              (c: any) => c.homeAway === "away"
            );

            const sportKey = Object.keys(SPORTS).find((s) =>
              game?.league?.slug?.includes(
                SPORTS[s as keyof typeof SPORTS].path
              )
            ) as keyof typeof SPORTS;
            const icon = sportKey ? SPORTS[sportKey].icon : "🏆";

            const isLive = game.status?.type?.state === "in";
            const isFinal = game.status?.type?.state === "post";
            const isUpcoming = game.status?.type?.state === "pre";

            return (
              <div
                key={`${game.id}-${Math.random()}`}
                className="flex items-center gap-3 px-6 text-sm text-slate-300"
              >
                {/* Sport icon */}
                <span className="text-xl">{icon}</span>

                {/* Away logo */}
                {away?.team?.logo && (
                  <img
                    src={away.team.logo}
                    alt={away.team.displayName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span>{away?.team?.abbreviation}</span>
                <span className="font-bold text-white">{away?.score}</span>

                <span className="text-slate-500">vs</span>

                {/* Home logo */}
                {home?.team?.logo && (
                  <img
                    src={home.team.logo}
                    alt={home.team.displayName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span>{home?.team?.abbreviation}</span>
                <span className="font-bold text-white">{home?.score}</span>

                {/* Status */}
                {isLive && (
                  <span className="flex items-center gap-1 text-red-400 font-semibold">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    LIVE
                  </span>
                )}
                {isFinal && (
                  <span className="text-slate-400 text-xs font-semibold">
                    FINAL
                  </span>
                )}
                {isUpcoming && (
                  <span className="text-slate-500 text-xs">
                    {game.status?.type?.shortDetail}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Animation */}
      <style jsx>{`
        .animate-ticker {
          animation: ticker 120s linear infinite; /* 🐢 Slower speed */
        }
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
