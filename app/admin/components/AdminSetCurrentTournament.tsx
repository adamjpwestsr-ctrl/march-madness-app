"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminSetCurrentTournament() {
  const [tournaments, setTournaments] = useState([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      const { data, error } = await supabase
        .from("golf_tournaments")
        .select("id, name, start_date, is_current")
        .order("start_date", { ascending: true });
      if (!error && data) {
        setTournaments(data);
        const current = data.find((t) => t.is_current);
        setCurrentId(current?.id ?? null);
      }
    };
    fetchTournaments();
  }, []);

  const handleSetCurrent = async (id: number) => {
    setLoading(true);
    try {
      await supabase.from("golf_tournaments").update({ is_current: false }).neq("id", id);
      await supabase.from("golf_tournaments").update({ is_current: true }).eq("id", id);
      setCurrentId(id);
      setToast("Current tournament updated successfully!");
    } catch {
      setToast("Error updating tournament.");
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="p-6 bg-slate-900 rounded-xl border border-white/10 shadow-xl text-white">
      <h2 className="text-xl font-semibold mb-4">Set Current Tournament</h2>

      <div className="flex flex-col gap-3">
        {tournaments.map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between p-3 rounded-lg border ${
              t.id === currentId
                ? "border-emerald-400 bg-emerald-900/30"
                : "border-white/10 bg-slate-800/50"
            }`}
          >
            <div>
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-slate-400">
                {new Date(t.start_date).toLocaleDateString()}
              </div>
            </div>

            <button
              onClick={() => handleSetCurrent(t.id)}
              disabled={loading}
              className={`px-3 py-1 rounded-md text-sm font-semibold transition-all ${
                t.id === currentId
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200"
              }`}
            >
              {t.id === currentId ? "Current" : "Set Current"}
            </button>
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-4 py-2 rounded-lg shadow-lg text-sm text-white">
          {toast}
        </div>
      )}
    </div>
  );
}
