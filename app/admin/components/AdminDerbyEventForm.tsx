"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type DerbyStatus = "open" | "closed" | "results_posted";

interface DerbyEvent {
  id: number;
  event_year: number;
  event_date: string; // ISO date
  status: DerbyStatus;
}

export default function AdminDerbyEventForm() {
  const [event, setEvent] = useState<DerbyEvent | null>(null);
  const [eventYear, setEventYear] = useState<number | null>(null);
  const [eventDate, setEventDate] = useState<string>("");
  const [status, setStatus] = useState<DerbyStatus>("open");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentEvent = async () => {
      const { data, error } = await supabase
        .from("mlb_derby_events")
        .select("id, event_year, event_date, status")
        .order("event_year", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const current = data[0] as DerbyEvent;
        setEvent(current);
        setEventYear(current.event_year);
        setEventDate(current.event_date);
        setStatus(current.status);
      }
    };

    fetchCurrentEvent();
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSave = async () => {
    if (!eventYear || !eventDate) {
      showToast("Please enter both event year and date.");
      return;
    }

    setLoading(true);

    try {
      if (event) {
        // Update existing event
        const { error } = await supabase
          .from("mlb_derby_events")
          .update({
            event_year: eventYear,
            event_date: eventDate,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", event.id);

        if (error) {
          showToast("Error updating Derby event.");
        } else {
          setEvent({
            ...event,
            event_year: eventYear,
            event_date: eventDate,
            status,
          });
          showToast("Derby event updated successfully.");
        }
      } else {
        // Create new event
        const { data, error } = await supabase
          .from("mlb_derby_events")
          .insert({
            event_year: eventYear,
            event_date: eventDate,
            status,
          })
          .select("id, event_year, event_date, status")
          .single();

        if (error || !data) {
          showToast("Error creating Derby event.");
        } else {
          const created = data as DerbyEvent;
          setEvent(created);
          showToast("Derby event created successfully.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-white/10 shadow-xl text-white">
      <h2 className="text-xl font-semibold mb-4">MLB Home Run Derby – Event Setup</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Event Year */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Event Year</label>
          <input
            type="number"
            value={eventYear ?? ""}
            onChange={(e) => setEventYear(e.target.value ? Number(e.target.value) : null)}
            className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            placeholder="2026"
          />
        </div>

        {/* Event Date */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Event Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-slate-300">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as DerbyStatus)}
            className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="results_posted">Results Posted</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-sm font-semibold text-white transition"
        >
          {event ? "Update Event" : "Create Event"}
        </button>

        {event && (
          <span className="text-xs text-slate-400">
            Current event: {event.event_year} – {event.event_date} ({event.status})
          </span>
        )}
      </div>

      {toast && (
        <div className="mt-4 rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-sm text-slate-100">
          {toast}
        </div>
      )}
    </div>
  );
}
