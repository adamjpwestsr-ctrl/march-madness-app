
"use client";

import { useEffect, useState } from "react";

type TickerGame = {
  id: string;
  _sport: "basketball" | "football";
  [key: string]: any;
};

export default function CollegeSportsTicker() {
  const [games, setGames] = useState<TickerGame[]>([]);

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

    const date = new Date(cleaned);

    return isNaN(date.getTime()) ? null : date;
  };

  const fetchCollegeScores = async () => {
    const now = new Date();

    // Preserve the original 120-hour lookback.
    const cutoff = new Date(
      now.getTime() - 120 * 60 * 60 * 1000
    );

    // Preserve the original 12-hour lookahead.
    const buffer = new Date(
      now.getTime() + 12 * 60 * 60 * 1000
    );

    const sports = [
      {
        sport: "basketball" as const,
        url: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard",
      },
      {
        sport: "football" as const,
        url: "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard",
      },
    ];

    try {
      // Use the original ESPN scoreboard URLs without additional
      // query parameters. Tag each event using its source endpoint
      // so the correct sport icon always displays.
      const results = await Promise.all(
        sports.map(async (sportConfig) => {
          try {
            const response = await fetch(sportConfig.url, {
              cache: "no-store",
            });

            if (!response.ok) {
              console.error(
                `ESPN ${sportConfig.sport} request failed:`,
                response.status
              );

              return [];
            }

            const data = await response.json();

            return (data.events || []).map((game: any) => ({
              ...game,
              _sport: sportConfig.sport,
            }));
          } catch (error) {
            console.error(
              `ESPN ${sportConfig.sport} request error:`,
              error
            );

            return [];
          }
        })
      );

      // Combine both sports and remove duplicate events.
      const uniqueGames = new Map<string, TickerGame>();

      results.flat().forEach((game: TickerGame) => {
        uniqueGames.set(
          `${game._sport}-${game.id}`,
          game
        );
      });

      const merged = Array.from(uniqueGames.values());

      // Keep only games in the original time window.
      const recent = merged.filter((game) => {
        const rawDate = resolveDate(game);

        if (!rawDate) return false;

        const date = parseDate(rawDate);

        return date && date >= cutoff && date <= buffer;
      });

      // Sort games chronologically.
      recent.sort((a, b) => {
        const dateA =
          parseDate(resolveDate(a))?.getTime() ?? 0;

        const dateB =
          parseDate(resolveDate(b))?.getTime() ?? 0;

        return dateA - dateB;
      });

      console.log("College ticker results:", {
        totalReturned: merged.length,
        totalDisplayed: recent.length,
        basketball: recent.filter(
          (game) => game._sport === "basketball"
        ).length,
        football: recent.filter(
          (game) => game._sport === "football"
        ).length,
      });

      setGames(recent);
    } catch (error) {
      console.error("College scoreboard error:", error);
    }
  };

  useEffect(() => {
    fetchCollegeScores();

    const refresh = window.setInterval(
      fetchCollegeScores,
      60000
    );

    return () => window.clearInterval(refresh);
  }, []);

  // Give longer lists more time to scroll across the ticker.
  const animationDuration = Math.max(45, games.length * 5);

  return (
    <div className="relative w-full overflow-hidden py-2 min-h-[42px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-y border-yellow-500/30 shadow-[0_0_20px_rgba(250,204,21,0.25)] backdrop-blur-md group">

      <div className="absolute left-0 top-0 z-10 w-24 h-full bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />

      <div className="absolute right-0 top-0 z-10 w-24 h-full bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />

      <div className="w-full overflow-hidden">
        {games.length === 0 ? (
          <div className="text-yellow-400/70 text-sm px-6 font-medium tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            No recent or live college scores available.
          </div>
        ) : (
          <div
            className="ticker-track flex w-max min-w-max items-center gap-10 whitespace-nowrap group-hover:[animation-play-state:paused]"
            style={{
              animationDuration: `${animationDuration}s`,
            }}
          >
            {games.map((game) => {
              const comp = game.competitions?.[0];

              const home = comp?.competitors?.find(
                (c: any) => c.homeAway === "home"
              );

              const away = comp?.competitors?.find(
                (c: any) => c.homeAway === "away"
              );

              if (!home?.team || !away?.team) return null;

              const isLive =
                game.status?.type?.state === "in";

              const isFinal =
                game.status?.type?.state === "post";

              const isUpcoming =
                game.status?.type?.state === "pre";

              // The source endpoint determines the sport.
              const sportIcon =
                game._sport === "basketball" ? "🏀" : "🏈";

              return (
                <div
                  key={`${game._sport}-${game.id}`}
                  className="flex shrink-0 items-center gap-3 px-6 text-sm text-slate-200 font-medium bg-slate-900/40 rounded-lg shadow-[0_0_10px_rgba(250,204,21,0.15)]"
                >
                  <span className="text-lg">{sportIcon}</span>

                  {away.team.logo && (
                    <img
                      src={away.team.logo}
                      alt={away.team.displayName}
                      className="w-5 h-5 rounded-full object-cover border border-slate-700"
                    />
                  )}

                  <span className="text-yellow-400 font-semibold">
                    {away.team.abbreviation}
                  </span>

                  <span className="font-bold text-white">
                    {away.score}
                  </span>

                  <span className="text-slate-500">vs</span>

                  {home.team.logo && (
                    <img
                      src={home.team.logo}
                      alt={home.team.displayName}
                      className="w-5 h-5 rounded-full object-cover border border-slate-700"
                    />
                  )}

                  <span className="text-yellow-400 font-semibold">
                    {home.team.abbreviation}
                  </span>

                  <span className="font-bold text-white">
                    {home.score}
                  </span>

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
        .ticker-track {
          animation-name: ticker;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-play-state: running;
        }

        @keyframes ticker {
          0% {
            transform: translateX(100vw);
          }

          100% {
            transform: translateX(-100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
