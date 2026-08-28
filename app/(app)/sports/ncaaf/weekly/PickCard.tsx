"use client";

export default function PickCard({
  game,
  teamsById,
  selected,
  onPick,
  isLocked,
}: any) {
  const home = teamsById[game.home_team_id];
  const away = teamsById[game.away_team_id];

  const selectedTeam = selected[game.game_id];

  const renderTeam = (team: any, rank: number | null, side: "home" | "away") => {
    const isSelected = selectedTeam === team.id;

    return (
      <button
        disabled={isLocked}
        onClick={() => onPick(game.game_id, team.id)}
        className={[
          "flex flex-col items-center gap-2 p-4 rounded-xl border transition",
          isSelected
            ? "border-[var(--bb-green)] bg-[var(--bb-green)]/20"
            : "border-[var(--bb-green)] hover:bg-[var(--bb-green)]/10",
          isLocked ? "opacity-40 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {team.logo_url && (
          <img
            src={team.logo_url}
            alt={team.name}
            className="w-16 h-16 object-contain rounded-full"
          />
        )}

        <span className="font-semibold text-white text-center">
          {team.name}
        </span>

        {rank && (
          <span className="text-xs text-[var(--bb-gold)] font-bold">
            #{rank}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="rounded-xl bg-[var(--bb-slate-light)] p-4 border border-[var(--bb-green)] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        {renderTeam(home, game.home_rank, "home")}
        <span className="text-white font-bold">vs</span>
        {renderTeam(away, game.away_rank, "away")}
      </div>
    </div>
  );
}
