export default function PlayerCard({ player, onAdd }) {
  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
      <div className="text-white font-semibold">{player.name}</div>
      <div className="text-slate-400 text-sm">
        {player.team} • {player.position}
      </div>
      <div className="text-slate-300 text-sm mt-1">
        Bye Week: {player.bye_week} | Projected: {player.projected_points}
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
