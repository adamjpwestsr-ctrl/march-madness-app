
type Team = {
  last10?: string;
  team_name?: string;
  name?: string;
};

type MomentumIndicatorProps = {
  teamA: Team;
  teamB: Team;
};

type MomentumIconProps = {
  last10?: string;
  team?: string;
};

export default function MomentumIndicator({
  teamA,
  teamB,
}: MomentumIndicatorProps) {
  return (
    <div className="flex justify-between text-slate-300 text-sm">
      <MomentumIcon
        last10={teamA?.last10}
        team={teamA?.team_name || teamA?.name}
      />
      <MomentumIcon
        last10={teamB?.last10}
        team={teamB?.team_name || teamB?.name}
      />
    </div>
  );
}

function MomentumIcon({ last10, team }: MomentumIconProps) {
  const safeLast10 =
    typeof last10 === "string" && last10.includes("-")
      ? last10
      : "0-0";

  const [winsStr] = safeLast10.split("-");
  const wins = Number(winsStr) || 0;

  let icon = "→";
  let animation = "";

  if (wins >= 8) {
    icon = "🔥";
    animation = "animate-flame";
  } else if (wins >= 6) {
    icon = "↗";
    animation = "animate-arrow-up";
  } else if (wins <= 3) {
    icon = "↘";
    animation = "animate-arrow-down";
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xl ${animation}`}>{icon}</span>
      <span>{team || "TBD"}</span>
    </div>
  );
}
