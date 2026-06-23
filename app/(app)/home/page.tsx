import Link from "next/link";
import WeeklyBanner from "@/app/components/WeeklyBanner";
import TodayTrivia from "@/app/components/TodayTrivia";
import FeaturedSports from "@/app/components/FeaturedSports";
import LiveScoreboard from "@/app/components/LiveScoreboard";
import QuickActions from "@/app/components/QuickActions";
import UserStats from "@/app/components/UserStats";
import ActivityFeed from "@/app/components/ActivityFeed";

import { getCurrentUserSession } from "@/lib/getCurrentUserSession";
import { getUserProfile, initializeUsername } from "@/app/(app)/settings/actions";

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
  const finalUsername = profile.username || (await initializeUsername(userId));

  const displayName =
    finalUsername?.trim() ||
    profile.email?.split("@")[0] ||
    "Player";

  return (
    <div className="space-y-12 pb-20">

      {/* HERO + STATS */}
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-emerald-700/30 p-8 shadow-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-400 mb-2">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold mb-3">
            {displayName}, your next challenge awaits.
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Track your streaks, play weekly picks, and compete across every sport.
          </p>
        </div>

        {/* User Stats Row */}
        <UserStats userId={userId} />
      </section>

      {/* QUICK ACTIONS */}
      <section>
        <QuickActions />
      </section>

      {/* LIVE SCOREBOARD (optional) */}
      <section>
        <LiveScoreboard />
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
        <FeaturedSports />
      </section>

      {/* ACTIVITY FEED */}
      <section>
        <ActivityFeed userId={userId} />
      </section>

      {/* FOOTER */}
      <section className="border-t border-slate-800 pt-6 mt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-sm font-semibold text-slate-300">
            Powered by BracketBoss.
          </h2>
          <div className="text-xs text-slate-500">
            <span className="text-slate-400">Sponsor space:</span> Partner logos here.
          </div>
        </div>
      </section>
    </div>
  );
}
