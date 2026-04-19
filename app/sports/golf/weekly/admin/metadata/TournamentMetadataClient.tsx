"use client";

import { useState } from "react";

interface Tournament {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  course: string | null;
  par: number | null;
  category: string | null;
  is_playoff: boolean | null;
}

export default function TournamentMetadataClient({
  tournaments,
}: {
  tournaments: Tournament[];
}) {
  const [selectedId, setSelectedId] = useState<number | null>(
    tournaments[0]?.id ?? null
  );

  const selected = tournaments.find((t) => t.id === selectedId);

  const [form, setForm] = useState<any>({});

  const update = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!selectedId) return;

    const res = await fetch("/sports/golf/weekly/admin/metadata/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedId,
        ...form,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      alert(json.error || "Error saving metadata");
    } else {
      alert("Tournament updated");
    }
  };

  if (!selected) return null;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 flex flex-col gap-10">
      <h1 className="text-3xl font-bold text-center">Tournament Metadata</h1>

      {/* Tournament selector */}
      <div className="flex flex-wrap gap-3 justify-center">
        {tournaments.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSelectedId(t.id);
              setForm({});
            }}
            className={`
              px-4 py-2 rounded-sm border text-sm
              ${
                selectedId === t.id
                  ? "bg-emerald-600 border-emerald-400"
                  : "bg-slate-900 border-slate-700 hover:border-emerald-500"
              }
            `}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Metadata form */}
      <div className="max-w-xl mx-auto bg-slate-900/40 border border-slate-700/60 rounded-sm p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Edit Tournament</h2>

        <label className="block text-sm text-slate-300">
          Name
          <input
            type="text"
            defaultValue={selected.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-sm px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-300">
          Start Date
          <input
            type="date"
            defaultValue={selected.start_date?.slice(0, 10)}
            onChange={(e) => update("start_date", e.target.value)}
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-sm px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-300">
          End Date
          <input
            type="date"
            defaultValue={selected.end_date?.slice(0, 10)}
            onChange={(e) => update("end_date", e.target.value)}
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-sm px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-300">
          Course
          <input
            type="text"
            defaultValue={selected.course || ""}
            onChange={(e) => update("course", e.target.value)}
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-sm px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-300">
          Par
          <input
            type="number"
            defaultValue={selected.par ?? ""}
            onChange={(e) => update("par", Number(e.target.value))}
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-sm px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-300">
          Category
          <select
            defaultValue={selected.category || "standard"}
            onChange={(e) => update("category", e.target.value)}
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-sm px-3 py-2"
          >
            <option value="standard">Standard</option>
            <option value="major">Major</option>
            <option value="signature">Signature</option>
            <option value="fedex">FedEx</option>
            <option value="fall">Fall</option>
          </select>
        </label>

        <label className="block text-sm text-slate-300">
          Playoff Event
          <select
            defaultValue={selected.is_playoff ? "true" : "false"}
            onChange={(e) => update("is_playoff", e.target.value === "true")}
            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-sm px-3 py-2"
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>

        <button
          onClick={save}
          className="w-full mt-6 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-sm font-semibold"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
