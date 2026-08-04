"use client";

import { useEffect, useState } from "react";

type F1TickerRow = {
  race_id: string;
  race_name: string;
  date: string;
  driver_name: string;
  finishing_position: number;
  points: number;
};

export default async async function F1Ticker() {
  const [rows, setRows] = useState<F1TickerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await fetch("/api/f1/ticker");
      const json = await res.json();

      setRows(json || []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="text-slate-400 text-sm">
        F1 ticker loading...
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-slate-400 text-sm">
        No recent F1 results.
      </div>
    );
  }

  return (
    <div className="overflow-hidden whitespace-nowrap border-t border-slate-800 py-2">
      <div
        className="inline-block animate-scroll text-slate-200 text-sm"
        style={{ animation: "scroll 25s linear infinite" }}
      >
        <span className="font-bold text-red-400 mr-4">F1</span>

        {rows.map((row, i) => (
          <span key={i} className="mr-8">
            {row.race_name}: {row.driver_name} P{row.finishing_position} ({row.points} pts)
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
