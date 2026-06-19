"use client";

import { useEffect, useState } from "react";

export default function MLBCalendar({
  onWeekSelect,
}: {
  onWeekSelect: (week: number) => void;
}) {
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);

  // Determine current week based on today's date
  useEffect(() => {
    const today = new Date();
    const openingDay = new Date("2026-03-26"); // API-detected Opening Day
    const diffDays = Math.floor(
      (today.getTime() - openingDay.getTime()) / (1000 * 60 * 60 * 24)
    );
    const week = Math.floor(diffDays / 7) + 1;

    if (week >= 1 && week <= 26) {
      setCurrentWeek(week);
    }
  }, []);

  return (
    <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Calendar</h2>

      <div className="grid grid-cols-4 gap-3">
        {[...Array(26)].map((_, i) => {
          const week = i + 1;
          const isCurrent = week === currentWeek;

          return (
            <button
              key={week}
              onClick={() => onWeekSelect(week)}
              className={`py-3 rounded-lg text-sm font-semibold transition-all border
                ${
                  isCurrent
                    ? "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                }
              `}
            >
              Week {week}
            </button>
          );
        })}
      </div>
    </div>
  );
}

