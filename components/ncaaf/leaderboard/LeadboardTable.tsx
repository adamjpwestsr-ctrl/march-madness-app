export default function LeaderboardTable({ rows }: { rows: any[] }) {
  return (
    <div className="rounded-xl bg-[var(--bb-slate-light)] p-4 border border-[var(--bb-green)]">
      <table className="w-full text-left text-white">
        <thead>
          <tr className="text-[var(--bb-gold)]">
            <th className="py-2">Rank</th>
            <th className="py-2">User</th>
            <th className="py-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.userId} className="border-t border-[var(--bb-green)]/40">
              <td className="py-2">{i + 1}</td>
              <td className="py-2">{r.email}</td>
              <td className="py-2 font-bold">{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
