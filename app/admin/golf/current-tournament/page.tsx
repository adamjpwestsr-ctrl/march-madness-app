"use client";

import AdminSetCurrentTournament from "../../components/AdminSetCurrentTournament";

export default function GolfCurrentTournamentPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-6">Golf Weekly — Current Tournament</h1>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-3xl">
        <AdminSetCurrentTournament />
      </div>
    </div>
  );
}
