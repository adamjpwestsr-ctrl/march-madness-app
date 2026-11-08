"use client";

import { useEffect, useState } from "react";

export default function CollegeSportsTicker() {
  const [games, setGames] = useState<any[]>([]);

  const resolveDate = (game: any) => {
    return (
      game.date ||
      game.startDate ||
      game.endDate ||
      game.competitions?.[0]?.startDate ||
      game.competitions?.[0]?.date ||
      null
    );
  };

  const parseDate = (raw: string) => {
    if (!raw) return null;
    let cleaned = raw.replace(/\.\d+$/, "");
    if (/^\d{8}T\d{6}Z$/.test(cleaned)) {
      cleaned =
        `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}T${cleaned.slice(9, 11)}:${cleaned.slice(11, 13)}:${cleaned.slice(13, 15)}Z`;
    }
    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d;
  };

  const fetchCollegeScores = async () => {
    try {
      const urls = [
        "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard",
        "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard",
      ];

      const all = await Promise.all(
        urls.map((u) =>
          fetch(u, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
              Accept: "application/json",
            },
          }).then((r) => r.json())
        )
      );

      const merged = all.flatMap((d) => d.events || []);
      const now = new Date();
      const cutoff = new Date(now.getTime() - 120 * 60 * 60 * 1000);
      const buffer = new Date(now.getTime() + 12 * 60 * 60 * 1000);

      const recent = merged.filter((game: any) => {
        const rawDate = resolveDate(game);
        if (!rawDate) return false;
        const d = parseDate(rawDate);
        return d && d >= cutoff && d <= buffer;
      });

      setGames(recent);
    } catch (err) {
      console.error("College scoreboard error:", err);
      setGames([]);
    }
  };

  useEffect(() => {
    fetchCollegeScores();
    const refresh = setInterval(fetchCollegeScores, 60000);
    return () => clearInterval(refresh);
  }, []);

  return (
    <div className="relative w-full overflow-hidden py-2 min-h-[42px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-yellow-500/30 shadow-[0_0_20px_rgba(250,204,21,0.25)] backdrop-blur-md group">
      {/* Gradient edges for depth */}
      <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />

      <div className="w-full overflow-hidden">
        {games.length === 0 ? (
          <div className="text-yellow-400/70 text-sm px-6 font-medium tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            No recent or live college scores available.
          </div>
        ) : (
          <div className="flex items-center gap-10 whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused] w-full min-w-full">
            {games.map((game: any) => {
              const comp = game.competitions?.[0];
              const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
              const away = comp?.competitors?.find((c: any) => c.homeAway === "away");
              if (!home?.team || !away?.team) return null;

              const isLive = game.status?.type?.state === "in";
              const isFinal = game.status?.type?.state === "post";
              const isUpcoming = game.status?.type?.state === "pre";

              const sportSlug =
                (game.league?.slug ||
                  game.league?.name ||
                  comp?.sport?.slug ||
                  comp?.sport?.name ||
                  "")
                  .toLowerCase();

              const sportIcon = sportSlug.includes("basketball") ? "🏀" : "🏈";

              return (
                <div
                  key={game.id}
                  className="flex items-center gap-3 px-6 text-sm text-slate-200 font-medium bg-slate-900/40 rounded-lg shadow-[0_0_10px_rgba(250,204,21,0.15)]"
                >
                  <span className="text-lg">{sportIcon}</span>

                  {away.team.logo && (
                    <img
                      src={away.team.logo}
                      alt={away.team.displayName}
                      className="w-5 h-5 rounded-full object-cover border border-slate-700"
                    />
                  )}
                  <span className="text-yellow-400 font-semibold">{away.team.abbreviation}</span>
                  <span className="font-bold text-white">{away.score}</span>

                  <span className="text-slate-500">vs</span>

                  {home.team.logo && (
                    <img
                      src={home.team.logo}
                      alt={home.team.displayName}
                      className="w-5 h-5 rounded-full object-cover border border-slate-700"
                    />
                  )}
                  <span className="text-yellow-400 font-semibold">{home.team.abbreviation}</span>
                  <span className="font-bold text-white">{home.score}</span>

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
      </div>

      <style jsx>{`
        .animate-ticker {
          animation: ticker 45s linear infinite;
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
