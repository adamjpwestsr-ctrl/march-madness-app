"use client";

import { useState, useTransition } from "react";
import { addUserToContest } from "./actions";
import { useToast } from "./Toast";

interface AddUserToContestProps {
  users: { user_id: number; email: string }[];
  contests: { id: string; name: string }[];
}

export default function AddUserToContest({ users, contests }: AddUserToContestProps) {
  const [userId, setUserId] = useState("");
  const [contestIds, setContestIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const onSubmit = () => {
    if (!userId || contestIds.length === 0) return;

    startTransition(async () => {
      await addUserToContest(userId, contestIds);
      addToast(`User added to ${contestIds.length} contest(s).`);
      setContestIds([]);
      setUserId("");
    });
  };

  const onContestChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions).map((o) => o.value);
    setContestIds(values);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 10 }}>Add User to Contest</h3>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            background: "#1e293b",
            color: "white",
            minWidth: 220,
          }}
        >
          <option value="">Select User</option>
          {users.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.email}
            </option>
          ))}
        </select>

        <select
          multiple
          value={contestIds}
          onChange={onContestChange}
          style={{
            padding: 10,
            borderRadius: 8,
            background: "#1e293b",
            color: "white",
            minWidth: 260,
            height: 80,
          }}
        >
          {contests.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          onClick={onSubmit}
          disabled={isPending || !userId || contestIds.length === 0}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: "#2563eb",
            color: "white",
            cursor: "pointer",
            opacity: isPending || !userId || contestIds.length === 0 ? 0.5 : 1,
            border: "none",
          }}
        >
          {isPending ? "Adding..." : "Add"}
        </button>
      </div>

      <p style={{ marginTop: 8, fontSize: 12, color: "#9ca3af" }}>
        Tip: Use Ctrl/Cmd + click to select multiple contests.
      </p>
    </div>
  );
}
