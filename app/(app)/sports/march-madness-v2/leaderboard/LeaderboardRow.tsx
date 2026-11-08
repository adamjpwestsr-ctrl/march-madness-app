
import { memo } from "react";
import type { LeaderboardEntry } from "./LeaderboardPanel";

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
};

function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const { rank, rankChange, momentum, name, avatarUrl, score, groups } = entry;

  const rankChangeColor =
    rankChange > 0
      ? "text-green-400"
      : rankChange < 0
      ? "text-red-400"
      : "text-slate-400";

  const momentumColor =
    momentum > 0
      ? "text-green-300"
      : momentum < 0
      ? "text-red-300"
      : "text-slate-400";

  return (
    <div className="flex items-center justify-between bg-slate-900/60 border border-slate-700 rounded-lg p-4 shadow-md">
      <div className="text-2xl font-bold text-yellow-400 w-12 text-center">
        {rank}
      </div>

      <div className="flex items-center gap-3 flex-1">
        <img
          src={avatarUrl}
          alt={name}
          className="w-10 h-10 rounded-full border border-slate-600"
        />
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-xs text-slate-400">{groups.join(", ")}</p>
        </div>
      </div>

      <div className="text-xl font-bold text-white w-20 text-right">
        {score}
      </div>

      <div className={`w-20 text-right font-semibold ${momentumColor}`}>
        {momentum > 0 ? `+${momentum}` : momentum}
      </div>

      <div className={`w-20 text-right font-semibold ${rankChangeColor}`}>
        {rankChange > 0 && `▲ ${rankChange}`}
        {rankChange < 0 && `▼ ${Math.abs(rankChange)}`}
        {rankChange === 0 && "—"}
      </div>
    </div>
  );
}

export default memo(LeaderboardRow);
