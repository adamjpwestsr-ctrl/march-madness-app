"use client";

import { RegionButton } from "./components/RegionButton";

type RegionGridProps = {
  setView: (
    view:
      | "region-east"
      | "region-west"
      | "region-south"
      | "region-midwest"
      | "final-four"
      | "championship"
  ) => void;
};

export default function RegionGrid({ setView }: RegionGridProps) {
  const regions = [
    {
      key: "region-east",
      label: "East",
      icon: "🧭",
      gradient: "from-emerald-400 to-teal-600",
    },
    {
      key: "region-west",
      label: "West",
      icon: "🌄",
      gradient: "from-blue-500 to-indigo-700",
    },
    {
      key: "region-south",
      label: "South",
      icon: "☀️",
      gradient: "from-rose-400 to-red-600",
    },
    {
      key: "region-midwest",
      label: "Midwest",
      icon: "⭐",
      gradient: "from-amber-400 to-orange-600",
    },
    {
      key: "final-four",
      label: "Final Four",
      icon: "🏀",
      gradient: "from-violet-500 to-purple-700",
    },
    {
      key: "championship",
      label: "Championship",
      icon: "🏆",
      gradient: "from-yellow-400 to-yellow-600",
    },
  ] as const;

  return (
    <div className="flex flex-col gap-8 w-full items-center">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-100 tracking-wide">
          Select a Region
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Choose a region to begin your bracket
        </p>
      </div>

      {/* Container Card */}
      <div className="relative w-full max-w-3xl rounded-3xl p-8 bg-slate-900/40 border border-slate-800/60 shadow-2xl">
        {/* Spotlight */}
        <div className="absolute inset-0 bg-gradient-radial from-white/5 to-transparent pointer-events-none rounded-3xl" />

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
          {regions.map((r) => (
            <RegionButton
              key={r.key}
              label={r.label}
              icon={r.icon}
              gradient={r.gradient}
              onClick={() => setView(r.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
