"use client";

import { useEffect, useState } from "react";

const SPORTS = {
  NBA: "basketball/nba",
  NFL: "football/nfl",
  MLB: "baseball/mlb",
  NHL: "hockey/nhl",
  NCAAM: "basketball/mens-college-basketball",
};

export default function ScoreTicker() {
  const [sportIndex, setSportIndex] = useState(0);
  const [games, setGames] = useState<any[]>([]);
  const sportKeys = Object.keys(SPORTS) as (keyof typeof SPORTS)[];

  const fetchScores = async () => {
    const sport = sportKeys[sportIndex];
    try {
      const url = `https://site.api.espn.com/apis/v2/sports/${SPORTS[sport]}/scoreboard`;
      const res = await fetch(url);
      const data = await res.json();
      setGames(data?.events || []);
    } catch {
      setGames([]);
    }
  };

  useEffect(() => {
    fetchScores();

    const rotate = setInterval(() => {
      setSportIndex((i) => (i + 1) % sportKeys.length);
    }, 20000);

    const refresh = setInterval(fetchScores, 60000);

    return () => {
      clearInterval(rotate);
      clearInterval(refresh);
    };
  }, [sportIndex]);

  // Duplicate list for seamless marquee
  const marqueeGames = [...games, ...games];

  return (
    <div className="relative w-full overflow-hidden py-2 bg-slate-900/60 border-t border-b border-slate-800 backdrop-blur">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-slate-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />

      {/* Marquee */}
      <div className="flex items-center gap-6 whitespace-nowrap animate-ticker">
        {marqueeGames.map((game: any) => {
          const comp = game.competitions?.[0];
          const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
          const away = comp?.competitors?.find((c: any) => c.homeAway === "away");

          const isLive = game.status?.type?.state === "in";

          return (
            <div
              key={`${game.id}-${Math.random()}`}
              className="flex items-center gap-3 px-6 text-sm text-slate-300"
            >
              {/* Sport tag */}
              <span className="text-emerald-400 font-semibold uppercase tracking-wide">
                {sportKeys[sportIndex]}
              </span>

              {/* Away */}
              <span>{away?.team?.abbreviation}</span>
              <span className="font-bold text-white">{away?.score}</span>

              <span className="text-slate-500">vs</span>

              {/* Home */}
              <span>{home?.team?.abbreviation}</span>
              <span className="font-bold text-white">{home?.score}</span>

              {/* Status */}
              {isLive ? (
                <span className="flex items-center gap-1 text-red-400 font-semibold">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  LIVE
                </span>
              ) : (
                <span className="text-slate-500 text-xs">
                  {game.status?.type?.shortDetail}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-ticker {
          animation: ticker 40s linear infinite;
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
