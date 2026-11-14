
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("@/app/login/LoginForm"), {
  ssr: false,
});

export default function LoginPage() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [minimal, setMinimal] = useState(true);

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-black px-3">

      {/* BACKGROUND */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-10 grayscale"
        style={{ backgroundImage: "url('/sports-logos.png')" }}
      />

      {/* MAIN CARD */}
      <div
        className={`relative z-10 w-full max-w-sm rounded-2xl border px-5 py-6 ${
          minimal
            ? "border-slate-700 bg-slate-900/90 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
            : "border-slate-700/60 team-gradient shadow-[0_0_30px_rgba(0,0,0,0.6)] neon-border"
        }`}
      >
        {/* BADGE */}
        <div className="absolute -top-3 left-4 rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-bold tracking-wide text-slate-900 shadow-md">
          🏀 MARCH MADNESS CHALLENGE
        </div>

        {/* TITLE */}
        <h1 className="mb-2 text-center text-2xl font-extrabold text-white">
          Welcome to BracketBoss
        </h1>

        {/* MODE TOGGLE */}
        <button
          onClick={() => setMinimal(!minimal)}
          className="absolute bottom-2 right-3 text-[9px] font-semibold text-slate-500 hover:text-slate-300"
        >
          {minimal ? "Neon Mode" : "Minimal Mode"}
        </button>

        {/* INTRODUCTION */}
        <p className="mb-2 text-center text-xs font-semibold text-emerald-300">
          Build Your Bracket. Make Your Picks. Beat the Competition.
        </p>

        <p className="mb-4 text-center text-xs leading-relaxed text-slate-300">
          Make your predictions, follow the results, chat with the competition,
          and compete for the payout!
        </p>

        {/* FEATURES */}
        <div className="mb-5 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
          <span>🏀 Bracket Builder</span>
          <span>📊 Live Scoring</span>
          <span>🏆 Leaderboard</span>
          <span>💬 Forum</span>
        </div>

        {/* PORTAL BUTTON */}
        <div className="mb-4">
          <a
            href="/sports/march-madness-v2/login"
            className="block w-full rounded-lg bg-yellow-400 px-3 py-3 text-center text-sm font-extrabold text-slate-900 shadow-md transition hover:bg-yellow-300"
          >
            Enter the March Madness Portal
          </a>

          <button
            onClick={() => setShowAdminLogin(true)}
            className="mt-3 block w-full text-center text-xs text-emerald-400 underline hover:text-emerald-300"
          >
            Admin? Login
          </button>
        </div>

        {/* ADMIN LOGIN */}
        {showAdminLogin && (
          <div className="mb-4">
            <LoginForm onClose={() => setShowAdminLogin(false)} />
          </div>
        )}

        {/* INFO LINKS */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 border-t border-slate-800 pt-3 text-[10px] text-slate-400">
          <a href="/challenge-overview" className="underline hover:text-slate-300">
            Overview
          </a>
          <a href="/scoring" className="underline hover:text-slate-300">
            Scoring
          </a>
          <a href="/season-rules" className="underline hover:text-slate-300">
            Rules
          </a>
          <a href="/quick-start" className="underline hover:text-slate-300">
            Quick Start
          </a>
        </div>

        {/* FOOTER */}
        <div className="mt-3 text-center">
          <a
            href="mailto:commissioners@yourdomain.com"
            className="text-[10px] text-slate-500 underline hover:text-slate-300"
          >
            Email the Commissioners
          </a>
        </div>
      </div>
    </main>
  );
}
