import { getTeamStrength } from '@/lib/bracket/getTeamStrength';
import type { Team } from '@/lib/bracket/types';

export default function TeamCard({ team }: { team: Team | null }) {
  if (!team) {
    return (
      <div className="team">
        <div>TBD</div>
        <div className="team-meta">—</div>
      </div>
    );
  }

  const strength = getTeamStrength(team.conference);

  return (
    <div className="team">
      <div>{team.seed}. {team.name}</div>
      <div className="team-meta">
        {team.record} &nbsp; {strength.emoji} {strength.label}
      </div>
    </div>
  );
}
