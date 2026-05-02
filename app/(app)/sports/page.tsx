import Link from "next/link";
import SportsHero from "@/app/sports/SportsHero";
import SportsCard from "@/app/sports/SportsCard";

export default function SportsHub() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <SportsHero />

      {/* Weekly Sports Challenges */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Weekly Sports Challenges</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/sports/nfl/weekly" className="block">
            <SportsCard
              title="NFL Weekly"
              description="Predict winners for this week's NFL slate."
              icon="🏈"
            />
          </Link>

          <Link href="/sports/golf/weekly" className="block">
            <SportsCard
              title="Golf Weekly"
              description="Pick winners for the upcoming PGA event."
              icon="⛳"
            />
          </Link>

          <SportsCard
            title="NBA"
            description="Coming soon."
            icon="🏀"
          />

          <SportsCard
            title="MLB"
            description="Coming soon."
            icon="⚾"
          />

          <SportsCard
            title="NHL"
            description="Coming soon."
            icon="🏒"
          />
        </div>
      </section>
    </div>
  );
}
