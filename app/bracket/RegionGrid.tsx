"use client";

type RegionGridProps = {
  setView: (view:
    | "region-east"
    | "region-west"
    | "region-south"
    | "region-midwest"
  ) => void;
};

export default function RegionGrid({ setView }: RegionGridProps) {
  const regions = [
    { key: "region-east", label: "East", color: "from-emerald-500 to-emerald-700" },
    { key: "region-west", label: "West", color: "from-blue-500 to-blue-700" },
    { key: "region-south", label: "South", color: "from-red-500 to-red-700" },
    { key: "region-midwest", label: "Midwest", color: "from-yellow-500 to-yellow-700" },
  ] as const;

  return (
    <div className="flex flex-col gap-6 w-full">
      <h2 className="text-xl font-bold text-slate-100 text-center">
        Select a Region
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {regions.map((r) => (
          <button
            key={r.key}
            onClick={() => setView(r.key)}
            className={`
              rounded-xl p-8 text-center text-white font-semibold text-lg
              bg-gradient-to-br ${r.color}
              shadow-lg shadow-black/40
              hover:scale-[1.03] hover:shadow-xl hover:shadow-black/50
              transition-all duration-200
            `}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
