"use client";

export default function PlayoffsCard() {
  return (
    <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">MLB Playoffs Challenge</h2>

        <span className="px-2 py-1 text-xs rounded-md bg-slate-700/40 text-slate-300 border border-slate-600/40">
          Coming Soon
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-400 text-sm">
        The MLB Playoffs Challenge will unlock once the regular season ends.
        Build your bracket and compete for postseason points.
      </p>

      {/* Disabled Button */}
      <button
        disabled
        className="w-full py-2 rounded-lg bg-slate-800 text-slate-500 cursor-not-allowed font-semibold text-sm"
      >
        Playoffs Bracket
      </button>
    </div>
  );
}
