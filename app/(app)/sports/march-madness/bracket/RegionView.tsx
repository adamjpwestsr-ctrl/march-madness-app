"use client";

import RegionGrid from "./RegionGrid";

export default function RegionView({
  regionName,
  games,
  picks,
  isLocked,
  isSubmitted,
  mulligans,
  onPick,
  onUseMulligan,
  onContinue,
  onBack,
}) {
  const regionEmoji =
    regionName === "East"
      ? "🧭"
      : regionName === "West"
      ? "🌄"
      : regionName === "South"
      ? "☀️"
      : regionName === "Midwest"
      ? "⭐"
      : regionName === "Final Four"
      ? "🏀"
      : regionName === "Championship"
      ? "🏆"
      : "🏀";

  const regionColor =
    regionName === "East"
      ? "bg-emerald-500"
      : regionName === "West"
      ? "bg-blue-500"
      : regionName === "South"
      ? "bg-rose-500"
      : regionName === "Midwest"
      ? "bg-amber-500"
      : regionName === "Final Four"
      ? "bg-violet-500"
      : "bg-yellow-500";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{regionEmoji}</span>
            <h2 className="text-2xl font-semibold tracking-wide text-slate-100">
              {regionName} Region
            </h2>
          </div>

          <div className={`h-[3px] w-24 mt-1 rounded-full ${regionColor}`} />
        </div>

        <button
          onClick={onBack}
          className="
            flex items-center gap-2 px-3 py-1.5
            bg-white/5 border border-white/10 backdrop-blur-md
            text-slate-200 text-xs rounded-lg
            shadow-md shadow-black/40
            hover:ring-2 hover:ring-white/20 hover:scale-[1.03]
            transition-all duration-200
          "
        >
          <span className="text-sm">←</span>
          Back
        </button>
      </div>

      {/* REGION GRID */}
      <RegionGrid
        regionName={regionName}
        games={games}
        picks={picks}
        isLocked={isLocked}
        isSubmitted={isSubmitted}
        mulligans={mulligans}
        onPick={onPick}
        onUseMulligan={onUseMulligan}
      />

      {/* CONTINUE BUTTON */}
      <button
        onClick={onContinue}
        className="
          self-center px-6 py-3 rounded-xl text-white font-semibold tracking-wide
          bg-gradient-to-br from-emerald-400 to-emerald-600
          shadow-lg shadow-emerald-900/40
          border border-white/10 backdrop-blur-md
          transition-all duration-300
          hover:scale-[1.04] hover:shadow-emerald-500/40 hover:ring-2 hover:ring-emerald-300/40
          active:scale-[0.97]
          flex items-center gap-2
        "
      >
        Continue to Final Four →
      </button>
    </div>
  );
}
