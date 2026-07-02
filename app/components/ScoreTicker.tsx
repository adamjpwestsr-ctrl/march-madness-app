"use client";

import { useEffect, useState } from "react";

const SPORTS = {
  MLB: { slug: "mlb", icon: "⚾️" },
  NBA: { slug: "nba", icon: "🏀" },
  NFL: { slug: "nfl", icon: "🏈" },
  NHL: { slug: "nhl", icon: "🏒" },
  NCAAM: { slug: "mens-college-basketball", icon: "🎓🏀" },
  GOLF: { slug: "pga", icon: "⛳" },
  TENNIS_ATP: { slug: "atp", icon: "🎾" },
  EPL: { slug: "eng.1", icon: "⚽" },
  MLS: { slug: "usa.1", icon: "⚽" },
  UCL: { slug: "uefa.1", icon: "⚽" },
  FIFA: { slug: "fifa.worldcup", icon: "⚽" },
  F1: { slug: "f1", icon: "🏎️" },
  INDY: { slug: "indycar", icon: "🏎️" },
  NASCAR: { slug: "nascar.cup", icon: "🏁" },
} as const;

type SportKey = keyof typeof SPORTS;

export default function ScoreTicker() {
  const [games, setGames] = useState<any[]>([]);

  const fetchScores = async () => {
    try {
      const res = await fetch("/api/scoreboard/all", { cache: "no-store" });
      if (!res.ok) return setGames([]);

      const data = await res.json();
      const events = data?.events || [];

      const now = new Date();
      const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const buffer = new Date(now.getTime() + 6 * 60 * 60 * 1000);

      const recent = events.filter((game: any) => {
        const date = new Date(
          game.date ||
            game.startDate ||
            game.competitions?.[0]?.startDate
        );
        return date >= cutoff && date <= buffer;
      });

      setGames(recent);
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
    <div className="relative w-full overflow-hidden py-2 min-h-[40px] bg-slate-900/60 border-t border-b border-slate-800 backdrop-blur group">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 w-16 h-full bg-gradient-to-r from-slate-900 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-16 h-full bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />

      <div className="w-full overflow-hidden">
        {games.length === 0 ? (
          <div className="text-slate-500 text-sm px-6">
            No recent or live scores available.
          </div>
        ) : (
          <div
            key={games.length}
            className="flex items-center gap-8 whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused] w-[100vw] max-w-[100vw] overflow-hidden"
          >
            {games.map((game: any) => {
              const comp = game.competitions?.[0];
              const home = comp?.competitors?.find(
                (c: any) => c.homeAway === "home"
              );
              const away = comp?.competitors?.find(
                (c: any) => c.homeAway === "away"
              );

              // 🔍 Robust slug detection
              const slugCandidates = [
                game?.league?.slug,
                game?.league?.name,
                comp?.sport?.slug,
                comp?.sport?.name,
                comp?.league?.slug,
                comp?.league?.name,
              ]
                .filter(Boolean)
                .map((s: string) => s.toLowerCase());

              const sportKey = (Object.keys(SPORTS) as SportKey[]).find((k) =>
                slugCandidates.some((slug) =>
                  slug.includes(SPORTS[k].slug.toLowerCase())
                )
              );

              const icon = sportKey ? SPORTS[sportKey].icon : "🏆";

              const isLive = game.status?.type?.state === "in";
              const isFinal = game.status?.type?.state === "post";
              const isUpcoming = game.status?.type?.state === "pre";

              return (
                <div
                  key={`${game.id}-${Math.random()}`}
                  className="flex items-center gap-3 px-6 text-sm text-slate-300"
                >
                  <span className="text-xl">{icon}</span>

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

                  {home?.team?.logo && (
                    <img
                      src={home.team.logo}
                      alt={home.team.displayName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span>{home?.team?.abbreviation}</span>
                  <span className="font-bold text-white">{home?.score}</span>

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
      </div>

      <style jsx>{`
        .animate-ticker {
          animation: ticker 120s linear infinite;
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
