"use client";

import { useEffect, useState } from "react";

const SPORTS = {
  MLB: { path: "baseball/mlb", icon: "⚾️" },
  NBA: { path: "basketball/nba", icon: "🏀" },
  NFL: { path: "football/nfl", icon: "🏈" },
  NHL: { path: "hockey/nhl", icon: "🏒" },
  NCAAM: { path: "basketball/mens-college-basketball", icon: "🎓" },
};

export default function ScoreTicker() {
  const [sportIndex, setSportIndex] = useState(0);
  const [games, setGames] = useState<any[]>([]);
  const sportKeys = Object.keys(SPORTS) as (keyof typeof SPORTS)[];

  const fetchScores = async () => {
    const sport = sportKeys[sportIndex];
    try {
      // ✅ ESPN v1 endpoint (still active)
      const url = `https://site.api.espn.com/apis/site/v1/sports/${SPORTS[sport].path}/scoreboard`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();

      if (!data?.events?.length) {
        console.warn("No events found for", sport);
        setGames([]);
        return;
      }

      setGames(data.events);
    } catch (err) {
      console.error("Ticker load failed:", err);
      setGames([]);
    }
  };

  useEffect(() => {
    fetchScores();

    const rotate = setInterval(() => {
      setSportIndex((i) => (i + 1) % sportKeys.length);
    }, 20000);

    const refresh = setInterval(fetchScores, 60000);

    // second pull after mount to catch late data
    setTimeout(fetchScores, 5000);

    return () => {
      clearInterval(rotate);
      clearInterval(refresh);
    };
  }, [sportIndex]);

  const marqueeGames = [...games, ...games];

  return (
    <div className="relative w-full overflow-hidden py-2 min-h-[40px] bg-slate-900/60 border-t border-b border-slate-800 backdrop-blur group">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-slate-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />

      {marqueeGames.length === 0 ? (
        <div className="text-slate-500 text-sm px-6">No live scores available.</div>
      ) : (
        <div
          key={sportIndex}
          className="flex items-center gap-8 whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused]"
        >
          {marqueeGames.map((game: any) => {
            const comp = game.competitions?.[0];
            const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
            const away = comp?.competitors?.find((c: any) => c.homeAway === "away");

            const isLive = game.status?.type?.state === "in";
            const isFinal = game.status?.type?.state === "post";
            const isUpcoming = game.status?.type?.state === "pre";

            const sport = sportKeys[sportIndex];
            const icon = SPORTS[sport].icon;

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
                  <span className="text-slate-400 text-xs font-semibold">FINAL</span>
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
