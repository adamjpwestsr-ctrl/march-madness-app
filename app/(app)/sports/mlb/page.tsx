"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import MLBCalendar from "./components/MLBCalendar";
import MLBWeeklyClient from "./components/MLBWeeklyClient";
import DerbyCard from "./components/DerbyCard";
import DerbyModal from "./components/DerbyModal";
import MyDerbyPicks from "./components/MyDerbyPicks";
import PlayoffsCard from "./components/PlayoffsCard";

export default function MLBPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [streaks, setStreaks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [weeklyOverlayOpen, setWeeklyOverlayOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const [derbyModalOpen, setDerbyModalOpen] = useState(false);
  const [derbyResultsOpen, setDerbyResultsOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const lbRes = await fetch("/api/mlb/weekly/leaderboard");
        const stRes = await fetch("/api/mlb/weekly/streaks");

        const lbJson = await lbRes.json();
        const stJson = await stRes.json();

        setLeaderboard(lbJson.leaderboard || []);
        setStreaks((stJson.streaks || []).slice(0, 8)); // limit to 8 streaking teams
      } catch (err) {
        console.error("MLB main page fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-8 flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">MLB Challenge</h1>

      {/* TOP ROW: Calendar | Streaking Teams | Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <MLBCalendar
          onWeekSelect={(week: number) => {
            setSelectedWeek(week);
            setWeeklyOverlayOpen(true);
          }}
        />

        {/* Streaking Teams */}
        <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Streaking Teams</h2>

          {loading ? (
            <p className="text-slate-400 text-sm">Loading streaks…</p>
          ) : streaks.length === 0 ? (
            <p className="text-slate-400 text-sm">No streak data yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {streaks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between bg-slate-800/40 px-3 py-2 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={t.logo_url}
                      alt={t.name}
                      className="w-8 h-8 rounded-full transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/40"
                    />
                    <span className="text-slate-300">{t.abbreviation}</span>
                  </div>

                  <span
                    className={
                      t.status === "hot"
                        ? "text-emerald-400 font-bold"
                        : t.status === "cold"
                        ? "text-red-400 font-bold"
                        : "text-slate-400"
                    }
                  >
                    {t.status === "hot" ? "🔥 Hot" : t.status === "cold" ? "🧊 Cold" : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="rounded-xl bg-slate-900/70 border border-white/10 p-4 shadow-lg h-fit">
          <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>

          {loading ? (
            <p className="text-slate-400 text-sm">Loading leaderboard…</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-slate-400 text-sm">No leaderboard data yet.</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-1">
              {leaderboard.map((row, i) => (
                <div
                  key={row.user_id}
                  className="flex items-center justify-between bg-slate-800/40 px-3 py-2 rounded-lg"
                >
                  <span className="text-slate-300 font-medium">
                    {i + 1}. {row.username || `User ${row.user_id.slice(0, 6)}`}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {row.total_points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ROW: Homerun Derby | My Derby Picks | MLB Playoffs Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homerun Derby */}
        <DerbyCard
          onOpenPicks={() => setDerbyModalOpen(true)}
          onOpenResults={() => setDerbyResultsOpen(true)}
        />

        {/* My Derby Picks */}
        <MyDerbyPicks />

        {/* MLB Playoffs Challenge */}
        <PlayoffsCard />
      </div>

      {/* Weekly Overlay */}
      {weeklyOverlayOpen && selectedWeek && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-3xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Week {selectedWeek}</h2>
              <button
                onClick={() => setWeeklyOverlayOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <MLBWeeklyClient week={selectedWeek} />
          </div>
        </div>
      )}

      {/* Derby Modal */}
      {derbyModalOpen && <DerbyModal onClose={() => setDerbyModalOpen(false)} />}

      {/* Derby Results Modal (reuses DerbyModal for now) */}
      {derbyResultsOpen && <DerbyModal onClose={() => setDerbyResultsOpen(false)} />}
    </div>
  );
}
