import Link from "next/link";
import SportsHero from "@/app/sports/SportsHero";
import SportsCard from "@/app/sports/SportsCard";

export default function SportsHub() {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <SportsHero />

      {/* Sports Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/sports/nfl/weekly" className="block">
          <SportsCard
            sport="NFL"
            description="Predict winners for the upcoming NFL slate."
          />
        </Link>

        <Link href="/sports/golf/weekly" className="block">
          <SportsCard
            sport="Golf"
            description="Pick winners for this week's PGA event."
          />
        </Link>

        <Link href="/sports/nba" className="block">
          <SportsCard
            sport="NBA"
            description="Compete in daily and weekly basketball challenges."
          />
        </Link>

        <Link href="/sports/mlb" className="block">
          <SportsCard
            sport="MLB"
            description="Make your picks for the latest baseball matchups."
          />
        </Link>

        <Link href="/sports/nhl" className="block">
          <SportsCard
            sport="NHL"
            description="Predict winners for the weekly hockey slate."
          />
        </Link>

        <Link href="/sports/college-football" className="block">
          <SportsCard
            sport="College Football"
            description="Join the playoff challenge and pick your champions."
          />
        </Link>
      </section>

      {/* Coming Soon */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40 text-center">
        <h2 className="text-xl font-semibold mb-2">More Sports Coming Soon</h2>
        <p className="text-slate-400">
          Stay tuned for new leagues and challenges added throughout the season.
        </p>
      </section>
    </div>
  );
}
