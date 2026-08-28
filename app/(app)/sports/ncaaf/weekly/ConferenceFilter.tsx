"use client";

const filters = [
  { key: "ALL", label: "All Games" },
  { key: "POWER5", label: "Power 5" },
  { key: "G5", label: "Group of 5" },
  { key: "INDEPENDENT", label: "Independents" },
];

export default function ConferenceFilter({
  filter,
  setFilter,
}: {
  filter: string;
  setFilter: (f: string) => void;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={`px-4 py-2 rounded border text-sm whitespace-nowrap ${
            filter === f.key
              ? "border-[var(--bb-gold)] bg-[var(--bb-green)]/30 text-white"
              : "border-[var(--bb-green)] bg-[var(--bb-slate-light)] text-white hover:bg-[var(--bb-green)]/20"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
