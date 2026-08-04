"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

export default async function NcaafSchedulePanel() {
  const [status, setStatus] = useState("");

  async function handleSyncSchedule() {
    try {
      setStatus("Syncing schedule from ESPN...");
      const res = await fetch("/api/ncaaf/sync/schedule", {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) {
        console.error(data.error);
        setStatus("Error syncing schedule");
        return;
      }
      setStatus(`Schedule synced (${data.count} games).`);
    } catch (err) {
      console.error(err);
      setStatus("Unexpected error syncing schedule");
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Flag size={18} className="text-yellow-400" />
        NCAA Football Schedule
      </h2>

      <p className="text-slate-400 text-sm">
        Sync the current week&apos;s NCAA Football schedule from ESPN into Supabase.
      </p>

      <button
        onClick={handleSyncSchedule}
        className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-sm font-semibold text-slate-900"
      >
        Sync Schedule from ESPN
      </button>

      {status && <p className="text-slate-300 text-sm mt-2">{status}</p>}
    </section>
  );
}
