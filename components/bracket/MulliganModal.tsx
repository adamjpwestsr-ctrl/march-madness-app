"use client";

import React from "react";

type MulliganModalProps = {
  isOpen: boolean;
  onClose: () => void;
  game: {
    original_team: string;
    [key: string]: any;
  } | null;
  aliveTeams: string[];
  onSubmit: (team: string) => void | Promise<void>;
};

export default function MulliganModal({
  isOpen,
  onClose,
  game,
  aliveTeams,
  onSubmit
}: MulliganModalProps) {
  const [selectedTeam, setSelectedTeam] = React.useState("");

  if (!isOpen || !game) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999
      }}
    >
      <div
        style={{
          background: "#0f172a",
          padding: 24,
          borderRadius: 12,
          width: 360,
          color: "white",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
        }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>
          Request Mulligan
        </h2>

        <p style={{ marginBottom: 16, fontSize: 14, lineHeight: 1.4 }}>
          Replace <strong>{game.original_team}</strong> with a team still alive
          in the tournament.
        </p>

        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            background: "#1e293b",
            color: "white",
            marginBottom: 16
          }}
        >
          <option value="">Select replacement team</option>
          {aliveTeams.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            if (!selectedTeam) return;
            onSubmit(selectedTeam);
          }}
          style={{
            width: "100%",
            padding: 12,
            background: "#1d4ed8",
            border: "none",
            borderRadius: 6,
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 12
          }}
        >
          Submit Mulligan Request
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: 10,
            background: "#334155",
            border: "none",
            borderRadius: 6,
            color: "white",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
