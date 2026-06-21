"use client";

import { useEffect, useState } from "react";

interface DerbyEvent {
  id: number;
  event_year: number;
  event_date: string;
  status: "open" | "closed" | "results_posted";
}

export default function DerbyCard({
  onOpenPicks,
  onOpenResults,
}: {
  onOpenPicks: () => void;
  onOpenResults: () => void;
}) {
  const [event, setEvent] = useState<DerbyEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/mlb/derby/event");
        const json = await res.json();
        setEvent(json.event || null);
      } catch (err) {
        console.error("Error loading Derby event:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusBadge = (status: DerbyEvent["status"]) => {
    switch (status) {
      case "open":
        return (
          <span className="px-2 py-1 text-xs rounded-md bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            Open
          </span>
        );
      case "closed":
        return (
          <span className="px-2 py-1 text-xs rounded-md bg-yellow-600/20 text-yellow-400 border border-yellow-500/30">
            Closed
          </span>
        );
      case "results_posted":
        return (
          <span className="px-2 py-1 text-xs rounded-md bg-sky-600/20 text-sky-400 border border-sky-500/30">
            Results Posted
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Home Run Derby</h2>
        {!loading && event && statusBadge(event.status)}
      </div>

      {loading ? (
	<p className="text-slate-400 text-sm">Loading Derby info…</p>
      ) : !event ? (
        <p className="text-slate-400 text-sm">No Derby event created yet.</p>
      ) : (
        <>
          <div className="text-slate-300 text-sm">
            <p>
              <span className="font-medium">Year:</span> {event.event_year}
            </p>
            <p>
              <span className="font-medium">Event Date:</span>{" "}
              {new Date(event.event_date).toLocaleDateString()}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 mt-2">
            {event.status === "open" && (
              <button
                onClick={onOpenPicks}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30"
              >
                Make Picks
              </button>
            )}

            {event.status === "closed" && (
              <button
                disabled
                className="w-full py-2 rounded-lg bg-slate-800 text-slate-500 cursor-not-allowed font-semibold text-sm"
              >
                Picks Locked
              </button>
            )}

            {event.status === "results_posted" && (
              <button
                onClick={onOpenResults}
                className="w-full py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-600/30"
              >
                View Results
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
