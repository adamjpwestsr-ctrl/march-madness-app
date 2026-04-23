"use client";

type LeaderboardEntry = {
  id: number;
  display_name: string;
  score: number;
  created_at: string;
};

interface Props {
  entries: LeaderboardEntry[];
  loading: boolean;
}

export default function Leaderboard({ entries, loading }: Props) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 8,
        border: "1px solid #4b5563",
        background: "#020617",
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Leaderboard</h2>
      <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
        Top 10 runs by score. You can appear more than once.
      </p>
      {loading && <p style={{ fontSize: 12 }}>Updating...</p>}
      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {entries.map((entry, index) => (
          <li
            key={entry.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #1f2933",
              fontSize: 14,
            }}
          >
            <span>
              #{index + 1} {entry.display_name}
            </span>
            <span>{entry.score} pts</span>
          </li>
        ))}
        {entries.length === 0 && (
          <li style={{ fontSize: 13, color: "#9ca3af" }}>No runs yet. Be the first.</li>
        )}
      </ol>
    </div>
  );
}
