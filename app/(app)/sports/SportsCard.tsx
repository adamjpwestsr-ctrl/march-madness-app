interface SportsCardProps {
  sport: string;
  description: string;
}

export default function SportsCard({ sport, description }: SportsCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow hover:scale-[1.02] transition cursor-pointer">
      <h3 className="text-lg font-semibold mb-2">{sport}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}
