"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils"; // optional helper for class merging

export default function TournamentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* HEADER */}
      <header className="w-full border-b border-white/10 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              <span className="text-xl">☰</span>
            </button>

            <h1 className="text-2xl font-extrabold tracking-tight">
              BracketBoss • March Madness
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/sports/march-madness-v2/leaderboard"
              className="hover:text-yellow-400 transition"
            >
              Leaderboard
            </Link>
            <Link
              href="/sports/march-madness-v2/my-bracket"
              className="hover:text-yellow-400 transition"
            >
              My Bracket
            </Link>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={cn(
            "bg-slate-900/40 border-r border-white/10 backdrop-blur-md transition-all duration-300",
            sidebarOpen ? "w-64" : "w-0"
          )}
        >
          {sidebarOpen && (
            <div className="h-full flex flex-col p-6 gap-6">
              <h2 className="text-lg font-semibold text-slate-300">
                Tournament Navigation
              </h2>

              <nav className="flex flex-col gap-4 text-slate-400">
                <Link
                  href="/sports/march-madness-v2"
                  className="hover:text-yellow-400 transition"
                >
                  Tournament Home
                </Link>

                <Link
                  href="/sports/march-madness-v2/regions"
                  className="hover:text-yellow-400 transition"
                >
                  Regions
                </Link>

                <Link
                  href="/sports/march-madness-v2/final-four"
                  className="hover:text-yellow-400 transition"
                >
                  Final Four
                </Link>

                <Link
                  href="/sports/march-madness-v2/championship"
                  className="hover:text-yellow-400 transition"
                >
                  Championship
                </Link>

                <Link
                  href="/sports/march-madness-v2/results"
                  className="hover:text-yellow-400 transition"
                >
                  Results & Replay
                </Link>
              </nav>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/10 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-slate-400">
          © {new Date().getFullYear()} BracketBoss • March Madness Challenge
        </div>
      </footer>
    </div>
  );
}
