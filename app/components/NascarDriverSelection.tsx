"use client";

import { useState } from "react";
import { submitNascarPick } from "@/app/api/nascar/actions";

export default function NascarDriverSelection({
  race,
  drivers,
  userId,
}: {
  race: any;
  drivers: any[];
  userId: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handlePick = async (driverId: string) => {
    setSelected(driverId);
    setStatus("saving");

    await submitNascarPick(userId, race.id, driverId);

    setStatus("saved");
  };

  if (!race) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-slate-400">
        No active NASCAR race this week.
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-xl font-semibold text-white mb-2">
        🏁 NASCAR Challenge — {race.name}
      </h2>
      <p className="text-slate-400 mb-4">
        Pick your driver for this week’s race. Earn points for laps led, stage wins, and race victory.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {drivers.map((d) => {
          const isSelected = selected === d.driver_id;

          return (
            <button
              key={d.driver_id}
              onClick={() => handlePick(d.driver_id)}
              className={`flex flex-col items-center gap-2 rounded-lg p-4 transition border
                ${
                  isSelected
                    ? "bg-emerald-600/40 border-emerald-400"
                    : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
                }
              `}
            >
              <img
                src={d.photoUrl}
                alt={d.driverName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <span className="text-white font-medium">{d.driverName}</span>
            </button>
          );
        })}
      </div>

      {status === "saving" && (
        <p className="text-emerald-400 mt-4">Saving your pick...</p>
      )}

      {status === "saved" && (
        <p className="text-emerald-400 mt-4 font-semibold">
          Your pick has been saved!
        </p>
      )}
{status === "saved" && (
  <p className="text-amber-300 mt-2 text-sm italic">
    To my son — thank you for letting me build this NASCAR challenge for you. I love you. Go Bubba #23!
  </p>
)}

    </section>
  );
}
