import Link from "next/link";

import WeeklyBanner from "@/app/components/WeeklyBanner";
import TodayTrivia from "@/app/components/TodayTrivia";
import FeaturedSports from "@/app/components/FeaturedSports";
import UserStats from "@/app/components/UserStats";
import QuickActions from "@/app/components/QuickActions";
import YourPicksWidget from "@/app/components/YourPicksWidget";
import RealActivityFeed from "@/app/components/RealActivityFeed";
import ScoreTicker from "@/app/components/ScoreTicker";
import SpotlightBanner from "@/app/components/SpotlightBanner";

import { getCurrentUserSession } from "@/lib/getCurrentUserSession";
import {
  getUserProfile,
  initializeUsername,
} from "@/app/(app)/settings/actions";

export default async function HomePage() {
  const session = await getCurrentUserSession();

  if (!session) {
    return (
      <div className="text-white p-10 text-center">
        <p>You are not logged in.</p>
        <a href="/login" className="text-emerald-400 underline">
          Go to Login
        </a>
      </div>
    );
  }

  const userId = session.userId;

  const profile = await getUserProfile(userId);
  const finalUsername =
    profile.username || (await initializeUsername(userId));

  const displayName =
    finalUsername?.trim() ||
    profile.email?.split("@")[0] ||
    "Player";

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto px-4">

      {/* HERO + STATS */}
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-emerald-700/30 p-8 shadow-xl shadow-emerald-900/40 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-52 h-52 bg-sky-500/10 blur-3xl" />

          <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-emerald-400 mb-3">
            Welcome back
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold mb-3">
            {displayName}, your next sports challenge is waiting.
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm md:text-base">
            Play brackets, weekly picks, and trivia across your favorite
            sports—all in one place, all year long.
          </p>
        </div>

        <UserStats userId={String(userId)} />
      </section>

      {/* 🏆 LIVE SCORE TICKER */}
      <section className="z-20 w-full bg-slate-950/90 backdrop-blur border-y border-slate-800 overflow-x-hidden overflow-y-visible relative rounded-xl">
        <div className="absolute left-0 top-0 w-12 h-full bg-gradient-to-r from-slate-950 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 w-12 h-full bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
        <ScoreTicker />
      </section>

      {/* SPOTLIGHT BANNER */}
      <section>
        <SpotlightBanner />
      </section>

      {/* QUICK ACTIONS */}
      <section>
        <QuickActions />
      </section>

      {/* YOUR PICKS */}
      <section>
        <YourPicksWidget userId={String(userId)} />
      </section>

      {/* WEEKLY + TRIVIA */}
      <section className="grid gap-6 md:grid-cols-2">
        <Link href="/challenges" className="block">
          <WeeklyBanner />
        </Link>

        <Link href="/trivia" className="block">
          <TodayTrivia />
        </Link>
      </section>

      {/* FEATURED SPORTS */}
      <section>
        <Link href="/sports" className="block">
          <FeaturedSports />
        </Link>
      </section>

      {/* REAL ACTIVITY FEED */}
      <section>
        <RealActivityFeed userId={String(userId)} />
      </section>

{/* HELP & INFO */}
<section className="border border-slate-800 rounded-xl p-4 bg-slate-900/40">
  <details className="group">
    <summary className="cursor-pointer text-slate-300 font-semibold text-sm flex items-center justify-between">
      Help & Info
      <span className="text-slate-500 group-open:rotate-90 transition-transform">›</span>
    </summary>

    <div className="mt-4 space-y-2 text-sm text-slate-400 pl-2">
      <a href="/challenge-overview" className="block underline hover:text-slate-300">
        Challenge Overview
      </a>
      <a href="/scoring" className="block underline hover:text-slate-300">
        How Scoring Works
      </a>
      <a href="/season-rules" className="block underline hover:text-slate-300">
        Season Rules
      </a>
      <a href="/quick-start" className="block underline hover:text-slate-300">
        New User Quick Start
      </a>
      <a href="/support" className="block underline hover:text-slate-300">
        Support Center
      </a>
    </div>
  </details>
</section>

      {/* FOOTER */}
      <section className="border-t border-slate-800 pt-6 mt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-300">
              Powered by BracketBoss: Built for fans who never want the season to end.
            </h2>
          </div>
          <div className="text-xs text-slate-500">
            <span className="text-slate-400">Sponsor space:</span>{" "}
            Non-intrusive partner logos can live here.
          </div>
        </div>
      </section>
    </div>
  );
}
