"use client";

import { useState, useEffect } from "react";
import LoginForm from "@/app/login/LoginForm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function LoginPage() {
  const [showAbout, setShowAbout] = useState(false);
  const [currentStep, setCurrentStep] = useState<"email" | "admin">("email");
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [minimal, setMinimal] = useState(false);

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

  // TEAM-COLOR REACTIVE GRADIENTS (STEP 4)
  useEffect(() => {
    const colors = [
      ["#1d4ed8", "#3b82f6"], // NCAA - blue
      ["#7f1d1d", "#ef4444"], // NFL - red
      ["#065f46", "#10b981"], // Golf - green
      ["#1e3a8a", "#93c5fd"], // NASCAR - steel blue
      ["#4c1d95", "#a78bfa"], // Trivia - purple
      ["#0f172a", "#334155"], // Leaderboard - slate
    ];

    const root = document.documentElement;
    root.style.setProperty("--team1", colors[highlightIndex][0]);
    root.style.setProperty("--team2", colors[highlightIndex][1]);
  }, [highlightIndex]);

  const labelText = currentStep === "email" ? "Enter your email" : "Admin Code";

  if (fatalError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">⚠️ Unexpected Error</h1>
          <p className="text-slate-300">{fatalError}</p>
          <button
            onClick={() => setFatalError(null)}
            className="bg-emerald-500 px-4 py-2 rounded-lg hover:bg-emerald-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">

      {/* BACKGROUND LAYERS (DISABLED IN MINIMAL MODE) */}
      {!minimal && (
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
      )}

      {/* LEADERBOARD LINK */}
      <a
        href="/leaderboard"
        className="absolute top-6 right-6 text-emerald-400 hover:text-emerald-300 font-semibold z-20"
      >
        Leaderboard
      </a>

      {/* LOGIN CARD */}
      <div
        className={`
          relative z-10 w-full max-w-md
          rounded-2xl p-10 animate-fade-in tilt-card
          ${minimal
            ? "bg-slate-900/70 border border-slate-700 shadow-xl"
            : "team-gradient backdrop-blur-xl border border-slate-700/60 shadow-[0_0_40px_rgba(0,0,0,0.6)] neon-border"
          }
        `}
      >

        {/* BADGE */}
        <div className="absolute -top-3 left-4 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md tracking-wide">
          🔥 NEW: Trivia Blitz
        </div>

        {/* PERSONALIZED WELCOME MESSAGE */}
        <p className="text-slate-400 text-center text-sm mb-2 slide-up">
          {currentStep === "admin"
            ? "Admin access enabled"
            : (email && email.includes("@")
                ? `Welcome back, ${email.split("@")[0]}`
                : "Welcome to the competition")}
        </p>

        {/* TITLE */}
        <h1 className="text-white text-4xl font-extrabold text-center drop-shadow-lg mb-3 slide-up">
          Welcome to BracketBoss
        </h1>

        {/* MINIMAL MODE TOGGLE */}
        <button
          onClick={() => setMinimal(!minimal)}
          className="
            absolute bottom-6 right-6
            text-slate-500 hover:text-slate-300
            text-xs font-semibold
            z-50
          "
        >
          {minimal ? "Switch to Neon Mode" : "Switch to Minimal Mode"}
        </button>

        {/* ROTATING HIGHLIGHT */}
        <div className="relative flex items-center justify-center mb-6 h-5 slide-up">
          <p className="text-center text-emerald-300 text-sm font-semibold transition-opacity duration-500">
            {highlights[highlightIndex]}
          </p>

          {/* PARTICLE BURST */}
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

        {/* LABEL + ABOUT LINK */}
        <div className="flex justify-between items-center w-full mb-2">
          <label className="text-white text-lg font-semibold">
            {labelText}
          </label>

          <button
            onClick={() => setShowAbout(true)}
            className="text-emerald-400 text-sm hover:text-emerald-300 underline"
          >
            About BracketBoss
          </button>
        </div>

        {/* LOGIN FORM */}
        <div className="slide-up">
          <LoginForm
            onStepChange={(step) => {
              try {
                setCurrentStep(step);
              } catch (err) {
                setFatalError("Something went wrong rendering the login form.");
              }
            }}
            onEmailChange={(value) => setEmail(value)}
          />
        </div>


{/* INFO LINKS (PUBLIC) */}
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
          <div className="bg-slate-800 p-6 rounded-xl max-w-lg w-full text-white shadow-xl border border-slate-700 animate-scale-in slide-up">
            <h2 className="text-2xl font-bold mb-4 text-center">About BracketBoss</h2>

            <p className="text-slate-300 text-sm mb-5 leading-relaxed text-center">
              BracketBoss is your all‑in‑one sports challenge hub — built for fans who love competition, strategy, and bragging rights.
            </p>

<ul className="space-y-3 text-sm leading-relaxed">

  <li>
    <strong>🏀 March Madness Brackets:</strong>
    Build up to 4 brackets, track every upset, and compete across all rounds for your chance at a large payout!
  </li>

  <li>
    <strong>♻️ Mulligans:</strong>
    Is your March Madness Bracket in trouble? Undo early picks with a Mulligan (only available on BracketBoss) — limited per season.
  </li>

  <li>
    <strong>🏈 NFL Weekly Picks:</strong>
    One pick per week. No repeating teams. Build streaks and climb the standings.
  </li>

  <li>
    <strong>⚾ MLB Weekly Challenge:</strong>
    Pick the winner of each weekly series. Earn points for correct predictions.
  </li>

  <li>
    <strong>💥 MLB Home Run Derby:</strong>
    Choose your Derby champion. Track HR totals, momentum, and Derby rankings. (Only available during All Star Week).
  </li>

  <li>
    <strong>🏒 NHL Weekly Challenge:</strong>
    Predict winners of each weekly series. Like the MLB Weekly challenge, earn points for correct predictions.
  </li>

  <li>
    <strong>🏀 NBA Weekly Challenge:</strong>
    Pick winners of each weekly series. Like the MLB and NHL Weekly challenges, earn points for correct predictions.
  </li>

  <li>
    <strong>⛳ Golf Weekly:</strong>
    Pick your Golfer each week, and follow live scoring and leaderboard movement, while you earn points and try to claim the top spot on the leaderboard.
  </li>

  <li>
    <strong>🏁 NASCAR Challenge:</strong>
    Pick your favorite racer each week. Score based on laps led, stage wins, finishing position, and bonus events. Try to own the leaderboard!
  </li>

  <li>
    <strong>🧠 Trivia Blitz:</strong>
    Sports knowledge living in your brain rent-free? We have what you need! Timed sports trivia with streak bonuses and rapid‑fire scoring.
  </li>

  <li>
    <strong>📊 Leaderboard Tracking:</strong>
    Watch your rank climb across all sports, challenges, and seasons.
  </li>

  <li>
    <strong>🔐 Password‑Free Login:</strong>
    Your email is your secure key — fast, simple, and safe.
  </li>

  <li>
    <strong>🏆 Rewards & Badges:</strong>
    Earn achievements, bragging rights, and occasional prizes.
  </li>

</ul>

            <p className="text-slate-400 text-xs mt-5 text-center italic">
              Built for fans, by fans — welcome to the competition.
            </p>

            <button
              onClick={() => setShowAbout(false)}
              className="mt-6 w-full bg-emerald-500 py-2 rounded-lg hover:bg-emerald-400 font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
