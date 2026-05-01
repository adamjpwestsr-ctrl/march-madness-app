interface LeaderboardCardProps {
  title: string;
  value: string | number;
}

export default function LeaderboardCard({ title, value }: LeaderboardCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow">
      <p className="text-slate-400 text-sm mb-1">{title}</p>
      <h3 className="text-2xl font-semibold">{value}</h3>
    </div>
  );
}
