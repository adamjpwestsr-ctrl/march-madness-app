"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LockDatePage() {
  const router = useRouter();

  const [lockDateET, setLockDateET] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // -----------------------------
  // Fetch current lock date
  // -----------------------------
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/settings/lock-date/get");
      const data = await res.json();

      if (data.lock_date) {
        // Convert UTC → ET local input format
        const utc = new Date(data.lock_date);
        const offsetMs = 4 * 60 * 60 * 1000; // ET offset (UTC-4)
        const etDate = new Date(utc.getTime() - offsetMs);

        const formatted = etDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
        setLockDateET(formatted);
      }

      setLoading(false);
    }

    load();
  }, []);

  // -----------------------------
  // Save lock date
  // -----------------------------
  async function saveLockDate() {
    setSaving(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/settings/lock-date/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lockDateET }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to update lock date");
      return;
    }

    setSuccess("Lock date updated successfully");
    setTimeout(() => setSuccess(""), 3000);
  }

  if (loading) {
    return (
      <div className="p-6 text-slate-300 text-sm">
        Loading lock date…
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl text-slate-200">
      <h1 className="text-xl font-semibold mb-4">Bracket Lock Date</h1>

      <p className="text-sm text-slate-400 mb-4">
        This is the date/time (ET) when brackets become read‑only.
      </p>

      <label className="text-sm text-slate-300 mb-1 block">
        Lock Date (Eastern Time)
      </label>

      <input
        type="datetime-local"
        value={lockDateET}
        onChange={(e) => setLockDateET(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 text-sm"
      />

      {error && (
        <div className="mt-3 text-red-400 text-sm">{error}</div>
      )}

      {success && (
        <div className="mt-3 text-emerald-400 text-sm">{success}</div>
      )}

      <button
        onClick={saveLockDate}
        disabled={saving}
        className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
      >
        {saving ? "Saving…" : "Save Lock Date"}
      </button>
    </div>
  );
}
