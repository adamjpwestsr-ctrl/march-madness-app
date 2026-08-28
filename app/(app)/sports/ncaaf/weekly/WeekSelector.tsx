"use client";

type Props = {
  week: number;
  allWeeks: number[];
  prevWeek: number | null;
  nextWeek: number | null;
};

export default function WeekSelector({
  week,
  allWeeks,
  prevWeek,
  nextWeek,
}: Props) {
  return (
    <div className="sticky top-0 z-40 bg-[var(--bb-slate)]/90 backdrop-blur-md py-3 border-b border-[var(--bb-green)]">
      <div className="flex items-center justify-between">
        <a
          href={`?week=${prevWeek}`}
          className={`px-3 py-2 rounded border ${
            prevWeek
              ? "border-[var(--bb-green)] hover:bg-[var(--bb-green)]/20"
              : "opacity-40 cursor-not-allowed"
          }`}
        >
          ← Prev
        </a>

        <select
          value={week}
          onChange={(e) => {
            window.location.href = `?week=${e.target.value}`;
          }}
          className="px-3 py-2 rounded bg-[var(--bb-slate-light)] border border-[var(--bb-green)] text-white"
        >
          {allWeeks.map((w) => (
            <option key={w} value={w}>
              Week {w}
            </option>
          ))}
        </select>

        <a
          href={`?week=${nextWeek}`}
          className={`px-3 py-2 rounded border ${
            nextWeek
              ? "border-[var(--bb-green)] hover:bg-[var(--bb-green)]/20"
              : "opacity-40 cursor-not-allowed"
          }`}
        >
          Next →
        </a>
      </div>
    </div>
  );
}
