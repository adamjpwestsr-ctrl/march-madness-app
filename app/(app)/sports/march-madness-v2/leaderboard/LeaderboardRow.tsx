
import Link from "next/link";
import { memo } from "react";
import type { LeaderboardEntry } from "./LeaderboardPanel";

type LeaderboardRowProps = {
  entry: LeaderboardEntry;
};

function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const {
    rank,
    rankChange,
    momentum,
    name,
    avatarUrl,
    score,
    groups,
    bracketId,
  } = entry;

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

  const rankStyle =
    rank === 1
      ? "text-yellow-300"
      : rank === 2
        ? "text-slate-300"
        : rank === 3
          ? "text-amber-600"
          : "text-yellow-400";

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/60 p-4 shadow-md transition hover:border-slate-500">
      {/* Rank */}
      <div
        className={`w-12 shrink-0 text-center text-2xl font-black ${rankStyle}`}
      >
        {rank}
      </div>

      {/* Participant */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img
          src={avatarUrl}
          alt={name}
          className="h-10 w-10 shrink-0 rounded-full border border-slate-600 object-cover"
        />

        <div className="min-w-0">
          <Link
            href={`/sports/march-madness-v2/bracket/view/${bracketId}`}
            className="inline-flex max-w-full items-center gap-1 font-semibold text-white transition hover:text-cyan-300 hover:underline"
            title={`View ${name}'s bracket`}
          >
            <span className="truncate">{name}</span>
            <span className="shrink-0 text-xs text-cyan-400">↗</span>
          </Link>

          <p className="truncate text-xs text-slate-400">
            {groups.join(", ")}
          </p>

          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-400/80">
            View bracket
          </p>
        </div>
      </div>

      {/* Score */}
      <div className="w-16 shrink-0 text-right text-xl font-bold text-white sm:w-20">
        {score}
      </div>

      {/* Momentum */}
      <div
        className={`hidden w-20 text-right font-semibold sm:block ${momentumColor}`}
      >
        {momentum > 0 ? `+${momentum}` : momentum}
      </div>

      {/* Rank movement */}
      <div
        className={`hidden w-20 text-right font-semibold sm:block ${rankChangeColor}`}
      >
        {rankChange > 0 && `▲ ${rankChange}`}
        {rankChange < 0 && `▼ ${Math.abs(rankChange)}`}
        {rankChange === 0 && "—"}
      </div>
    </div>
  );
}

export default memo(LeaderboardRow);
