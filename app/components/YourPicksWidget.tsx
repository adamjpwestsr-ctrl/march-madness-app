"use client";

import { useEffect, useState } from "react";
import { Target, Brain, Brackets, ChevronRight } from "lucide-react";
import Link from "next/link";

type PicksData = {
  weeklyPick: {
    sport: string;
    pick: string;
    opponent?: string;
    status: string;
  };
  trivia: {
    streak: number;
    accuracy: number;
  };
  bracket: {
    active: boolean;
    progress: string;
  };
};

export default function YourPicksWidget({ userId }: { userId: string }) {
  const [data, setData] = useState<PicksData | null>(null);

  useEffect(() => {
    // TODO: Replace with real Supabase queries
    setData({
      weeklyPick: {
        sport: "Golf Weekly",
        pick: "Scottie Scheffler",
        opponent: "Field",
        status: "Locked",
      },
      trivia: {
        streak: 3,
        accuracy: 82,
      },
      bracket: {
        active: true,
        progress: "Round of 32 complete",
      },
    });
  }, [userId]);

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur p-5 shadow-lg space-y-4">
      <h2 className="text-lg font-semibold text-white">Your Picks</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Weekly Pick */}
        <Link
          href="/challenges"
          className="group rounded-xl border border-white/5 bg-slate-800/40 p-4 hover:bg-slate-800/60 transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-emerald-400" size={20} />
            <p className="text-sm font-medium text-white">{data.weeklyPick.sport}</p>
          </div>

          <p className="text-slate-300 text-sm">
            <span className="font-semibold text-white">{data.weeklyPick.pick}</span>{" "}
            vs {data.weeklyPick.opponent}
          </p>

          <p className="text-xs text-slate-500 mt-1">{data.weeklyPick.status}</p>

          <div className="flex items-center gap-1 text-emerald-400 text-xs mt-3">
            Update pick <ChevronRight size={14} />
          </div>
        </Link>

        {/* Trivia */}
        <Link
          href="/trivia"
          className="group rounded-xl border border-white/5 bg-slate-800/40 p-4 hover:bg-slate-800/60 transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <Brain className="text-sky-400" size={20} />
            <p className="text-sm font-medium text-white">Trivia</p>
          </div>

          <p className="text-slate-300 text-sm">
            Streak:{" "}
            <span className="font-semibold text-white">{data.trivia.streak}</span>
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Accuracy: {data.trivia.accuracy}%
          </p>

          <div className="flex items-center gap-1 text-sky-400 text-xs mt-3">
            Play now <ChevronRight size={14} />
          </div>
        </Link>

        {/* Bracket */}
        <Link
          href="/bracket"
          className="group rounded-xl border border-white/5 bg-slate-800/40 p-4 hover:bg-slate-800/60 transition"
        >
          <div className="flex items-center gap-3 mb-2">
            <Brackets className="text-fuchsia-400" size={20} />
            <p className="text-sm font-medium text-white">Bracket</p>
          </div>

          {data.bracket.active ? (
            <>
              <p className="text-slate-300 text-sm">{data.bracket.progress}</p>
              <div className="flex items-center gap-1 text-fuchsia-400 text-xs mt-3">
                View bracket <ChevronRight size={14} />
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm">No active bracket</p>
          )}
        </Link>
      </div>
    </div>
  );
}
