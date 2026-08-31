export default function GameCard({
  game,
  teamsById,
}: {
  game: any;
  teamsById: Record<string, any>;
}) {
  const home = teamsById[game.home_team_id];
  const away = teamsById[game.away_team_id];

  const completed = game.home_team_score !== null;

  return (
    <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={home.logo_url} className="w-10 h-10 rounded" />
          <span className="text-white font-semibold">{home.name}</span>
        </div>
        <span className="text-xl text-white">
          {completed ? game.home_team_score : "-"}
        </span>
      </div>

      <div className="text-center text-slate-400 my-2">vs</div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={away.logo_url} className="w-10 h-10 rounded" />
          <span className="text-white font-semibold">{away.name}</span>
        </div>
        <span className="text-xl text-white">
          {completed ? game.away_team_score : "-"}
        </span>
      </div>

      <div className="text-slate-400 text-sm mt-3">
        {new Date(game.start_time).toLocaleString()}
      </div>
    </div>
  );
}
