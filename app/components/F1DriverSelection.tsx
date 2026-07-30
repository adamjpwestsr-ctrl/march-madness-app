"use client";

import { useState } from "react";
import { submitF1Pick } from "@/app/api/f1/actions";

type Driver = {
  driver_id: string;
  driver_name: string;
  number: number;
  team: string;
  constructor: string;
  photo_url?: string;
};

type Props = {
  race: any;
  drivers: Driver[];
  userId: string;
};

export default function F1DriverSelection({ race, drivers, userId }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  async function handlePick(driverId: string) {
    if (!race) return;

    setSelected(driverId);
    setStatus("Saving...");

    const res = await submitF1Pick(race.race_id, driverId);

    if (res.success) {
      setStatus("Saved!");
    } else {
      setStatus("Error saving pick");
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">🏎️ Select Your Driver</h2>

      {!race ? (
        <p className="text-slate-400">No upcoming race available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => (
            <button
              key={driver.driver_id}
              onClick={() => handlePick(driver.driver_id)}
              className={`flex items-center gap-4 p-4 rounded-lg border transition
                ${
                  selected === driver.driver_id
                    ? "border-emerald-400 bg-emerald-400/10"
                    : "border-slate-700 hover:border-slate-500"
                }`}
            >
              {/* Driver Photo */}
              {driver.photo_url ? (
                <img
                  src={driver.photo_url}
                  alt={driver.driver_name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-700" />
              )}

              {/* Driver Info */}
              <div className="text-left">
                <p className="text-white font-semibold">
                  {driver.number} — {driver.driver_name}
                </p>
                <p className="text-slate-400 text-sm">{driver.team}</p>
                <p className="text-slate-500 text-xs">{driver.constructor}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {status && (
        <p className="text-slate-300 mt-4 text-sm">
          {status}
        </p>
      )}
    </section>
  );
}
