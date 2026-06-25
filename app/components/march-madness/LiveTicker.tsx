'use client';

import { useEffect, useState } from 'react';
import { LiveGameSummary } from '@/lib/marchMadnessTypes';

export function LiveTicker() {
  const [games, setGames] = useState<LiveGameSummary[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/march-madness/live', { cache: 'no-store' });
      const json = await res.json();
      setGames(json);
    }

    load();

    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (games.length === 0) {
    return (
      <div className="w-full overflow-hidden border-t border-b border-white/10 bg-white/5 backdrop-blur py-2 text-center text-sm opacity-70">
        No live games at the moment
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border-t border-b border-white/10 bg-white/5 backdrop-blur py-2">
      <div className="flex items-center gap-8 animate-ticker whitespace-nowrap">
        {games.map((g) => (
          <div
            key={g.game_id}
            className="flex items-center gap-3 text-sm px-4 text-white/90"
          >
            {/* Region */}
            <span className="text-blue-400 font-semibold">
              {g.region ?? 'N/A'}
            </span>

            {/* Teams */}
            <span>{g.home_team}</span>
            <span className="font-bold text-white">{g.home_score}</span>

            <span className="text-white/40">vs</span>

            <span>{g.away_team}</span>
            <span className="font-bold text-white">{g.away_score}</span>

            {/* Status */}
            {g.status === 'in' && (
              <span className="flex items-center gap-1 text-red-400 font-semibold">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                LIVE
              </span>
            )}

            {g.status === 'post' && (
              <span className="text-green-400 font-semibold">FINAL</span>
            )}

            {g.status === 'pre' && (
              <span className="text-white/50">Upcoming</span>
            )}
          </div>
        ))}
      </div>

      {/* Animation */}
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
