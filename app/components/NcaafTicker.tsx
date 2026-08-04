"use client";

import { useEffect, useState } from "react";
import { Flag } from "lucide-react";

export default async function NcaafTicker() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/ncaaf/ticker", { cache: "no-store" });
        const data = await res.json();
        setGames(data.events || []);
      } catch (err) {
        console.error("NCAAF ticker error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full py-3 text-slate-400 text-sm">
        Loading NCAA Football scores...
      </div>
    );
  }

  if (!games.length) {
    return (
      <div className="w-full py-3 text-slate-400 text-sm">
        No NCAA Football games available.
      </div>
    );
  }

  // ⭐ Duplicate list for seamless marquee scrolling
  const marqueeGames = [...games, ...games];

  return (
    <div className="overflow-hidden border border-slate-800 bg-slate-900/60 w-full">
      {/* ⭐ REQUIRED OUTER WRAPPER (same as ScoreTicker) */}
      <div className="overflow-hidden w-full">
        <div
          className="
            animate-marquee
            flex whitespace-nowrap gap-10 px-6 py-2
          "
        >
          {marqueeGames.map((g: any, idx: number) => (
            <div
              key={`${g.id}-${idx}`}
              className="flex items-center gap-4 text-slate-200 text-sm pr-4"
            >
              {/* Icon */}
              <Flag size={16} className="text-yellow-400 flex-shrink-0" />

              {/* Away Team */}
              <span className="font-semibold">
                {g.away_rank ? `#${g.away_rank} ` : ""}
                {g.away_team}
              </span>

              <span className="text-slate-400">vs</span>

              {/* Home Team */}
              <span className="font-semibold">
                {g.home_rank ? `#${g.home_rank} ` : ""}
                {g.home_team}
              </span>

              {/* Score or Time */}
              {g.status === "in" || g.status === "final" ? (
                <span className="text-yellow-300 font-bold">
                  {g.away_score} - {g.home_score}
                </span>
              ) : (
                <span className="text-slate-400">{formatTime(g.start)}</span>
              )}

              {/* Status */}
              {g.status === "in" ? (
                <span className="flex items-center gap-1 text-red-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </span>
              ) : g.status === "final" ? (
                <span className="text-slate-500 font-medium">FINAL</span>
              ) : (
                <span className="text-slate-500 font-medium">UPCOMING</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
