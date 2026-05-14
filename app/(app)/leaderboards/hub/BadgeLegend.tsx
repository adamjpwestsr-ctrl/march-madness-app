"use client";

import { useState } from "react";

type BadgeLegendProps = {
  badges: {
    id: number;
    badge_name: string;
    badge_icon: string | null;
    rule_type: "contests_played" | "total_points";
    threshold: number;
    tier: string | null;
    color_class: string | null;
  }[];
};

export default function BadgeLegend({ badges }: BadgeLegendProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 transition"
      >
        Badge Legend
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Badge Legend</h2>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40"
                >
                  <span className={`${b.color_class} text-2xl`}>
                    {b.badge_icon}
                  </span>

                  <div>
                    <div className="font-semibold">{b.badge_name}</div>
                    <div className="text-slate-400 text-sm">
                      {b.rule_type === "contests_played" &&
                        `Earned by playing ${b.threshold}+ contests`}
                      {b.rule_type === "total_points" &&
                        `Earned by scoring ${b.threshold}+ points`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
