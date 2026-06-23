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

    // Rotate sports every 20 seconds
    const rotate = setInterval(() => {
      setSportIndex((i) => (i + 1) % sportKeys.length);
    }, 20000);

    // Refresh scores every 60 seconds
    const refresh = setInterval(fetchScores, 60000);

    return () => {
      clearInterval(rotate);
      clearInterval(refresh);
    };
  }, [sportIndex]);

  return (
    <div className="w-full overflow-hidden border-t border-b border-slate-800 bg-slate-900/60 backdrop-blur py-2">
      <div className="flex items-center gap-4 animate-ticker whitespace-nowrap">
        {games.map((game: any) => {
          const comp = game.competitions?.[0];
          const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
          const away = comp?.competitors?.find((c: any) => c.homeAway === "away");

          const isLive = game.status?.type?.state === "in";

          return (
            <div
              key={game.id}
              className="flex items-center gap-2 px-6 text-sm text-slate-300"
            >
              {/* Sport tag */}
              <span className="text-emerald-400 font-semibold">
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

      {/* Animation keyframes */}
      <style jsx>{`
        .animate-ticker {
          animation: ticker 40s linear infinite;
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
