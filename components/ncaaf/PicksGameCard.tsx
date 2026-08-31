"use client";

export default function PicksGameCard({
  game,
  pickedTeamId,
  onPick,
  locked,
}) {
  const home = game.home_team;
  const away = game.away_team;

  const homeSelected = pickedTeamId === game.home_team_id;
  const awaySelected = pickedTeamId === game.away_team_id;

  return (
    <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4 shadow-md">
      <div className="text-xs text-slate-400 mb-2">
        {new Date(game.start_time).toLocaleString()}
      </div>

      <div className="space-y-3">
        <button
          disabled={locked}
          onClick={() => onPick(game.game_id, game.home_team_id)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition-all ${
            homeSelected
              ? "border-yellow-400 bg-yellow-500/20"
              : "border-white/10 bg-slate-800/40 hover:bg-slate-700/40"
          } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-3">
            <img
              src={home.logo_url}
              className="w-8 h-8 rounded shadow"
              alt={home.name}
            />
            <div>
              <div className="text-white font-semibold text-sm">
                {home.name}
              </div>
              <div className="text-slate-400 text-xs">
                {home.conference}
              </div>
            </div>
          </div>
          {homeSelected && (
            <span className="text-yellow-400 text-xs font-bold">
              PICKED
            </span>
          )}
        </button>

        <button
          disabled={locked}
          onClick={() => onPick(game.game_id, game.away_team_id)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition-all ${
            awaySelected
              ? "border-yellow-400 bg-yellow-500/20"
              : "border-white/10 bg-slate-800/40 hover:bg-slate-700/40"
          } ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-3">
            <img
              src={away.logo_url}
              className="w-8 h-8 rounded shadow"
              alt={away.name}
            />
            <div>
              <div className="text-white font-semibold text-sm">
                {away.name}
              </div>
              <div className="text-slate-400 text-xs">
                {away.conference}
              </div>
            </div>
          </div>
          {awaySelected && (
            <span className="text-yellow-400 text-xs font-bold">
              PICKED
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
