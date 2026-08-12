import Badge from "@/components/Badge";

import type { Player } from "./PlayersPageClient";

interface PlayerCardProps {
  player: Player;
  onAdd: () => void;
}

export default function PlayerCard({ player, onAdd }: PlayerCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
      <div className="text-white font-semibold flex items-center gap-3">
        {player.headshot_url && (
          <img
            src={player.headshot_url}
            alt={player.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        {player.name}
      </div>

      <div className="text-slate-400 text-sm">
        {player.team} • {player.position}
      </div>

      <div className="flex gap-2 mt-2 mb-2">
        <Badge type="tier" value={player.badge_tier ?? ""} />
        <Badge type="role" value={player.badge_role ?? ""} />
        <Badge type="archetype" value={player.badge_archetype ?? ""} />
      </div>

      <div className="text-slate-300 text-sm mt-1">
        Bye Week: {player.bye_week ?? "-"} | Projected: {player.projected_points ?? "-"}
      </div>

      <button
        className="mt-3 px-3 py-1 bg-blue-600 text-white rounded"
        onClick={onAdd}
      >
        Add to Queue
      </button>
    </div>
  );
}
