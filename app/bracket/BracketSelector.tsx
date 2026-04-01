// app/bracket/BracketSelector.tsx
"use client";

import { useRouter } from "next/navigation";

type Bracket = {
  id: number;
  bracket_name: string | null;
  icon?: string | null;
};

export default function BracketSelector({
  brackets,
  activeId,
}: {
  brackets: Bracket[];
  activeId: number;
}) {
  const router = useRouter();

  return (
    <div className="mb-6">
      <select
        className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700"
        value={activeId}
        onChange={(e) => {
          const id = e.target.value;
          router.push(`/bracket?bid=${id}`);
        }}
      >
        {brackets.map((b) => (
          <option key={b.id} value={b.id}>
            {b.icon || "🏀"} {b.bracket_name || "My Bracket"}
          </option>
        ))}
      </select>
    </div>
  );
}
