"use client";

import { useState } from "react";
import { syncF1ScheduleFromESPN } from "@/app/api/f1/sync/schedule";
import { createF1Race } from "./actions/createRace";

export default function F1SchedulePanel() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [circuit, setCircuit] = useState("");
  const [status, setStatus] = useState("");

  async function handleCreateRace() {
    setStatus("Creating race...");

    const res = await createF1Race(name, date, circuit);

    if (!res.success) {
      console.error(res.error);
      setStatus("Error creating race");
      return;
    }

    setStatus("Race created!");
    setName("");
    setDate("");
    setCircuit("");
  }

  async function handleSyncSchedule() {
    setStatus("Syncing schedule from ESPN...");
    const res = await syncF1ScheduleFromESPN();
    setStatus(res.success ? "Schedule synced!" : "Error syncing schedule");
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">📅 F1 Schedule</h2>

      {/* ESPN Schedule Sync */}
      <button
        onClick={handleSyncSchedule}
        className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-sm font-semibold text-slate-900"
      >
        Sync Schedule from ESPN
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-slate-300 text-sm">Race Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300 text-sm">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300 text-sm">Circuit</label>
          <input
            value={circuit}
            onChange={(e) => setCircuit(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleCreateRace}
        className="px-4 py-2 rounded bg-sky-500 hover:bg-sky-400 text-sm font-semibold text-slate-900"
      >
        Create Race
      </button>

      {status && <p className="text-slate-300 text-sm mt-2">{status}</p>}
    </section>
  );
}
