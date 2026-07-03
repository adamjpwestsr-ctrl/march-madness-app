"use client";

import Image from "next/image";

export default function NascarDriverGrid({
  drivers,
  selected,
  onSelect,
}: {
  drivers: any[];
  selected: string | null;
  onSelect: (driverId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {drivers.map((d) => {
        const isSelected = selected === d.driver_id;

        return (
          <button
            key={d.driver_id}
            onClick={() => onSelect(d.driver_id)}
            className={`rounded-xl p-4 flex flex-col items-center gap-3 border transition
              ${
                isSelected
                  ? "border-emerald-400 bg-emerald-600/20 shadow-lg shadow-emerald-900/40"
                  : "border-slate-700 bg-slate-800/40 hover:bg-slate-700/40"
              }
            `}
          >
            {/* Driver Headshot */}
            <div className="w-20 h-20 rounded-full overflow-hidden border border-slate-600">
              <Image
                src={d.photoUrl}
                alt={d.driverName}
                width={80}
                height={80}
                className="object-cover"
              />
            </div>

            {/* Driver Name */}
            <span className="text-white font-semibold text-center">
              {d.driverName}
            </span>

            {/* Car Number */}
            <span className="text-slate-400 text-sm">
              Car #{d.carNumber}
            </span>

            {/* Team */}
            <span className="text-slate-500 text-xs text-center">
              {d.teamName}
            </span>

            {/* Manufacturer Badge */}
            {d.manufacturerLogo && (
              <Image
                src={d.manufacturerLogo}
                alt={d.manufacturer}
                width={32}
                height={32}
                className="opacity-80"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
