"use client";

import { useState } from "react";

export default function NascarImportPanel({ races }: { races: any[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [raceId, setRaceId] = useState<string>("");
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);

    if (!f) {
      setPreviewRows([]);
      return;
    }

    const text = await f.text();
    const rows = text.split("\n").map((line) => line.split(",").map((v) => v.trim()));

    const headers = rows[0];
    const dataRows = rows.slice(1).map((r) =>
      Object.fromEntries(headers.map((h, i) => [h, r[i] || ""]))
    );

    setPreviewHeaders(headers);
    setPreviewRows(dataRows);
  };

  const handleUpload = async () => {
    if (!file || !raceId) {
      setStatus("error");
      return;
    }

    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("raceId", raceId);

    const res = await fetch("/api/nascar/import", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">📥 Import NASCAR Results (CSV)</h2>

      {/* Race Selector */}
      <div className="mb-4">
        <label className="text-slate-300 block mb-2">Select Race</label>
        <select
          value={raceId}
          onChange={(e) => setRaceId(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white rounded-lg p-2 w-full"
        >
          <option value="">-- Choose a race --</option>
          {races.map((race) => (
            <option key={race.id} value={race.id}>
              {race.name} — {race.date}
            </option>
          ))}
        </select>
      </div>

      {/* File Upload */}
      <div className="mb-4">
        <label className="text-slate-300 block mb-2">Upload CSV File</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="text-slate-300"
        />
      </div>

      {/* CSV Preview */}
      {previewRows.length > 0 && (
        <div className="mb-6 max-h-64 overflow-auto border border-slate-700 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-800 text-slate-300">
              <tr>
                {previewHeaders.map((h) => (
                  <th key={h} className="px-3 py-2 border-b border-slate-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, i) => (
                <tr key={i} className="odd:bg-slate-900 even:bg-slate-800">
                  {previewHeaders.map((h) => (
                    <td key={h} className="px-3 py-2 border-b border-slate-800">
                      {row[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg"
      >
        Upload CSV
      </button>

      {/* Status Messages */}
      {status === "uploading" && (
        <p className="text-emerald-400 mt-4">Uploading...</p>
      )}
      {status === "success" && (
        <p className="text-emerald-400 mt-4 font-semibold">
          CSV imported successfully!
        </p>
      )}
      {status === "error" && (
        <p className="text-red-400 mt-4 font-semibold">
          Error importing CSV. Check file and race selection.
        </p>
      )}
    </section>
  );
}
