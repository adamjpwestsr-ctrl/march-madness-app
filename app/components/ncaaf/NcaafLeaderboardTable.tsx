"use client";

import { Trophy } from "lucide-react";

export default function NcaafLeaderboardTable({ rows }: { rows: any[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-800/60 text-slate-300">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Total Points</th>
            <th className="px-4 py-3">Weekly Breakdown</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.user_id}
              className="border-t border-slate-800 hover:bg-slate-800/40 transition"
            >
              <td className="px-4 py-3 text-slate-200 font-semibold">
                {idx + 1}
              </td>

              <td className="px-4 py-3 text-slate-200">{row.username}</td>

              <td className="px-4 py-3 text-yellow-400 font-bold flex items-center gap-2">
                {row.total}
                {idx === 0 && <Trophy size={16} className="text-yellow-400" />}
              </td>

              <td className="px-4 py-3 text-slate-300">
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(row.weekly).map(([week, pts]) => (
                    <span
                      key={week}
                      className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 text-xs"
                    >
                      W{week}: {pts}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
