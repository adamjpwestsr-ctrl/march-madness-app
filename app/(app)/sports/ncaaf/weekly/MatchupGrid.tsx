"use client";

import PickCard from "./PickCard";

export default function MatchupGrid({
  games,
  teamsById,
  selected,
  onPick,
  isLocked,
}: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((g: any) => (
        <PickCard
          key={g.game_id}
          game={g}
          teamsById={teamsById}
          selected={selected}
          onPick={onPick}
          isLocked={isLocked}
        />
      ))}
    </div>
  );
}
