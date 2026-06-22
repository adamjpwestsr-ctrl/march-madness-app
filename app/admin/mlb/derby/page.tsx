"use client";

import { useEffect, useState } from "react";

interface DerbyEvent {
  id: number;
  event_year: number;
  event_date: string;
  status: "open" | "closed" | "results_posted";
}

export default function AdminDerbyPage() {
  const [event, setEvent] = useState<DerbyEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [date, setDate] = useState<string>("");
  const [status, setStatus] = useState<DerbyEvent["status"]>("open");

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

  const createEvent = async () => {
    try {
      const res = await fetch("/api/mlb/derby/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_year: year, event_date: date, status }),
      });
      const json = await res.json();
      setEvent(json.event);
    } catch (err) {
      console.error("Error creating event:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-10 space-y-8">
      <h1 className="text-3xl font-bold mb-2">MLB Home Run Derby — Admin</h1>
      <p className="text-slate-400 mb-8">
        Manage the yearly Derby event, participants, and results.
      </p>

      {/* Event Setup */}
      <section className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg">
        <details open className="p-6">
          <summary className="cursor-pointer text-xl font-semibold text-white mb-4 flex items-center justify-between">
            <span>Event Setup</span>
            <span className="text-sm text-slate-400">
              {event ? "Event Loaded" : "No Event"}
            </span>
          </summary>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Event Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Event Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as DerbyEvent["status"])
                  }
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="results_posted">Results Posted</option>
                </select>
              </div>
            </div>

            <button
              onClick={createEvent}
              className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold hover:opacity-90 transition"
            >
              Create Event
            </button>
          </div>
        </details>
      </section>

{/* Participants */}
<section className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg">
  <details open className="p-6">
    <summary className="cursor-pointer text-xl font-semibold text-white mb-4">
      Participants (8 Players)
    </summary>

    {!event ? (
      <p className="text-slate-400 text-sm">
        No Derby event found. Create an event first.
      </p>
    ) : (
      <DerbyParticipantsManager eventId={event.id} />
    )}
  </details>
</section>

      {/* Results Posting */}
      <section className="bg-slate-900 border border-slate-700 rounded-xl shadow-lg">
        <details open className="p-6">
          <summary className="cursor-pointer text-xl font-semibold text-white mb-4">
            Results Posting
          </summary>

          {loading ? (
            <p className="text-slate-400 text-sm">Loading results…</p>
          ) : !event ? (
            <p className="text-slate-400 text-sm">
              No Derby event found. Create an event first.
            </p>
          ) : (
            <p className="text-slate-400 text-sm">
              Results posting UI coming soon.
            </p>
          )}
        </details>
      </section>
    </div>
  );
}
