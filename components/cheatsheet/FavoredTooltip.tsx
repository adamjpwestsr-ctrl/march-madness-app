export default function FavoredTooltip() {
  return (
    <div
      className="
        absolute left-1/2 -translate-x-1/2 mt-2 w-64 
        bg-slate-800 text-slate-200 text-xs p-3 rounded-lg 
        opacity-0 group-hover:opacity-100 
        animate-tooltip 
        shadow-lg
      "
    >
      <strong>BracketBoss Algorithm™</strong><br />
      A proprietary model combining record quality, conference strength, schedule difficulty,
      recent momentum, seed advantage, and historical upset trends to estimate matchup advantage.
      Designed for insight, pair with other analytics platforms for deeper predictive confidence.
    </div>
  );
}
