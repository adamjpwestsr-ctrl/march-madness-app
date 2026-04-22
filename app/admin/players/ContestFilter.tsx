"use client";

interface ContestFilterProps {
  contests: { id: string; name: string }[];
  selected: string;
  onChange: (value: string) => void;
}

export default function ContestFilter({
  contests,
  selected,
  onChange,
}: ContestFilterProps) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: 12,
        borderRadius: 8,
        background: "#1e293b",
        border: "1px solid rgba(148,163,184,0.35)",
        color: "white",
      }}
    >
      <option value="all">All Contests</option>
      {contests.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
