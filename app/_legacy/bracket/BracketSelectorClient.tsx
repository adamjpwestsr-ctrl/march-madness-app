"use client";

export default function BracketSelectorClient({
  brackets,
  activeId,
}: {
  brackets: {
    bracket_id: string;
    bracket_name: string | null;
    icon: string | null;
  }[];
  activeId: string;
}) {
  return (
    <select
      className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm"
      value={activeId}
      onChange={(e) => {
        window.location.href = `/bracket?bid=${e.target.value}`;
      }}
    >
      {brackets.map((b) => (
        <option key={b.bracket_id} value={b.bracket_id}>
          {b.icon || "🏀"} {b.bracket_name || "My Bracket"}
        </option>
      ))}
    </select>
  );
}
