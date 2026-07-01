"use client";

export default function GolfLeaderboardPreview({ rows }: { rows: any[] }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl p-6">
      <table className="w-full text-left text-slate-300">
        <thead>
          <tr className="text-slate-400 text-sm">
            <th className="pb-2">Rank</th>
            <th className="pb-2">Player</th>
            <th className="pb-2">Points</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((entry, i) => (
            <tr
              key={entry.user_id}
              className="border-t border-slate-800 transition-all duration-300"
            >
              <td className="py-2">{i + 1}</td>

              <td className="py-2 flex items-center gap-3">
                {entry.avatar_url ? (
                  <img
                    src={entry.avatar_url}
                    className="w-8 h-8 rounded-full object-cover"
                    alt={entry.user_name}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-700" />
                )}
                <span>{entry.user_name}</span>
              </td>

              <td className="py-2">{entry.total_points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <p className="text-slate-400 mt-4">No leaderboard data available.</p>
      )}
    </section>
  );
}
