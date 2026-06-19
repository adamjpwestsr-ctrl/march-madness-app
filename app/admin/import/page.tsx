"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";

const SPORTS = ["NFL", "MLB", "NBA", "NHL", "NCAAF"];

export default function AdminImportPage() {
  const [sport, setSport] = useState("NFL");
  const [season, setSeason] = useState(new Date().getFullYear());
  const [file, setFile] = useState<File | null>(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Preview state
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Load import logs
  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    const res = await fetch("/api/admin/import/logs");
    const data = await res.json();
    setLogs(data.rows || []);
  }

  async function clearSeason() {
    if (!confirm(`Clear all matchups for ${sport} ${season}?`)) return;

    setLoading(true);

    const res = await fetch("/api/admin/import/clear", {
      method: "POST",
      body: JSON.stringify({ sport, season_year: season }),
    });

    setLoading(false);

    if (res.ok) {
      alert("Season cleared!");
      loadLogs();
    } else {
      alert("Error clearing season");
    }
  }

  // CSV preview parser
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);

    if (!selected) {
      setPreviewRows([]);
      setShowPreview(false);
      return;
    }

    const text = await selected.text();

    const { data, errors, meta } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      alert("CSV parse error — check formatting.");
      console.error(errors);
      return;
    }

    setPreviewHeaders(meta.fields || []);
    setPreviewRows(data);
    setShowPreview(true);
  }

  async function uploadCSV() {
    if (!file) {
      alert("Please select a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    const res = await fetch("/api/admin/import/upload", {
      method: "POST",
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      const json = await res.json();
      alert(`Imported ${json.count} matchups!`);
      loadLogs();
      setFile(null);
      setPreviewRows([]);
      setShowPreview(false);
    } else {
      alert("Error importing CSV");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-8">Season Import Tools</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">

          {/* Sport + Season Selector */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Select Sport & Season</h2>

            <div className="flex gap-4">
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="px-3 py-2 rounded bg-slate-800 border border-slate-700"
              >
                {SPORTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <input
                type="number"
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                className="px-3 py-2 rounded bg-slate-800 border border-slate-700 w-32"
              />
            </div>
          </div>

          {/* Clear Season */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Clear Last Season</h2>

            <button
              onClick={clearSeason}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Clearing..." : `Clear ${sport} ${season}`}
            </button>
          </div>

          {/* Upload CSV + Preview */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Upload New Season CSV</h2>

            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="mb-4"
            />

            {showPreview && (
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

            <button
              onClick={uploadCSV}
              disabled={loading || !file}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Importing..." : "Import CSV"}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">

          {/* Import Logs */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Import History</h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {logs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex justify-between bg-slate-800 px-3 py-2 rounded-lg text-sm"
                >
                  <div>
                    <div className="font-semibold">{log.sport}</div>
                    <div className="text-slate-400">{log.action}</div>
                  </div>

                  <div className="text-right">
                    <div>{new Date(log.timestamp).toLocaleString()}</div>
                    <div className="text-emerald-400">{log.row_count || 0} rows</div>
                  </div>
                </div>
              ))}

              {logs.length === 0 && (
                <p className="text-slate-500 text-sm">No import logs yet.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

