"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";

export const runtime = "edge";

// --- ICONS ----------------------------------------------------

function BracketIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 4h6v4H4m10-4h6v4h-6M4 16h6v4H4m10-4h6v4h-6M10 6h4v12h-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FootballIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <ellipse cx="12" cy="12" rx="9" ry="5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 12h8m-6 2l4-4m0 4l-4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TriviaIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path
        d="M9 18h6m-5 2h4M12 2a6 6 0 00-3 11c.5.3 1 1 1 2v1h4v-1c0-1 .5-1.7 1-2a6 6 0 00-3-11z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GolfIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 12v8l-2 2h4l-2-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HockeyIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 4l12 16M18 4L6 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="12" cy="20" rx="4" ry="1.5" fill="currentColor" />
    </svg>
  );
}

function BaseballIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 8c1 1 1 3 0 4s-1 3 0 4m8-8c-1 1-1 3 0 4s1 3 0 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GearIcon({ className = "w-6 h-6" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.5-7.5l-1.5 1.5M7 17l-1.5 1.5m12 0L17 17m-10-10L5.5 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// --- PAGE -----------------------------------------------------

export default function SportsPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/user");
        if (!res.ok) return;
        const data = await res.json();
        setIsAdmin(data?.is_admin === true);
      } catch {
        setIsAdmin(false);
      }
    }
    loadUser();
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/background-bracket.png')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* ⭐ Correct placement */}
      <TopNav />

      <div className="relative z-10 min-h-screen text-slate-100 flex flex-col px-6 sm:px-10 pt-20 pb-16">
        <div className="max-w-5xl mx-auto w-full space-y-10">

          {/* HERO — MARCH MADNESS */}
          <a
            href="/bracket"
            className="
              glow-pulse fade-in-soft parallax-hover
              block w-full rounded-2xl overflow-hidden
              bg-gradient-to-br from-emerald-600/20 to-transparent
              border border-white/10 shadow-xl shadow-black/40 backdrop-blur-xl
              px-6 py-10 sm:px-10 sm:py-14
              transition-all duration-200
            "
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-2xl bg-slate-950/70 flex items-center justify-center text-emerald-300">
                <BracketIcon className="w-7 h-7" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-semibold tracking-[0.18em] text-emerald-200 uppercase">
                  Flagship Mode
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-white drop-shadow-lg">
              March Madness
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-200/85 max-w-xl">
              The Big Dance. Build your bracket, chase upsets, and compete for glory.
            </p>
          </a>

          {/* LIVE SPORTS GRID */}
{/* LIVE SPORTS GRID */}
<div className="grid gap-6 sm:gap-7 md:grid-cols-2">

  {/* Trivia Game */}
  <a
    href="/trivia"
    className="
      fade-in-soft parallax-hover
      group relative overflow-hidden
      rounded-2xl bg-white/5 border border-white/10
      shadow-xl shadow-black/40 backdrop-blur-xl
      px-5 py-5 sm:px-6 sm:py-6
      flex flex-col gap-3
      transition-all duration-200
      hover:shadow-[0_0_24px_rgba(16,185,129,0.45)]
      hover:border-emerald-400/60
    "
  >
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-slate-900/70 flex items-center justify-center text-emerald-200">
        <TriviaIcon className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-white">
          Sports Trivia Blitz
        </h2>
        <span className="inline-flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200 uppercase tracking-[0.16em]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>
    </div>
    <p className="text-xs sm:text-sm text-slate-200/85 mt-2">
      60‑second rapid‑fire trivia. Earn points. Climb the leaderboard. Play anytime.
    </p>
  </a>

  {/* NFL Weekly */}
  <a
    href="/sports/nfl/weekly"
    className="
      fade-in-soft parallax-hover
      group relative overflow-hidden
      rounded-2xl bg-white/5 border border-white/10
      shadow-xl shadow-black/40 backdrop-blur-xl
      px-5 py-5 sm:px-6 sm:py-6
      flex flex-col gap-3
      transition-all duration-200
      hover:shadow-[0_0_24px_rgba(16,185,129,0.45)]
      hover:border-emerald-400/60
    "
  >
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-slate-900/70 flex items-center justify-center text-emerald-200">
        <FootballIcon className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-white">
          NFL Weekly Picks
        </h2>
        <span className="inline-flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200 uppercase tracking-[0.16em]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>
    </div>
    <p className="text-xs sm:text-sm text-slate-200/85 mt-2">
      Pick one team per week. Survive the season. One pick per team.
    </p>
  </a>

  {/* Golf Weekly */}
  <a
    href="/sports/golf/weekly"
    className="
      fade-in-soft parallax-hover
      group relative overflow-hidden
      rounded-2xl bg-white/5 border border-white/10
      shadow-xl shadow-black/40 backdrop-blur-xl
      px-5 py-5 sm:px-6 sm:py-6
      flex flex-col gap-3
      transition-all duration-200
      hover:shadow-[0_0_24px_rgba(16,185,129,0.45)]
      hover:border-emerald-400/60
    "
  >
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-slate-900/70 flex items-center justify-center text-emerald-200">
        <GolfIcon className="w-6 h-6" />
      </div>
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-white">
          Golf Weekly Picks
        </h2>
        <span className="inline-flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200 uppercase tracking-[0.16em]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>
    </div>
    <p className="text-xs sm:text-sm text-slate-200/85 mt-2">
      Pick one golfer per tournament. Majors, Signature, FedEx — full season.
    </p>
  </a>
</div>

          {/* COMING SOON + ADMIN GRID */}
          <div className="grid gap-6 sm:gap-7 md:grid-cols-2">
            {/* NHL */}
            <article
              className="
                fade-in-soft parallax-hover
                group relative overflow-hidden
                rounded-2xl bg-white/5 border border-white/10
                shadow-xl shadow-black/40 backdrop-blur-xl
                px-5 py-5 sm:px-6 sm:py-6
                transition-all duration-200
                hover:shadow-[0_0_24px_rgba(16,185,129,0.45)]
                hover:border-emerald-400/60
              "
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900/70 flex items-center justify-center text-emerald-200">
                  <HockeyIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    NHL Playoffs
                  </h2>
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200 uppercase tracking-[0.16em]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Coming Soon
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-200/85 mt-2">
                Best-of-7 series. Predict each round and follow the chase for the Cup.
              </p>
            </article>

            {/* MLB */}
            <article
              className="
                fade-in-soft parallax-hover
                group relative overflow-hidden
                rounded-2xl bg-white/5 border border-white/10
                shadow-xl shadow-black/40 backdrop-blur-xl
                px-5 py-5 sm:px-6 sm:py-6
                transition-all duration-200
                hover:shadow-[0_0_24px_rgba(16,185,129,0.45)]
                hover:border-emerald-400/60
              "
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-900/70 flex items-center justify-center text-emerald-200">
                  <BaseballIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">
                    MLB Postseason
                  </h2>
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200 uppercase tracking-[0.16em]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Coming Soon
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-200/85 mt-2">
                From Wild Card to World Series. Pick your October heroes.
              </p>
            </article>

            {/* ADMIN TOOLS — ADMIN ONLY */}
            {isAdmin && (
              <a
                href="/admin"
                className="
                  fade-in-soft parallax-hover
                  group relative overflow-hidden
                  rounded-2xl bg-white/5 border border-white/10
                  shadow-xl shadow-black/40 backdrop-blur-xl
                  px-5 py-5 sm:px-6 sm:py-6
                  flex flex-col gap-3
                  transition-all duration-200
                  hover:shadow-[0_0_24px_rgba(16,185,129,0.45)]
                  hover:border-emerald-400/60
                "
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-900/70 flex items-center justify-center text-emerald-200">
                    <GearIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold text-white">
                      Admin Tools
                    </h2>
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200 uppercase tracking-[0.16em]">
                      Admin
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-200/85 mt-2">
                  Manage tournaments, scoring, users, and more.
                </p>
              </a>
            )}
          </div>

          <div className="text-center text-xs text-slate-400">
            More sports will be added throughout the year as formats and schedules are finalized.
          </div>
        </div>
      </div>
    </div>
  );
}
