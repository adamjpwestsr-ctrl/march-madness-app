import { FaTrophy, FaFlagCheckered, FaGolfBall } from "react-icons/fa";

export type ChallengeStatus = "Open" | "Coming Soon";

export interface ChallengeCardProps {
  sport: string;
  title: string;
  difficulty: string;
  status: ChallengeStatus;

  // ⭐ NEW props
  category?: "major" | "signature" | "fedex" | "standard" | null;
  is_premium_event?: boolean | null;
}

const sportColors: Record<string, string> = {
  NBA: "from-orange-500 to-red-600",
  NFL: "from-blue-600 to-blue-800",
  MLB: "from-red-500 to-red-700",
  NHL: "from-gray-500 to-gray-700",
  Golf: "from-green-600 to-green-800",
};

// ----------------------
// Premium Label
// ----------------------
const premiumLabel = (category: string | null, isPremium: boolean | null) => {
  if (!isPremium) return null;
  if (category === "major") return "Major";
  if (category === "signature") return "Signature";
  if (category === "fedex") return "FedEx Cup";
  return "Premium";
};

// ----------------------
// Pill Colors
// ----------------------
const categoryColor = (category: string | null) => {
  switch (category) {
    case "major":
      return "bg-emerald-500/10 text-emerald-300 border border-emerald-500/40";
    case "fedex":
      return "bg-violet-500/10 text-violet-300 border border-violet-500/40";
    case "signature":
      return "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40";
    default:
      return "bg-yellow-500/10 text-yellow-300 border border-yellow-500/40";
  }
};

// ----------------------
// Icons (Option A, icon AFTER label, B1 spacing)
// ----------------------
const categoryIcon = (category: string | null) => {
  switch (category) {
    case "major":
      return <FaTrophy className="text-emerald-300 text-xs" />;
    case "fedex":
      return <FaFlagCheckered className="text-violet-300 text-xs" />;
    default:
      return <FaGolfBall className="text-yellow-300 text-xs" />;
  }
};

export default function ChallengeCard({
  sport,
  title,
  difficulty,
  status,
  category = null,
  is_premium_event = null,
}: ChallengeCardProps) {
  const label = premiumLabel(category, is_premium_event);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow hover:scale-[1.02] transition cursor-pointer h-full flex flex-col justify-between">
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

      {/* Premium Pill */}
      {label ? (
        <span
          className={`inline-flex items-center gap-2 mb-3 px-3 py-1 text-[11px] uppercase tracking-wide rounded-full ${categoryColor(
            category
          )}`}
        >
          {label}
          &nbsp;&nbsp;
          {categoryIcon(category)}
        </span>
      ) : (
        // 🩶 Fallback for non‑premium cards
        <span className="text-xs text-slate-500 mb-3">Standard Challenge</span>
      )}

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
