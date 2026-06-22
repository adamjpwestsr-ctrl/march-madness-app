import Link from "next/link";
import ChallengeCard from "@/app/components/ChallengeCard";
import WeeklyBanner from "@/app/components/WeeklyBanner";
import TriviaModeCard from "@/app/components/TriviaModeCard";
import LeaderboardCard from "@/app/components/LeaderboardCard";
import { CHALLENGES } from "@/app/config/challenges";

// ⭐ New import for the dynamic Golf Weekly card
import GolfWeeklyCard from "@/app/components/GolfWeeklyCard";

export default function ChallengesHub() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-semibold mb-2">Challenges</h1>
        <p className="text-slate-400">
          Weekly picks, trivia, and sports challenges — all in one place.
        </p>
      </section>

      <section>
        <Link href="/challenges/weekly" className="block">
          <WeeklyBanner />
        </Link>
      </section>

{/* ⭐ Challenge Cards Grid */}
<section
  className="
    grid
    gap-6
    md:grid-cols-2
    lg:grid-cols-3
    auto-rows-[1fr]          /* ⭐ Ensures all rows match height */
  "
>
  {CHALLENGES.map((c) => {
    // ⭐ Special override: Golf Weekly uses the new dynamic card
    if (c.id === "golf-weekly") {
      return (
        <div key={c.id} className="h-full">
          <GolfWeeklyCard />
        </div>
      );
    }

    // ⭐ Default behavior for all other challenges
    return c.href ? (
      <Link key={c.id} href={c.href} className="h-full block">
        <ChallengeCard
          sport={c.sport}
          title={c.title}
          difficulty={c.difficulty}
          status={c.status}
        />
      </Link>
    ) : (
      <div
        key={c.id}
        className="h-full opacity-60 cursor-not-allowed"
        title="Coming Soon"
      >
        <ChallengeCard
          sport={c.sport}
          title={c.title}
          difficulty={c.difficulty}
          status={c.status}
        />
      </div>
    );
  })}
</section>

      {/* Bottom Section */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <p className="text-slate-400">Progress tracking coming soon.</p>
        </div>

        <Link href="/leaderboard" className="block">
          <LeaderboardCard title="Leaderboard" value="View Rankings" />
        </Link>
      </section>
    </div>
  );
}