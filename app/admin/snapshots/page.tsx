"use client";

import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useState } from "react";

export default function SnapshotPage() {
const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(4);

  const takeSnapshot = async () => {
    setLoading(true);

    const { error } = await supabase.rpc("snapshot_payouts", {
      snapshot_round: round,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Snapshot failed");
    } else {
      alert("Snapshot saved!");
    }
  };

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>Payout Snapshots</h1>

      <label style={{ display: "block", marginBottom: 10 }}>
        Snapshot Round:
      </label>

      <select
        value={round}
        onChange={(e) => setRound(Number(e.target.value))}
        style={{ padding: 10, marginBottom: 20, color: "black" }}
      >
        <option value={1}>Round of 64</option>
        <option value={2}>Round of 32</option>
        <option value={3}>Sweet 16</option>
        <option value={4}>Elite 8</option>
        <option value={5}>Final Four</option>
        <option value={6}>Championship</option>
      </select>

      <button
        onClick={takeSnapshot}
        disabled={loading}
        style={{
          padding: "12px 20px",
          background: loading ? "#555" : "#2563eb",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {loading ? "Saving..." : "Save Snapshot"}
      </button>
    </div>
  );
}
