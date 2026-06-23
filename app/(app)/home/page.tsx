import Link from "next/link";
import WeeklyBanner from "@/app/components/WeeklyBanner";
import TodayTrivia from "@/app/components/TodayTrivia";
import FeaturedSports from "@/app/components/FeaturedSports";
import UserStats from "@/app/components/UserStats";

// REMOVE THESE FOR NOW:
// import LiveScoreboard from "@/app/components/LiveScoreboard";
// import QuickActions from "@/app/components/QuickActions";
// import ActivityFeed from "@/app/components/ActivityFeed";

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
    <div className="space-y-12 pb-20">
      {/* HERO + STATS */}
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-emerald-700/30 p-8 shadow-xl shadow-emerald-900/40 relative overflow-hidden">
          {/* Ambient glow */}
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

          {/* Inline hero stats (static for now) */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
            <div className="rounded-lg bg-slate-900/60 border border-white/5 px-3 py-2">
              <p className="text-slate-400">Weekly streak</p>
              <p className="text-emerald-400 font-semibold">7 weeks</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 border border-white/5 px-3 py-2">
              <p className="text-slate-400">Trivia accuracy</p>
              <p className="text-sky-400 font-semibold">82%</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 border border-white/5 px-3 py-2">
              <p className="text-slate-400">Total points</p>
              <p className="text-amber-400 font-semibold">4,320</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 border border-white/5 px-3 py-2">
              <p className="text-slate-400">Global rank</p>
              <p className="text-fuchsia-400 font-semibold">Top 12%</p>
            </div>
          </div>
        </div>

        {/* Dedicated stats row (client component) */}
        <UserStats userId={userId} />
      </section>

      {/* TOP ROW: Weekly + Today’s Trivia */}
      <section className="grid gap-6 md:grid-cols-2">
        <Link href="/challenges" className="block">
          <WeeklyBanner />
        </Link>

        <Link href="/trivia" className="block">
          <TodayTrivia />
        </Link>
      </section>

      {/* FEATURED SPORTS / CHALLENGES */}
      <section>
        <Link href="/sports" className="block">
          <FeaturedSports />
        </Link>
      </section>

      {/* FOOTER / BRANDING */}
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
