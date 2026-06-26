'use client';

import { useEffect, useRef, useState } from 'react';
import { LeaderboardRow } from '@/lib/marchMadnessTypes';

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [prevRows, setPrevRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnpaid, setShowUnpaid] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch current user email
  useEffect(() => {
    async function loadUser() {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const json = await res.json();
      setUserEmail(json?.email ?? null);
    }
    loadUser();
  }, []);

  // Fetch leaderboard
  useEffect(() => {
    async function load() {
      const res = await fetch('/api/march-madness/leaderboard', {
        cache: 'no-store',
      });
      const json = await res.json();

      setPrevRows(rows);
      setRows(json);
      setLoading(false);
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

  function jumpToMyBracket() {
    if (!userEmail) return;

    const myRow = rows.find((r) => r.email === userEmail);
    if (!myRow) return;

    const ref = rowRefs.current[myRow.bracket_id];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ref.classList.add('ring-2', 'ring-yellow-400');
      setTimeout(() => ref.classList.remove('ring-2', 'ring-yellow-400'), 2000);
    }
  }

  if (loading) {
    return <div className="p-6">Loading leaderboard…</div>;
  }

  const visibleRows = showUnpaid ? rows : rows.filter((r) => r.has_paid);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">March Madness Leaderboard</h1>

        <div className="flex gap-3">
          <button
            onClick={jumpToMyBracket}
            className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg hover:bg-yellow-500/30 transition"
          >
            Jump to My Bracket
          </button>

          <button
            onClick={() => setShowUnpaid(!showUnpaid)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition"
          >
            {showUnpaid ? 'Hide Unpaid' : 'Show Unpaid'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {visibleRows.map((row, index) => {
          const movement = getRankChange(row.bracket_id);

          const bgColor = row.has_paid
            ? 'bg-green-900/20 border-green-700/30'
            : 'bg-red-900/20 border-red-700/30';

          return (
           <div
  key={row.bracket_id}
  ref={(el) => {
    rowRefs.current[row.bracket_id] = el;
  }}
  className={`p-4 rounded-lg border flex justify-between items-center hover:bg-white/10 transition-all ${bgColor}`}
>

              {/* Left side: Rank + Name */}
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">{index + 1}</div>

                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {row.bracket_name}

                    {/* Paid / Unpaid icon with tooltip */}
                    {row.has_paid ? (
                      <span
                        className="text-green-400 font-bold cursor-help"
                        title="This entry is paid and eligible to win"
                      >
                        $
                      </span>
                    ) : (
                      <span
                        className="text-red-400 font-bold cursor-help"
                        title="This entry has not paid and is not eligible to win"
                      >
                        ✗
                      </span>
                    )}
                  </div>

                  {/* Eligibility badge with tooltip */}
                  {!row.has_paid && (
                    <div
                      className="text-xs text-red-300 bg-red-900/40 px-2 py-1 rounded w-fit mt-1 cursor-help"
                      title="This bracket is not eligible to win prizes"
                    >
                      Not eligible to win
                    </div>
                  )}

                  <div className="text-sm opacity-70">
                    Max Possible: {row.max_possible_score}
                  </div>
                </div>
              </div>

              {/* Right side: Points + Movement */}
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">{row.earned_points}</div>

                {movement === 'up' && (
                  <span
                    className="text-green-400 font-bold animate-pulse cursor-help"
                    title="Moved up since last update"
                  >
                    ↑
                  </span>
                )}
                {movement === 'down' && (
                  <span
                    className="text-red-400 font-bold animate-pulse cursor-help"
                    title="Moved down since last update"
                  >
                    ↓
                  </span>
                )}
                {movement === 'same' && (
                  <span
                    className="text-white/40 font-bold cursor-help"
                    title="No movement since last update"
                  >
                    •
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
