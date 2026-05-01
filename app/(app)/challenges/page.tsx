import ChallengeCard from "@/app/components/ChallengeCard";

const categories = ["All", "NBA", "NFL", "MLB", "NHL"];

const challenges = [
  {
    sport: "NBA",
    title: "NBA Playoff Bracket",
    difficulty: "Medium",
    status: "Open",
  },
  {
    sport: "NFL",
    title: "Weekly Pick'em",
    difficulty: "Easy",
    status: "Open",
  },
  {
    sport: "MLB",
    title: "Home Run Derby Picks",
    difficulty: "Hard",
    status: "Coming Soon",
  },
  {
    sport: "NHL",
    title: "Stanley Cup Bracket",
    difficulty: "Medium",
    status: "Coming Soon",
  },
];

export default function ChallengesPage() {
  return (
    <div className="space-y-10">
      {/* Page Title */}
      <section>
        <h1 className="text-3xl font-semibold mb-2">Challenges</h1>
        <p className="text-slate-400">
          Pick a sport and jump into a challenge.
        </p>
      </section>

      {/* Category Filters */}
      <section className="flex gap-3 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            className="px-4 py-2 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 transition text-sm whitespace-nowrap"
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Challenge Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {challenges.map((challenge) => (
          <ChallengeCard key={challenge.title} {...challenge} />
        ))}
      </section>
    </div>
  );
}
