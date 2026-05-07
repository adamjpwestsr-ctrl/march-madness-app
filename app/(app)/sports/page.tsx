import Link from "next/link";
import SportsHero from "@/app/sports/SportsHero";
import SportsCard from "@/app/sports/SportsCard";
import { CHALLENGES } from "@/app/config/challenges";

export default function SportsHub() {
  const sportsChallenges = CHALLENGES.filter((c) => c.sport !== "Trivia");

  return (
    <div className="space-y-10">
      <SportsHero />

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sportsChallenges.map((c) =>
          c.href ? (
            <Link key={c.id} href={c.href} className="block">
              <SportsCard sport={c.sport} description={c.description} />
            </Link>
          ) : (
            <div
              key={c.id}
              className="opacity-60 cursor-not-allowed"
              title="Coming Soon"
            >
              <SportsCard sport={c.sport} description={c.description} />
            </div>
          )
        )}
      </section>

      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40 text-center">
        <h2 className="text-xl font-semibold mb-2">More Sports Coming Soon</h2>
        <p className="text-slate-400">
          Stay tuned for new leagues and challenges added throughout the season.
        </p>
      </section>
    </div>
  );
}
