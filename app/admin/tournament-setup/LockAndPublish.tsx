"use client";

import { useState } from "react";
import { updateLockTime, publishTournament } from "./actions";

export default function LockAndPublish() {
  const [lockTime, setLockTime] = useState("");

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Tournament Lock Time</h3>

      <input
        type="datetime-local"
        value={lockTime}
        onChange={(e) => setLockTime(e.target.value)}
        style={{
          padding: 10,
          borderRadius: 6,
          background: "#1e293b",
          border: "1px solid #334155",
          color: "white",
          marginRight: 10,
        }}
      />

      <button
        onClick={() => updateLockTime(lockTime)}
        style={{
          padding: "10px 20px",
          background: "#16a34a",
          borderRadius: 6,
          border: "none",
          color: "white",
          fontWeight: 600,
          marginRight: 10,
        }}
      >
        Save Lock Time
      </button>

      <button
        onClick={publishTournament}
        style={{
          padding: "10px 20px",
          background: "#9333ea",
          borderRadius: 6,
          border: "none",
          color: "white",
          fontWeight: 600,
        }}
      >
        Publish Tournament
      </button>
    </div>
  );
}

