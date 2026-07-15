"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useSupabaseSession } from "@/app/hooks/useSupabaseSession";

interface DerbyEvent {
  id: number;
  event_year: number;
  status: "open" | "closed" | "results_posted";
  event_date?: string;
  winner_player_id?: number | null;
  winning_hr_total?: number | null;
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
  const supabase = createSupabaseBrowserClient();
  const { session, loading: sessionLoading } = useSupabaseSession();

  const [event, setEvent] = useState<DerbyEvent | null>(null);
  const [players, setPlayers] = useState<DerbyPlayer[]>([]);
  const [userPick, setUserPick] = useState<UserPick | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [predictedHR, setPredictedHR] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // 🎉 Flair state
  const [hypeIndex, setHypeIndex] = useState(0);
  const hypeLines = [
    "Moonshots. Madness. Magic.",
    "Crowd roaring. Lights blazing.",
    "One champion. One perfect pick.",
    "You called the Derby like a pro."
  ];

  // 🎉 Rotate hype lines
  useEffect(() => {
    const interval = setInterval(() => {
      setHypeIndex((i) => (i + 1) % hypeLines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 🎉 Winner confetti + audio stinger
  useEffect(() => {
    if (
      event?.status === "results_posted" &&
      selectedPlayer &&
      selectedPlayer === event.winner_player_id
    ) {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.4 } });

      const audio = new Audio("/crowd-cheer.mp3");
      audio.volume = 0.4;
      audio.play();
    }
  }, [event, selectedPlayer]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  };

  // ⭐ Load Derby data ONLY after Supabase session is confirmed
  useEffect(() => {
    if (sessionLoading || !session) return;

    (async () => {
      try {
        const { data: dbUser } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", session.user.id)
          .maybeSingle();

        if (!dbUser) {
          console.error("User row not found for auth_id:", session.user.id);
          return;
        }

        const derbyUserId = dbUser.auth_id;

        const { data: eventData } = await supabase
          .from("mlb_derby_events")
          .select("*")
          .order("event_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        setEvent(eventData || null);

        if (eventData) {
          const eventId = eventData.id;

          const { data: playersData } = await supabase
            .from("mlb_derby_participants")
            .select("*")
            .eq("event_id", eventId);

          setPlayers(playersData || []);

          const { data: pickData } = await supabase
            .from("mlb_derby_picks")
            .select("*")
            .eq("user_id", derbyUserId)
            .eq("event_id", eventId)
            .maybeSingle();

          if (pickData) {
            setUserPick(pickData);
            setSelectedPlayer(pickData.player_id);
            setPredictedHR(pickData.predicted_hr_total);
          }
        }
      } catch (err) {
        console.error("Derby modal load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [session, sessionLoading]);

  const handleSave = async () => {
    if (!event || !session) return;
    if (!selectedPlayer || !predictedHR) {
      showToast("Please select a player and enter HR prediction.");
      return;
    }

    setSaving(true);

    try {
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", session.user.id)
        .maybeSingle();

      if (!dbUser) throw new Error("User not found");

      const derbyUserId = dbUser.auth_id;

      const { data, error } = await supabase
        .from("mlb_derby_picks")
        .upsert({
          user_id: derbyUserId,
          event_id: event.id,
          player_id: selectedPlayer,
          predicted_hr_total: predictedHR,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      setUserPick(data);
      showToast("Pick Locked In!");

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly =
    event?.status === "closed" || event?.status === "results_posted";

  if (sessionLoading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <p className="text-slate-400 text-sm">Checking login session…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
        <p className="text-slate-400 text-sm">
          Session expired. Please log in again.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-3xl shadow-2xl relative animate-scaleIn">

        {/* Stadium Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{ backgroundImage: "url('/stadium-lights.png')" }}
        ></div>

        {/* Spotlight Beam */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-40 bg-gradient-to-b from-emerald-500/20 to-transparent blur-xl"></div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold">Home Run Derby Picks</h2>
            <span className="text-xs text-slate-400 mt-1">
              Logged in as{" "}
              <span className="text-sky-400 font-semibold">
                {session.user.email}
              </span>
            </span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-1 relative z-10">
              {players.map((p) => {
                const isSelected = selectedPlayer === p.id;
                const isWinner = event?.winner_player_id === p.id;

                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-4 flex flex-col gap-3 transition cursor-pointer ${
                      isWinner
                        ? "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-pulse"
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
            <div className="mt-4 relative z-10">
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
              <p className="mt-4 text-slate-400 text-sm text-center relative z-10">
                Picks are locked. Event is {event.status.replace("_", " ")}.
              </p>
            )}

            {/* 🔥 HYPE BLOCK — User Picked Correct Winner */}
            {event?.status === "results_posted" &&
              event.winner_player_id &&
              selectedPlayer &&
              selectedPlayer === event.winner_player_id && (
                <div className="mt-6 p-5 rounded-xl bg-emerald-900/40 border border-emerald-600/40 text-emerald-300 text-sm font-semibold animate-fadeIn shadow-lg relative overflow-hidden">

                  {/* Spotlight Glow */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-64 h-64 bg-emerald-500/20 blur-3xl rounded-full mx-auto mt-10"></div>
                  </div>

                  🎉 The 2026 MLB Home Run Derby was absolute chaos — moonshots,
                  roaring fans, and pure electricity. But when the dust settled,
                  one slugger stood above the rest:{" "}
                  <span className="text-white font-bold">
                    {players.find((p) => p.id === event.winner_player_id)?.player_name}
                  </span>
                  . And one legend in our league called it perfectly:{" "}
                  <span className="text-white font-bold">YOU</span> nailed the
                  winning pick!

                  {/* Trophy Burst */}
                  <div className="flex items-center justify-center mt-4 animate-fadeIn">
                    <span className="text-4xl animate-trophyPulse">🏆</span>
                  </div>

                  {/* Derby Oracle Badge */}
                  <div className="mt-2 inline-block px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 text-black text-xs font-bold shadow-lg text-center mx-auto">
                    🔮 Derby Oracle
                  </div>

                  {/* Rotating Hype Lines */}
                  <p className="text-center text-emerald-300 text-sm mt-3 animate-fadeIn">
                    {hypeLines[hypeIndex]}
                  </p>
                </div>
              )}

            {/* 😢 Consolation Block — User Did NOT Pick Winner */}
            {event?.status === "results_posted" &&
              event.winner_player_id &&
              selectedPlayer &&
              selectedPlayer !== event.winner_player_id && (
                <div className="mt-6 p-5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-300 text-sm animate-fadeIn shadow-lg relative z-10">
                  The 2026 MLB Home Run Derby crowned{" "}
                  <span className="text-sky-400 font-bold">
                    {players.find((p) => p.id === event.winner_player_id)?.player_name}
                  </span>{" "}
                  as the champion! Your pick put up a fight — better luck next
                  time!
                </div>
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
