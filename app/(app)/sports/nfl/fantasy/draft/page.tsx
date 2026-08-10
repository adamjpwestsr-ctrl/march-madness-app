"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FantasyDraftLobby() {
  const router = useRouter();

  // League settings
  const [leagueName, setLeagueName] = useState("My Fantasy League");
  const [season] = useState(new Date().getFullYear());
  const [numTeams, setNumTeams] = useState(10);
  const [draftType, setDraftType] = useState("snake");
  const [pickTimer, setPickTimer] = useState(60);

  // Draft order
  const [draftOrder, setDraftOrder] = useState<number[]>(
    Array.from({ length: numTeams }, (_, i) => i + 1)
  );

  // Randomize draft order
  const randomizeOrder = () => {
    const shuffled = [...draftOrder]
      .map((v) => ({ v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ v }) => v);

    setDraftOrder(shuffled);
  };

  // Create league + redirect to draft room
  const startDraft = async () => {
    const res = await fetch("/api/fantasy/league/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leagueName,
        season,
        numTeams,
        draftType,
        pickTimer,
        draftOrder,
      }),
    });

    const json = await res.json();

    if (!json?.leagueId) {
      alert("Error creating league.");
      return;
    }

    router.push(`/sports/nfl/fantasy/draft/live?leagueId=${json.leagueId}`);
  };

  return (
    <div className="space-y-8 p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Fantasy Football Draft Lobby
        </h1>
        <p className="text-slate-400">Season {season}</p>
      </div>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LEFT COLUMN — SETTINGS */}
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl space-y-6">

          <h2 className="text-xl font-semibold text-white mb-4">
            League Settings
          </h2>

          {/* League Name */}
          <div>
            <label className="text-slate-300 text-sm">League Name</label>
            <input
              className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
            />
          </div>

          {/* Number of Teams */}
          <div>
            <label className="text-slate-300 text-sm">Number of Teams</label>
            <select
              className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              value={numTeams}
              onChange={(e) => {
                const n = Number(e.target.value);
                setNumTeams(n);
                setDraftOrder(Array.from({ length: n }, (_, i) => i + 1));
              }}
            >
              {[...Array(15)].map((_, i) => (
                <option key={i + 2} value={i + 2}>
                  {i + 2} Teams
                </option>
              ))}
            </select>
          </div>

          {/* Draft Type */}
          <div>
            <label className="text-slate-300 text-sm">Draft Type</label>
            <select
              className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              value={draftType}
              onChange={(e) => setDraftType(e.target.value)}
            >
              <option value="snake">Snake Draft</option>
              <option value="linear">Linear Draft</option>
            </select>
          </div>

          {/* Pick Timer */}
          <div>
            <label className="text-slate-300 text-sm">Pick Timer</label>
            <select
              className="w-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              value={pickTimer}
              onChange={(e) => setPickTimer(Number(e.target.value))}
            >
              {[30, 60, 90, 120].map((t) => (
                <option key={t} value={t}>
                  {t} seconds
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RIGHT COLUMN — DRAFT ORDER */}
        <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl space-y-6">

          <h2 className="text-xl font-semibold text-white mb-4">
            Draft Order
          </h2>

          <button
            onClick={randomizeOrder}
            className="mb-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Randomize Order
          </button>

          <div className="space-y-2">
            {draftOrder.map((slot, idx) => (
              <div
                key={idx}
                className="bg-slate-800 border border-slate-700 p-3 rounded-lg text-white flex justify-between"
              >
                <span>Pick {idx + 1}</span>
                <span>Team {slot}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SUMMARY + START BUTTON */}
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">

        <h2 className="text-xl font-semibold text-white mb-4">
          Draft Summary
        </h2>

        <p className="text-slate-300 mb-1">League: {leagueName}</p>
        <p className="text-slate-300 mb-1">Teams: {numTeams}</p>
        <p className="text-slate-300 mb-1">Draft Type: {draftType}</p>
        <p className="text-slate-300 mb-1">Pick Timer: {pickTimer}s</p>

        <button
          onClick={startDraft}
          className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg text-lg font-semibold"
        >
          Start Draft
        </button>
      </div>
    </div>
  );
}
