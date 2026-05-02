interface ChallengeCardProps {
  sport: string;
  title: string;
  difficulty: string;
  status: "Open" | "Coming Soon";
}

const sportColors: Record<string, string> = {
  NBA: "from-orange-500 to-red-600",
  NFL: "from-blue-600 to-blue-800",
  MLB: "from-red-500 to-red-700",
  NHL: "from-gray-500 to-gray-700",
};

export default function ChallengeCard({
  sport,
  title,
  difficulty,
  status,
}: ChallengeCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow hover:scale-[1.02] transition cursor-pointer">
      {/* Sport Badge */}
      <div
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-br ${
          sportColors[sport] || "from-slate-600 to-slate-800"
        } mb-4`}
      >
        {sport}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>

      {/* Difficulty */}
      <p className="text-sm text-slate-400 mb-4">Difficulty: {difficulty}</p>

      {/* Status */}
      <div
        className={`text-sm font-medium ${
          status === "Open" ? "text-emerald-400" : "text-slate-500"
        }`}
      >
        {status}
      </div>
    </div>
  );
}
