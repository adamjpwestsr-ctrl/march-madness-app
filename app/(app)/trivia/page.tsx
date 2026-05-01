import TriviaModeCard from "@/app/components/TriviaModeCard";

const modes = [
  {
    title: "Blitz Mode",
    description: "Rapid-fire trivia. 60 seconds. How many can you get right?",
    color: "from-emerald-500 to-emerald-700",
    status: "Play",
  },
  {
    title: "Weekly Challenge",
    description: "A curated set of questions updated every week.",
    color: "from-blue-600 to-blue-800",
    status: "Start",
  },
  {
    title: "Categories",
    description: "Pick a sport or topic and test your knowledge.",
    color: "from-purple-500 to-purple-700",
    status: "Explore",
  },
  {
    title: "Head-to-Head",
    description: "Challenge a friend and see who knows more.",
    color: "from-orange-500 to-red-600",
    status: "Coming Soon",
  },
];

export default function TriviaPage() {
  return (
    <div className="space-y-10">
      {/* Page Title */}
      <section>
        <h1 className="text-3xl font-semibold mb-2">Trivia</h1>
        <p className="text-slate-400">
          Choose a mode and put your sports knowledge to the test.
        </p>
      </section>

      {/* Trivia Modes */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map((mode) => (
          <TriviaModeCard key={mode.title} {...mode} />
        ))}
      </section>
    </div>
  );
}
