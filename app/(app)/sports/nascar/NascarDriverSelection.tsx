"use client";

import { useState } from "react";
import { submitNascarPick } from "@/app/api/nascar/route";
import NascarDriverGrid from "./NascarDriverGrid";

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

      {/* 🔥 NEW DRIVER GRID */}
      <NascarDriverGrid
        drivers={drivers}
        selected={selected}
        onSelect={handlePick}
      />

      {status === "saving" && (
        <p className="text-emerald-400 mt-4">Saving your pick...</p>
      )}

      {status === "saved" && (
        <p className="text-emerald-400 mt-4 font-semibold">
          Your pick has been saved!
        </p>
      )}
    </section>
  );
}
