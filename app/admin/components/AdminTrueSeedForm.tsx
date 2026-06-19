"use client";

import { useState } from "react";

export default function AdminTrueSeedForm() {
  const [rows, setRows] = useState(
    Array.from({ length: 76 }, (_, i) => ({ true_seed: i + 1, team_name: "" }))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (index: number, value: string) => {
    const updated = [...rows];
    updated[index].team_name = value;
    setRows(updated);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/true-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ ${data.message}`);
      } else {
        setMessage(`❌ ${data.error || "Failed to save true seed list"}`);
      }
    } catch (err: any) {
      setMessage(`❌ Network error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-800 p-6 rounded-lg border border-slate-600">
      <h2 className="text-xl font-semibold text-center text-slate-100">
        True Seed List Input
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto">
        {rows.map((row, i) => (
          <div key={row.true_seed} className="flex items-center gap-2">
            <span className="text-slate-300 w-6 text-right">{row.true_seed}</span>
            <input
              type="text"
              value={row.team_name}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder="Team name"
              className="flex-1 rounded-md bg-slate-700 text-slate-100 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="mt-4 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save True Seed List"}
      </button>

      {message && (
        <p
          className={`text-sm ${
            message.startsWith("✅") ? "text-green-500" : "text-red-500"
          } text-center`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

