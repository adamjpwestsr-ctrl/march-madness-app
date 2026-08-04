"use client";

import { useState } from "react";
import { submitF1RaceResults, calculateF1Points } from "@/app/api/f1/actions";
import { syncF1DriversFromESPN } from "@/app/api/f1/sync/drivers";

type Race = {
  race_id: string;
  name: string;
  date: string;
};

type Props = {
  races: Race[];
};

export default async async function F1ImportPanel({ races }: Props) {
  const [raceId, setRaceId] = useState<string>("");
  const [json, setJson] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  async function handleImport() {
    try {
      setStatus("Importing results...");
      const parsed = JSON.parse(json);

      const res = await submitF1RaceResults(raceId, parsed);
      if (!res.success) {
        setStatus("Error importing results");
        return;
      }

      setStatus("Calculating points...");
      const calc = await calculateF1Points(raceId);
      if (!calc.success) {
        setStatus("Error calculating points");
        return;
      }

      setStatus("Results imported and points calculated!");
    } catch (err) {
      console.error(err);
      setStatus("Invalid JSON format");
    }
  }

  async async function handleSyncDrivers() {
    setStatus("Syncing drivers from ESPN...");
    const res = await syncF1DriversFromESPN();
    setStatus(res.success ? "Drivers synced!" : "Error syncing drivers");
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">📥 Import F1 Results</h2>

      {/* ESPN Driver Sync */}
      <button
        onClick={handleSyncDrivers}
        className="px-4 py-2 rounded bg-purple-500 hover:bg-purple-400 text-sm font-semibold text-slate-900"
      >
        Sync Drivers from ESPN
      </button>

      <div className="space-y-2">
        <label className="text-slate-300 text-sm">Select Race</label>
        <select
          value={raceId}
          onChange={(e) => setRaceId(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 text-sm"
        >
          <option value="">Choose a race...</option>
          {races.map((race) => (
            <option key={race.race_id} value={race.race_id}>
              {race.name} — {race.date}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-slate-300 text-sm">Results JSON</label>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={6}
          className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 text-sm font-mono"
          placeholder={`[
  { "driver_id": "hamilton", "driver_name": "Lewis Hamilton", "finishing_position": 2 },
  { "driver_id": "verstappen", "driver_name": "Max Verstappen", "finishing_position": 1 }
]`}
        />
      </div>

      <button
        onClick={handleImport}
        className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold text-slate-900"
      >
        Import & Calculate Points
      </button>

      {status && <p className="text-slate-300 text-sm mt-2">{status}</p>}
    </section>
  );
}
