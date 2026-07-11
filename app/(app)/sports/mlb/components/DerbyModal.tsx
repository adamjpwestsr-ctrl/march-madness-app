"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface DerbyEvent {
  id: number;
  event_year: number;
  status: "open" | "closed" | "results_posted";
}

interface DerbyPlayer {
  id: number;
  player_name: string;
  team_name: string;
  hr_count: number;
  image_url: string | null;
}

interface UserPick {
  id: number;
  user_id: string;
  event_id: number;
  player_id: number;
  predicted_hr_total: number;
}

export default function DerbyModal({ onClose }: { onClose: () => void }) {
  const [event, setEvent] = useState<DerbyEvent | null>(null);
  const [players, setPlayers] = useState<DerbyPlayer[]>([]);
  const [userPick, setUserPick] = useState<UserPick | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [predictedHR, setPredictedHR] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ⭐ NEW: Session indicator
  const [sessionUser, setSessionUser] = useState<any | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  };

  // Load session user
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/user");
      const json = await res.json();
      setSessionUser(json.user || null);
    })();
  }, []);

  // Load Derby data
  useEffect(() => {
    (async () => {
      try {
        const eventRes = await fetch("/api/mlb/derby/event");
        const eventJson = await eventRes.json();
        setEvent(eventJson.event || null);

        if (eventJson.event) {
          const eventId = eventJson.event.id;

          const playersRes = await fetch(
            `/api/mlb/derby/participants?event_id=${eventId}`
          );
          const playersJson = await playersRes.json();
          setPlayers(playersJson.participants || []);

          const pickRes = await fetch(`/api/mlb/derby/pick?event_id=${eventId}`);
          const pickJson = await pickRes.json();

          if (pickJson.pick) {
            setUserPick(pickJson.pick);
            setSelectedPlayer(pickJson.pick.player_id);
            setPredictedHR(pickJson.pick.predicted_hr_total);
          }
        }
      } catch (err) {
        console.error("Derby modal load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!event) return;
    if (!selectedPlayer || !predictedHR) {
      showToast("Please select a player and enter HR prediction.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/mlb/derby/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.id,
          player_id: selectedPlayer,
          predicted_hr_total: predictedHR,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      setUserPick(json.pick);
      showToast("Pick Locked In!");

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly =
    event?.status === "closed" || event?.status === "results_posted";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-3xl shadow-2xl relative animate-scaleIn">
        
        {/* ⭐ HEADER WITH SESSION INDICATOR */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Home Run Derby Picks</h2>

            {sessionUser && (
              <span className="text-xs text-slate-400 mt-1">
                Logged in as{" "}
                <span className="text-sky-400 font-semibold">
                  {sessionUser.email}
                </span>
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg transition-transform hover:scale-110"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading Derby data…</p>
        ) : !event ? (
          <p className="text-slate-400 text-sm">No Derby event found.</p>
        ) : (
          <>
            {/* Player Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-1">
              {players.map((p) => {
                const isSelected = selectedPlayer === p.id;

                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-4 flex flex-col gap-3 transition cursor-pointer ${
                      isSelected
                        ? "border-emerald-500 shadow-lg shadow-emerald-600/30 animate-pulse"
                        : "border-slate-700 hover:border-slate-500"
                    }`}
                    onClick={() => !isReadOnly && setSelectedPlayer(p.id)}
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.player_name}
                        className="w-full h-40 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-40 bg-slate-700 rounded-md flex items-center justify-center text-slate-400 text-sm">
                        No image
                      </div>
                    )}

                    <div className="text-sm">
                      <p className="font-semibold">{p.player_name}</p>
                      <p className="text-slate-400">{p.team_name}</p>
                      <p className="text-slate-400">{p.hr_count} HRs</p>
                    </div>

                    {isSelected && (
                      <span className="text-emerald-400 text-xs font-semibold animate-fadeIn">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* HR Prediction */}
            <div className="mt-4">
              <label className="text-sm text-slate-300">Predicted HR Total</label>
              <input
                type="number"
                value={predictedHR ?? ""}
                onChange={(e) => setPredictedHR(Number(e.target.value))}
                disabled={isReadOnly}
                className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-700 disabled:text-slate-500"
                placeholder="Example: 47"
              />
            </div>

            {/* Save Button */}
            {!isReadOnly && (
              <button
                onClick={handleSave}
                disabled={saving}
                className={`mt-4 w-full py-3 rounded-lg font-semibold text-sm transition-all ${
                  saving
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-sky-500 hover:opacity-90 text-white shadow-lg shadow-emerald-600/30"
                }`}
              >
                {saving ? "Saving..." : "Save Pick"}
              </button>
            )}

            {isReadOnly && (
              <p className="mt-4 text-slate-400 text-sm text-center">
                Picks are locked. Event is {event.status.replace("_", " ")}.
              </p>
            )}
          </>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold shadow-lg">
              🎉 {toast}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
