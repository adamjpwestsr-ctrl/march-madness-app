"use client";

export default function LeaderboardTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-800/60 text-slate-300">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Season Points</th>
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

              <td className="px-4 py-3 text-yellow-400 font-bold">
                {row.season_points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
