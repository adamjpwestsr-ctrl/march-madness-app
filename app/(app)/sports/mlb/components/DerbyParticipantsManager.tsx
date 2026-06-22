"use client";

import { useEffect, useState } from "react";

export default function DerbyParticipantsManager({ eventId }: { eventId: number }) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [hrCount, setHrCount] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");

  const loadParticipants = async () => {
    const res = await fetch(`/api/mlb/derby/participants?event_id=${eventId}`);
    const json = await res.json();
    setParticipants(json.participants || []);
  };

  const addParticipant = async () => {
    const res = await fetch("/api/mlb/derby/participants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: eventId, name, team, hr_count: hrCount, image_url: imageUrl }),
    });
    const json = await res.json();
    if (json.participant) {
      setParticipants((prev) => [...prev, json.participant]);
      setName("");
      setTeam("");
      setHrCount(0);
      setImageUrl("");
    }
  };

  const removeParticipant = async (id: number) => {
    await fetch(`/api/mlb/derby/participants?id=${id}`, { method: "DELETE" });
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    loadParticipants();
  }, [eventId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          placeholder="Player Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        />
        <input
          placeholder="Team"
          value={team}
          onChange={(e) => setTeam(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        />
        <input
          type="number"
          placeholder="HR Count"
          value={hrCount}
          onChange={(e) => setHrCount(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        />
        <input
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        />
      </div>

      <button
        onClick={addParticipant}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-sky-500 text-white font-semibold hover:opacity-90 transition"
      >
        Add Player
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {participants.map((p) => (
          <div
            key={p.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex flex-col items-center text-center"
          >
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.name}
                className="w-16 h-16 rounded-full mb-2 object-cover"
              />
            )}
            <p className="font-semibold text-slate-200">{p.name}</p>
            <p className="text-slate-400 text-sm">{p.team}</p>
            <p className="text-emerald-400 text-sm font-medium">
              {p.hr_count} HR
            </p>
            <button
              onClick={() => removeParticipant(p.id)}
              className="mt-2 text-xs text-red-400 hover:text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
