// app/components/Header.tsx
"use client";

import Link from "next/link";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";

export default function Header() {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left: Logo + brand */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <span className="text-emerald-300 text-sm font-bold">BB</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide">
              BracketBoss
            </span>
            <span className="text-[11px] text-slate-500">
              Sports Challenges & Trivia
            </span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            type="button"
            className="hidden md:inline-flex items-center justify-center rounded-full border border-slate-800 bg-slate-900/70 p-2 hover:border-emerald-500/50 hover:bg-slate-900 transition"
          >
            <BellIcon className="w-5 h-5 text-slate-300" />
          </button>

          {/* Profile placeholder */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500/60 to-slate-700" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-100">
                Logged in
              </span>
              <span className="text-[11px] text-slate-500">
                View account & settings
              </span>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="inline-flex lg:hidden items-center justify-center rounded-full border border-slate-800 bg-slate-900/70 p-2 hover:border-emerald-500/50 hover:bg-slate-900 transition"
          >
            <Bars3Icon className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </div>
    </header>
  );
}
