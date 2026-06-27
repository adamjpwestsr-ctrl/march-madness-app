'use client';

import { useState } from 'react';
import OverrideModal from './OverrideModal';

export default function MarchMadnessAdminPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [overrideOpen, setOverrideOpen] = useState(false);

  async function run(endpoint: string, label: string) {
    setLoading(label);
    setLog((prev) => [...prev, `▶️ ${label} started...`]);

    try {
      const res = await fetch(`/api/march-madness/${endpoint}`, {
        method: 'POST',
      });

      const json = await res.json();

      setLog((prev) => [
        ...prev,
        `✅ ${label} complete: ${JSON.stringify(json)}`,
      ]);
    } catch (err) {
      setLog((prev) => [...prev, `❌ ${label} failed: ${err}`]);
    }

    setLoading(null);
  }

  return (
    <div className="p-10 text-gray-100 bg-slate-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-6">March Madness Admin</h1>

      {/* ACTION GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* ESPN SYNC */}
        <button
          onClick={() => run('sync-scoreboard', 'Sync ESPN Scoreboard')}
          disabled={loading !== null}
          className="p-5 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
        >
          {loading === 'Sync ESPN Scoreboard'
            ? '⏳ Syncing ESPN...'
            : '📡 Sync ESPN Scoreboard'}
        </button>

        {/* ADVANCE WINNERS */}
        <button
          onClick={() => run('advance', 'Advance Winners')}
          disabled={loading !== null}
          className="p-5 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
        >
          {loading === 'Advance Winners'
            ? '⏳ Advancing...'
            : '🏀 Advance Winners'}
        </button>

        {/* SCORE ENGINE */}
        <button
          onClick={() => run('score', 'Recalculate Scores')}
          disabled={loading !== null}
          className="p-5 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
        >
          {loading === 'Recalculate Scores'
            ? '⏳ Scoring...'
            : '📊 Recalculate Scores'}
        </button>

        {/* SETUP TOURNAMENT */}
        <button
          onClick={() => run('admin/setup', 'Setup Tournament')}
          disabled={loading !== null}
          className="p-5 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
        >
          {loading === 'Setup Tournament'
            ? '⏳ Setting up...'
            : '🛠️ Setup Tournament'}
        </button>

        {/* OVERRIDE GAME — now opens modal */}
        <button
          onClick={() => setOverrideOpen(true)}
          disabled={loading !== null}
          className="p-5 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
        >
          ⚠️ Override Game Result
        </button>

        {/* REFRESH STATE */}
        <button
          onClick={() => run('state', 'Refresh State')}
          disabled={loading !== null}
          className="p-5 rounded-xl bg-slate-800 border border-slate-600 hover:bg-slate-700 transition"
        >
          {loading === 'Refresh State'
            ? '⏳ Refreshing...'
            : '🔄 Refresh State'}
        </button>
      </div>

      {/* LOG PANEL */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-h-[400px] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-3">System Log</h2>
        <div className="space-y-2 text-sm font-mono">
          {log.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>

      {/* OVERRIDE MODAL */}
      <OverrideModal
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        onLog={(msg) => setLog((prev) => [...prev, msg])}
      />
    </div>
  );
}
