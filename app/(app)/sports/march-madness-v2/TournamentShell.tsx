
"use client";

import React from "react";
import Link from "next/link";

export default function TournamentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* HEADER */}
      <header className="w-full border-b border-white/10 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">
            BracketBoss • March Madness
          </h1>

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

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full overflow-y-auto p-6">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/10 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-slate-400">
          © {new Date().getFullYear()} BracketBoss • March Madness Challenge
        </div>
      </footer>
    </div>
  );
}
