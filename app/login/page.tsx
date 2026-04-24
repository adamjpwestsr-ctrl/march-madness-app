"use client";

import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  const [showAbout, setShowAbout] = useState(false);
  const [currentStep, setCurrentStep] = useState("email");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const labelText =
    currentStep === "email"
      ? "Enter your email"
      : currentStep === "admin"
      ? "Admin Code"
      : "Choose an option";

  const highlights = [
    "🏆 Build your March Madness Bracket",
    "🏈 Make Weekly NFL Picks",
    "⛳ Compete in Golf Weekly",
    "🧠 Play Sports Trivia Blitz",
    "📊 Track your leaderboard climb",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex((i) => (i + 1) % highlights.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">

      {/* HERO SPOTLIGHT BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-950" />

      {/* Moving spotlight */}
      <div className="absolute inset-0 pointer-events-none hero-spotlight opacity-40" />

      {/* Leaderboard link */}
      <a
        href="/leaderboard"
        className="absolute top-6 right-6 text-emerald-400 hover:text-emerald-300 font-semibold z-20"
      >
        Leaderboard
      </a>

      {/* LOGIN CARD */}
      <div className="
        relative z-10 w-full max-w-md
        bg-slate-900/80 backdrop-blur-xl
        border border-slate-700/60
        rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)]
        p-10 animate-fade-in
      ">
        <h1 className="text-white text-4xl font-extrabold text-center drop-shadow-lg mb-3">
          Welcome to BracketBoss
        </h1>

        {/* Rotating highlight reel */}
        <p className="text-center text-emerald-300 text-sm font-semibold h-5 mb-6 transition-opacity duration-500">
          {highlights[highlightIndex]}
        </p>

        <p className="text-slate-300 text-center mb-8 text-sm">
          Your sports. Your picks. Your glory.
        </p>

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

        <LoginForm onStepChange={setCurrentStep} />

        <div className="text-center mt-6">
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
          <div className="bg-slate-800 p-6 rounded-xl max-w-lg w-full text-white shadow-xl border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">About BracketBoss</h2>

            <ul className="space-y-3 text-sm leading-relaxed">
              <li><strong>Multiple Brackets:</strong> Create up to 5 brackets — all you need is your email.</li>
              <li><strong>Leaderboard:</strong> Track your rank in real time.</li>
              <li><strong>Password‑Free Login:</strong> Your email is your key — simple and secure.</li>
              <li><strong>Mulligans:</strong> Undo your pick if your team loses early.</li>
              <li><strong>Prizes:</strong> Win bragging rights… and sometimes cash.</li>
            </ul>

            <button
              onClick={() => setShowAbout(false)}
              className="mt-6 w-full bg-emerald-500 py-2 rounded-lg hover:bg-emerald-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
