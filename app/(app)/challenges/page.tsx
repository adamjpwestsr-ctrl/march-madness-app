import Link from "next/link";
import ChallengeCard from "@/app/components/ChallengeCard";
import WeeklyBanner from "@/app/components/WeeklyBanner";
import TriviaModeCard from "@/app/components/TriviaModeCard";
import LeaderboardCard from "@/app/components/LeaderboardCard";

export default function ChallengesHub() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-semibold mb-2">Challenges</h1>
        <p className="text-slate-400">
          Weekly picks, trivia, and sports challenges — all in one place.
        </p>
      </section>

      {/* Weekly Challenge */}
      <section>
        <Link href="/challenges/weekly" className="block">
          <WeeklyBanner />
        </Link>
      </section>

      {/* Challenge Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/trivia" className="block">
          <TriviaModeCard
  title="Trivia"
  description="Daily & weekly trivia challenges"
  color="blue"
  status="active"
/>

        </Link>

        <Link href="/sports/golf/weekly" className="block">
          <ChallengeCard
            title="Golf Weekly"
            description="Pick winners for this week's PGA event."
            icon="⛳"
          />
        </Link>

        <Link href="/sports/nfl/weekly" className="block">
          <ChallengeCard
            title="NFL Weekly"
            description="Predict winners for the upcoming NFL slate."
            icon="🏈"
          />
        </Link>
      </section>

      {/* Progress + Leaderboard */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <p className="text-slate-400">Progress tracking coming soon.</p>
        </div>

        <Link href="/leaderboard" className="block">
          <LeaderboardCard />
        </Link>
      </section>
    </div>
  );
}
