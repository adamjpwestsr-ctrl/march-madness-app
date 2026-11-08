"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Admin-only login form
const LoginForm = dynamic(() => import("@/app/login/LoginForm"), {
  ssr: false,
});

export default function LoginPage() {
  const [showAbout, setShowAbout] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [minimal, setMinimal] = useState(true);

  const highlights = [
    "🏀 Build Elite March Madness Brackets",
    "🏈 Make Weekly NFL Picks",
    "⛳ Dominate Golf Weekly",
    "🏁 Race Ahead in NASCAR Challenge",
    "🧠 Crush Sports Trivia Blitz",
    "📊 Climb the Global Leaderboard",
  ];

  // ROTATING HIGHLIGHT
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex((i) => (i + 1) % highlights.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // TEAM-COLOR REACTIVE GRADIENTS
  useEffect(() => {
    const colors = [
      ["#1d4ed8", "#3b82f6"],
      ["#7f1d1d", "#ef4444"],
      ["#065f46", "#10b981"],
      ["#1e3a8a", "#93c5fd"],
      ["#4c1d95", "#a78bfa"],
      ["#0f172a", "#334155"],
    ];
    const root = document.documentElement;
    root.style.setProperty("--team1", colors[highlightIndex][0]);
    root.style.setProperty("--team2", colors[highlightIndex][1]);
  }, [highlightIndex]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">

      {/* BACKGROUND */}
      <>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 grayscale animate-slow-pan"
          style={{ backgroundImage: "url('/sports-logos.png')" }}
        />
        <div className="neon-grid"></div>
        <div className="absolute inset-0 pointer-events-none hero-spotlight opacity-40" />
        <div className="floating-icons pointer-events-none">
          <span className="float-icon">🏀</span>
          <span className="float-icon">🏈</span>
          <span className="float-icon">⛳</span>
          <span className="float-icon">🏁</span>
          <span className="float-icon">🧠</span>
        </div>
      </>


      {/* MAIN CARD */}
      <div
        className={`
          relative z-10 w-full max-w-md rounded-2xl p-10 animate-fade-in tilt-card
          ${minimal
            ? "bg-slate-900/70 border border-slate-700 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            : "team-gradient backdrop-blur-xl border border-slate-700/60 shadow-[0_0_40px_rgba(0,0,0,0.6)] neon-border"}
        `}
      >

        {/* BADGE */}
        <div className="absolute -top-3 left-4 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md tracking-wide">
          🔥 NEW: Trivia Blitz
        </div>

        {/* TITLE */}
        <h1 className="text-white text-4xl font-extrabold text-center drop-shadow-lg mb-3 slide-up">
          Welcome to BracketBoss
        </h1>

        {/* MINIMAL MODE TOGGLE */}
        <button
          onClick={() => setMinimal(!minimal)}
          className="absolute bottom-6 right-6 text-slate-500 hover:text-slate-300 text-xs font-semibold z-50"
        >
          {minimal ? "Switch to Neon Mode" : "Switch to Minimal Mode"}
        </button>

        {/* ROTATING HIGHLIGHT */}
        <div className="relative flex items-center justify-center mb-6 h-5 slide-up">
          <p className="text-center text-emerald-300 text-sm font-semibold transition-opacity duration-500">
            {highlights[highlightIndex]}
          </p>
          <span
            key={highlightIndex}
            className="burst"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)"
            }}
          />
        </div>

        {/* LIVE SEASON TICKER */}
        <p className="text-slate-400 text-xs text-center mb-4 animate-pulse slide-up">
          {new Date().getFullYear()} Season • Live Updates • New Events Weekly
        </p>

        <p className="text-slate-300 text-center mb-8 text-sm">
          Your sports. Your picks. Your glory.
        </p>

        {/* ⭐ MAIN ACTION BUTTONS */}
        <div className="flex flex-col gap-4 mb-8">
          <a
            href="/sports/march-madness-v2/login"
            className="bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-lg text-center text-lg hover:bg-yellow-300 transition shadow-md"
          >
            Enter the March Madness Portal
          </a>

          <button
            onClick={() => setShowAdminLogin(true)}
            className="text-emerald-400 hover:text-emerald-300 underline text-center text-sm"
          >
            Admin? Login
          </button>
        </div>

        {/* ⭐ ADMIN LOGIN BOX (hidden until clicked) */}
        {showAdminLogin && (
          <div className="slide-up mt-6">
            <LoginForm onClose={() => setShowAdminLogin(false)} />
          </div>
        )}

        {/* INFO LINKS */}
        <div className="text-center mt-10 space-y-2 text-sm text-slate-400">
          <a href="/challenge-overview" className="underline hover:text-slate-300">
            Challenge Overview
          </a>
          <a href="/scoring" className="underline hover:text-slate-300">
            How Scoring Works
          </a>
          <a href="/season-rules" className="underline hover:text-slate-300">
            Season Rules
          </a>
          <a href="/quick-start" className="underline hover:text-slate-300">
            New User Quick Start
          </a>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-6 slide-up">
          <a
            href="mailto:commissioners@yourdomain.com"
            className="text-slate-400 hover:text-slate-300 underline text-sm"
          >
            Email the Commissioners
          </a>
        </div>
      </div>

      {/* ABOUT MODAL */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-slate-800 p-6 rounded-xl w-[90%] max-w-2xl max-h-[80vh] overflow-y-auto modal-scroll text-white shadow-xl border border-slate-700 animate-scale-in slide-up">
            {/* your About content stays unchanged */}
            <button
              onClick={() => setShowAbout(false)}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-4 py-2 rounded-lg mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
