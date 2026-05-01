interface TriviaModeCardProps {
  title: string;
  description: string;
  color: string;
  status: string;
}

export default function TriviaModeCard({
  title,
  description,
  color,
  status,
}: TriviaModeCardProps) {
  const isDisabled = status === "Coming Soon";

  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900 p-6 shadow transition ${
        isDisabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] cursor-pointer"
      }`}
    >
      {/* Title Badge */}
      <div
        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-br ${color} mb-4`}
      >
        {title}
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm mb-6">{description}</p>

      {/* Status Button */}
      <button
        disabled={isDisabled}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          isDisabled
            ? "bg-slate-800 text-slate-500"
            : "bg-emerald-600 hover:bg-emerald-700 text-white"
        }`}
      >
        {status}
      </button>
    </div>
  );
}
