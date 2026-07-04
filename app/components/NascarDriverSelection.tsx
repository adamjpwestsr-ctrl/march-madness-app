"use client";

import { useState } from "react";
import confetti from "canvas-confetti";

interface Driver {
  driver_id: string;
  driver_name: string;
  number: number;
  manufacturer: string;
  team: string;
}

interface Race {
  race_id: string;
  name: string;
}

interface NascarDriverSelectionProps {
  race: Race;
  drivers: Driver[];
  userId: string;
}

export default function NascarDriverSelection({
  race,
  drivers,
  userId,
}: NascarDriverSelectionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showDedication, setShowDedication] = useState(false);

  const handlePickClick = (driverId: string) => {
    setSelected(driverId);
    setConfirming(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selected) return;

    setStatus("saving");
    setConfirming(false);

    try {
      const res = await fetch("/api/nascar/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  raceId: race.race_id,
  driverId: selected,
}),

      });

      const json = await res.json();

      if (!json.success) {
        console.error("Error submitting NASCAR pick:", json.error);
        setStatus("idle");
        return;
      }

      // 🎉 Confetti celebration
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      setStatus("saved");

      // 💛 Show dedication pop‑up until user closes it
      setShowDedication(true);
    } catch (err) {
      console.error("Error submitting NASCAR pick:", err);
      setStatus("idle");
    }
  };

  const handleCancel = () => setConfirming(false);
  const handleCloseDedication = () => setShowDedication(false);

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
              onClick={() => handlePickClick(d.driver_id)}
              className={`flex flex-col items-center gap-2 rounded-lg p-4 transition border ${
                isSelected
                  ? "bg-emerald-600/40 border-emerald-400 ring-2 ring-emerald-400 shadow-[0_0_10px_#00ffcc]"
                  : "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50 hover:scale-105"
              }`}
            >
              <div className="flex flex-col items-center justify-center w-20 h-24">
                <span
                  className="font-extrabold italic text-6xl mb-1"
                  style={{
                    fontFamily: "'Impact', 'Bebas Neue', sans-serif",
                    transform: "skew(-10deg)",
                    background:
                      d.manufacturer.toLowerCase() === "chevrolet"
                        ? "linear-gradient(180deg, #fff 0%, #f5d142 45%, #b8860b 100%)"
                        : d.manufacturer.toLowerCase() === "ford"
                        ? "linear-gradient(180deg, #fff 0%, #93c5fd 45%, #1e3a8a 100%)"
                        : "linear-gradient(180deg, #fff 0%, #d1d5db 45%, #374151 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {d.number}
                </span>

                <img
                  src={`/images/manufacturers/${d.manufacturer.toLowerCase()}.png`}
                  alt={d.manufacturer}
                  className="w-full h-12 object-contain"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
                  }}
                  onError={(e) => {
                    // fallback to SVG if PNG missing
                    (e.currentTarget as HTMLImageElement).src =
                      `/images/manufacturers/${d.manufacturer.toLowerCase()}.svg`;
                  }}
                />
              </div>

              <span className="text-white font-medium">{d.driver_name}</span>
              <span className="text-slate-400 text-sm">#{d.number}</span>
              <span className="text-slate-500 text-xs">{d.team}</span>
            </button>
          );
        })}
      </div>

      {/* Confirmation popup */}
      {confirming && selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-slate-800 border border-emerald-400 rounded-xl p-6 text-center text-white">
            <h3 className="text-lg font-semibold mb-4">
              Your pick for this event:
            </h3>

            <div className="rounded-lg border border-emerald-400 p-4 mb-4">
              <p className="text-5xl font-extrabold italic mb-2">
                {drivers.find((d) => d.driver_id === selected)?.number}
              </p>

              <img
                src={`/images/manufacturers/${drivers.find((d) => d.driver_id === selected)?.manufacturer.toLowerCase()}.png`}
                alt="logo"
                className="w-16 h-16 mx-auto mb-2 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    `/images/manufacturers/${drivers.find((d) => d.driver_id === selected)?.manufacturer.toLowerCase()}.svg`;
                }}
              />

              <p className="font-semibold">
                {drivers.find((d) => d.driver_id === selected)?.driver_name}
              </p>

              <p className="text-slate-400 text-sm">
                #{drivers.find((d) => d.driver_id === selected)?.number}
              </p>

              <p className="text-slate-500 text-xs">
                {drivers.find((d) => d.driver_id === selected)?.team}
              </p>
            </div>

            <p className="text-amber-300 mb-4">
              Are you sure you want this pick?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold"
              >
                Yes — Submit
              </button>

              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold"
              >
                No — Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedication pop‑up with fade animation and close button */}
      {showDedication && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 transition-opacity duration-700 opacity-100">
          <div className="bg-slate-800 border border-amber-400 rounded-xl p-6 text-center text-white shadow-lg transition-all duration-700 transform opacity-100 scale-100">
            <p className="text-amber-300 italic text-lg mb-4">
              To my son — thank you for letting me build this NASCAR challenge for you.  
              I love you. Go Bubba #23!
            </p>
            <button
              onClick={handleCloseDedication}
              className="mt-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold rounded-lg transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {status === "saved" && (
        <p className="text-emerald-400 mt-4 font-semibold">
          Your pick has been saved!
        </p>
      )}
    </section>
  );
}
