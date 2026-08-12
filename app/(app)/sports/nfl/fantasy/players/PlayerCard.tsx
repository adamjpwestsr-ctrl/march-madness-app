// app/(app)/sports/nfl/fantasy/players/PlayerCard.tsx
import Badge from "@/components/Badge"; // badge import

interface PlayerCardProps {
  player: {
    id: number;
    name: string;
    position?: string;
    team?: string;
    bye_week?: number;
    projected_points?: number;

    // merged badge fields
    badge_tier?: string;
    badge_role?: string;
    badge_archetype?: string;
  };
  onAdd: () => void;
}

export default function PlayerCard({ player, onAdd }: PlayerCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
      <div className="text-white font-semibold">{player.name}</div>

      <div className="text-slate-400 text-sm">
        {player.team} • {player.position}
      </div>

      {/* ⭐ Badge Row with Tooltips */}
      <div className="flex gap-2 mt-2 mb-2">
        <div title={`Tier: ${player.badge_tier || "N/A"}`}>
          <Badge type="tier" value={player.badge_tier ?? ""} />
        </div>

        <div title={`Role: ${player.badge_role || "N/A"}`}>
          <Badge type="role" value={player.badge_role ?? ""} />
        </div>

        <div title={`Archetype: ${player.badge_archetype || "N/A"}`}>
          <Badge type="archetype" value={player.badge_archetype ?? ""} />
        </div>
      </div>

      <div className="text-slate-300 text-sm mt-1">
        Bye Week: {player.bye_week ?? "-"} | Projected:{" "}
        {player.projected_points ?? "-"}
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
