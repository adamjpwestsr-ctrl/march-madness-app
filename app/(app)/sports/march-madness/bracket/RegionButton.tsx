"use client";

import React from "react";

export type RegionButtonProps = {
  label: string;
  icon: string;
  gradient: string; // e.g. "from-emerald-400 to-teal-600"
  onClick: () => void;
};

export function RegionButton({
  label,
  icon,
  gradient,
  onClick,
}: RegionButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`
        relative overflow-hidden rounded-2xl p-6 w-full h-32
        bg-white/5 border border-white/10 backdrop-blur-md
        shadow-xl shadow-black/40
        transition-all duration-300 ease-out
        hover:scale-[1.04] hover:ring-2 hover:ring-white/20
        active:scale-[0.97]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300
      `}
    >
      {/* Gradient Layer */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br ${gradient}
          opacity-40 transition-opacity duration-300
        `}
      />

      {/* Icon */}
      <div className="absolute top-3 left-3 text-2xl opacity-80">
        {icon}
      </div>

      {/* Label */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <span className="text-xl font-semibold tracking-wide drop-shadow-md text-slate-100">
          {label}
        </span>
      </div>
    </button>
  );
}

