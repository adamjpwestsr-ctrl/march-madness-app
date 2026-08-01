"use client";

import { useEffect, useState } from "react";
import NcaafGameCard from "@/app/components/ncaaf/NcaafGameCard";
import { submitPick } from "@/app/components/ncaaf/submitPick";

const CONFERENCES = [
  "SEC",
  "Big Ten",
  "ACC",
  "Big 12",
  "Pac-12",
  "AAC",
  "Mountain West",
  "Sun Belt",
  "MAC",
  "Independents",
];

export default function NcaafConferenceMatchups() {
  const [games, setGames] = useState<any[]>([]);
  const [conference, setConference] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/ncaaf/ticker");
      const data = await res.json();
      setGames(data.events || []);
    }
    load();
  }, []);

  const filtered =
    conference === ""
      ? []
      : games.filter((g) => g.conference === conference);

  async function handlePick(gameId: string, teamId: string) {
    setStatus("Saving pick...");
    const userId = localStorage.getItem("user_id")!;
    await submitPick(gameId, teamId, userId);
    setStatus("Pick saved!");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">By Conference</h1>

      <select
        value={conference}
        onChange={(e) => setConference(e.target.value)}
        className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded-md"
      >
        <option value="">Select Conference</option>
        {CONFERENCES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="grid gap-4">
        {filtered.map((g) => (
          <NcaafGameCard
            key={g.id}
            game={g}
            onPick={(teamId) => handlePick(g.id, teamId)}
          />
        ))}
      </div>

      {status && <p className="text-slate-300">{status}</p>}
    </div>
  );
}
