"use client";

import { Team } from "@/lib/bracketTypes";
import { getTeamStrength } from "@/lib/bracketTypes";

type Props = {
  team: Team | null;
  selected?: boolean;
  onSelect?: () => void;
};

export default function TeamCard({ team, selected, onSelect }: Props) {
  if (!team) {
    return (
      <div className="team-card empty">
        <span className="team-name">TBD</span>
      </div>
    );
  }

  const strength = getTeamStrength(team.conference);

  return (
    <button
      type="button"
      className={`team-card ${selected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="team-header">
        <span className="team-seed">{team.seed}</span>
        <span className="team-name">{team.name}</span>
      </div>

      <div className="team-meta">
        <span className="team-record">{team.record}</span>
        <span className="team-strength">
          {strength.emoji} {strength.label}
        </span>
      </div>
    </button>
  );
}
