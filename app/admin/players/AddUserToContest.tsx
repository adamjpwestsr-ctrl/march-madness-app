"use client";

import { useState, useTransition } from "react";
import { addUserToContest } from "./actions";

interface AddUserToContestProps {
  users: { user_id: number; email: string }[];
  contests: { id: string; name: string }[];
}

export default function AddUserToContest({ users, contests }: AddUserToContestProps) {
  const [userId, setUserId] = useState("");
  const [contestId, setContestId] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = () => {
    startTransition(() => addUserToContest(userId, contestId));
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 10 }}>Add User to Contest</h3>

      <select
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        style={{
          padding: 10,
          marginRight: 10,
          borderRadius: 8,
          background: "#1e293b",
          color: "white",
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
        value={contestId}
        onChange={(e) => setContestId(e.target.value)}
        style={{
          padding: 10,
          marginRight: 10,
          borderRadius: 8,
          background: "#1e293b",
          color: "white",
        }}
      >
        <option value="">Select Contest</option>
        {contests.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        onClick={onSubmit}
        disabled={isPending}
        style={{
          padding: "10px 20px",
          borderRadius: 8,
          background: "#2563eb",
          color: "white",
          cursor: "pointer",
          opacity: isPending ? 0.5 : 1,
        }}
      >
        Add
      </button>
    </div>
  );
}
