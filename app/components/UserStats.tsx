"use client";

import { useEffect, useState } from "react";

type Stats = {
  weeklyStreak: number;
  triviaAccuracy: number;
  totalPoints: number;
  rankPercentile: number;
};

export default function UserStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // TODO: replace with real API / DB call
    // For now, mock data so the UI feels alive
    setStats({
      weeklyStreak: 7,
      triviaAccuracy: 82,
      totalPoints: 4320,
      rankPercentile: 12,
    });
  }, [userId]);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard
        label="Weekly streak"
        value={stats?.weeklyStreak ?? 0}
        suffix="weeks"
        accent="text-emerald-400"
      />
      <StatCard
        label="Trivia accuracy"
        value={stats?.triviaAccuracy ?? 0}
        suffix="%"
        accent="text-sky-400"
      />
      <StatCard
        label="Total points"
        value={stats?.totalPoints ?? 0}
        accent="text-amber-400"
      />
      <StatCard
        label="Global rank"
        value={stats?.rankPercentile ?? 0}
        suffix="%"
        accent="text-fuchsia-400"
        helper="Lower is better"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  accent,
  helper,
}: {
  label: string;
  value: number;
  suffix?: string;
  accent?: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all duration-200">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-semibold ${accent}`}>
        {value.toLocaleString()}
        {suffix ? (
          <span className="text-slate-400 text-sm ml-1">{suffix}</span>
        ) : null}
      </p>
      {helper && (
        <p className="text-[11px] text-slate-500 mt-1">{helper}</p>
      )}
    </div>
  );
}
