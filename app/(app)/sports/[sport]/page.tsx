import { CHALLENGES } from "@/app/config/challenges";
import Link from "next/link";

type SportPageProps = {
  params: { sport: string };
};

export default async function SportLandingPage({ params }: SportPageProps) {
  const sportParam = params.sport.toLowerCase();

  // Find all challenges for this sport
  const sportChallenges = CHALLENGES.filter(
    (c) => c.sport.toLowerCase().replace(/\s+/g, "-") === sportParam
  );

  // Derive sport label from first challenge
  const sportLabel = sportChallenges.length > 0
    ? sportChallenges[0].sport
    : sportParam.toUpperCase();

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">{sportLabel} Challenges</h1>
        <p className="text-slate-400">
          Choose a challenge below to get started.
        </p>
      </div>

      {/* Challenge Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sportChallenges.map((challenge) => (
          <Link
            key={challenge.id}
            href={challenge.href ?? "#"}
            className={`block rounded-xl border border-slate-800 p-6 bg-slate-900/40 hover:bg-slate-900/60 transition ${
              !challenge.href ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <h2 className="text-xl font-semibold text-white">{challenge.title}</h2>
            <p className="text-slate-400 text-sm mt-2">{challenge.description}</p>

            <div className="mt-4 flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs rounded-md ${
                  challenge.status === "Open"
                    ? "bg-green-600/20 text-green-400"
                    : "bg-yellow-600/20 text-yellow-400"
                }`}
              >
                {challenge.status}
              </span>

              <span className="px-2 py-1 text-xs rounded-md bg-slate-700/40 text-slate-300">
                {challenge.difficulty}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
