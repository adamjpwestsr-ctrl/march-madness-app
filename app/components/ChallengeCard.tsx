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
    <div
      className="
        h-[190px]                     /* ⭐ Uniform height */
        flex flex-col justify-between /* ⭐ Even spacing */
        rounded-xl
        border border-slate-800
        bg-slate-900
        p-6
        shadow
        hover:scale-[1.02]
        hover:border-sky-500
        transition
        cursor-pointer
      "
    >
      {/* Top Section */}
      <div>
        {/* Sport Badge */}
        <div
          className={`
            inline-block px-3 py-1 rounded-full text-xs font-semibold text-white
            bg-gradient-to-br
            ${sportColors[sport] || "from-slate-600 to-slate-800"}
            mb-3
          `}
        >
          {sport}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold leading-tight mb-1">
          {title}
        </h3>

        {/* Difficulty */}
        <p className="text-sm text-slate-400">
          Difficulty: {difficulty}
        </p>
      </div>

      {/* Bottom Status */}
      <div
        className={`
          text-sm font-medium mt-2
          ${status === "Open" ? "text-emerald-400" : "text-slate-500"}
        `}
      >
        {status}
      </div>
    </div>
  );
}
