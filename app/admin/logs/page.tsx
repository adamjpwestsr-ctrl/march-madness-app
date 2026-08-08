"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";

export default function AdminLogsPage() {
  const supabase = createSupabaseBrowserClient();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      // Expected schema:
      // logs: id, event, detail, created_at, user_email
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setLogs(data);
      }

      setLoading(false);
    }

    loadLogs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin: System Logs</h1>

      {loading ? (
        <p className="text-center text-slate-400">Loading logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-center text-slate-400">No logs found.</p>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-slate-400 border-b border-slate-700">
              <tr>
                <th className="py-2 px-2">Event</th>
                <th className="py-2 px-2">Detail</th>
                <th className="py-2 px-2">User</th>
                <th className="py-2 px-2">Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-800 hover:bg-slate-800/40 transition"
                >
                  <td className="py-2 px-2 font-semibold text-white">
                    {log.event}
                  </td>
                  <td className="py-2 px-2 text-slate-300">{log.detail}</td>
                  <td className="py-2 px-2 text-slate-400">
                    {log.user_email || "—"}
                  </td>
                  <td className="py-2 px-2 text-slate-500 text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
