'use client';

import { useEffect, useState } from 'react';
import { LeaderboardRow } from '@/lib/marchMadnessTypes';

export function LeaderboardPreview() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [prevRows, setPrevRows] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/march-madness/leaderboard', {
        cache: 'no-store',
      });
      const json = await res.json();

      setPrevRows(rows);
      setRows(json.slice(0, 5)); // top 5 only
    }

    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [rows]);

  function getRankChange(bracketId: string) {
    const prevIndex = prevRows.findIndex((r) => r.bracket_id === bracketId);
    const newIndex = rows.findIndex((r) => r.bracket_id === bracketId);

    if (prevIndex === -1 || newIndex === -1) return null;

    if (newIndex < prevIndex) return 'up';
    if (newIndex > prevIndex) return 'down';
    return 'same';
  }

  return (
    <div className="rounded-xl p-6 bg-white/10 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        <a
          href="/sports/march-madness/leaderboard"
          className="text-blue-400 hover:text-blue-300 transition"
        >
          View All →
        </a>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => {
          const movement = getRankChange(row.bracket_id);

          return (
            <div
              key={row.bracket_id}
              className="p-4 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center hover:bg-white/20 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold">{index + 1}</div>

                <div>
                  <div className="font-semibold">{row.bracket_name}</div>
                  <div className="text-sm opacity-70">
                    Max: {row.max_possible_score}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xl font-bold">{row.earned_points}</div>

                {movement === 'up' && (
                  <span className="text-green-400 font-bold animate-pulse">
                    ↑
                  </span>
                )}
                {movement === 'down' && (
                  <span className="text-red-400 font-bold animate-pulse">
                    ↓
                  </span>
                )}
                {movement === 'same' && (
                  <span className="text-white/40 font-bold">•</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
