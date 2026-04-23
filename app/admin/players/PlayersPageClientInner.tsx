"use client";

import { useState } from "react";
import PlayerRow from "./PlayerRow";
import AddUserToContest from "./AddUserToContest";
import ContestFilter from "./ContestFilter";

interface PlayersPageClientInnerProps {
  initialData: {
    users: { user_id: number; email: string }[];
    contests: { id: string; name: string; sport: string }[];
    statuses: {
      id: number;
      user_id: number;
      contest_id: string;
      is_active: boolean;
      has_paid: boolean;
      paid_at: string | null;
      email: string;
      contest_name: string;
      sport: string;
    }[];
  };
}

export default function PlayersPageClientInner({
  initialData,
}: PlayersPageClientInnerProps) {
  const { users, contests, statuses } = initialData;

  const [selectedContest, setSelectedContest] = useState("all");
  const [search, setSearch] = useState("");

  const trimmedSearch = search.trim().toLowerCase();
  const hasSearch = trimmedSearch.length > 0;

  const filtered = statuses.filter((row) => {
    const matchesSearch =
      !hasSearch || row.email.toLowerCase().includes(trimmedSearch);

    // If searching by email, ignore contest filter and show ALL contests for that user
    if (hasSearch) {
      return matchesSearch;
    }

    const matchesContest =
      selectedContest === "all" || row.contest_id === selectedContest;

    return matchesContest && matchesSearch;
  });

  return (
    <div
      style={{
        padding: 30,
        background: "#0f172a",
        minHeight: "100vh",
        color: "#e5e7eb",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Player Management
      </h1>

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <ContestFilter
          contests={contests}
          selected={selectedContest}
          onChange={setSelectedContest}
        />

        <input
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 20,
            marginBottom: 20,
            borderRadius: 8,
            background: "rgba(30,41,59,0.9)",
            border: "1px solid rgba(148,163,184,0.35)",
            color: "#e5e7eb",
          }}
        />

        <AddUserToContest users={users} contests={contests} />

        <table
          style={{
            width: "100%",
            marginTop: 30,
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #334155" }}>
              <th style={{ padding: "10px 0", textAlign: "left" }}>Email</th>
              <th style={{ padding: "10px 0", textAlign: "left" }}>Contest</th>
              <th style={{ padding: "10px 0" }}>Active</th>
              <th style={{ padding: "10px 0" }}>Paid</th>
              <th style={{ padding: "10px 0" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((row) => (
              <PlayerRow key={row.id} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
