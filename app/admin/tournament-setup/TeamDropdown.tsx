"use client";

import React from "react";

type TeamOption = {
  id: number;
  name: string;
  logo: string | null;
  conference: string | null;
};

export default function TeamDropdown({
  value,
  onChange,
  options,
  placeholder = "Select a team",
}: {
  value: string;
  onChange: (v: string) => void;
  options: TeamOption[];
  placeholder?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
      >
        <option value="">{placeholder}</option>

        {/* Opening Round Winner Options */}
        {Array.from({ length: 12 }, (_, i) => (
          <option key={`OR-${i + 1}`} value={`OR-${i + 1}`}>
            Opening Round Game {i + 1} Winner
          </option>
        ))}

        {/* Team Options */}
        {options.map((t) => (
          <option key={t.id} value={t.name}>
            {t.name} ({t.conference})
          </option>
        ))}
      </select>

      {/* Custom rendering layer */}
      <div style={overlayStyle}>
        {value ? (
          <DropdownDisplay value={value} options={options} />
        ) : (
          <span style={{ opacity: 0.5 }}>{placeholder}</span>
        )}
      </div>
    </div>
  );
}

function DropdownDisplay({
  value,
  options,
}: {
  value: string;
  options: TeamOption[];
}) {
  // Opening Round Winner
  if (value.startsWith("OR-")) {
    const n = value.split("-")[1];
    return (
      <span style={displayTextStyle}>
        Opening Round Game {n} Winner
      </span>
    );
  }

  // Normal team
  const team = options.find((t) => t.name === value);
  if (!team) return <span style={displayTextStyle}>{value}</span>;

  return (
    <div style={displayContainerStyle}>
      {team.logo ? (
        <img
          src={team.logo}
          alt={team.name}
          style={logoStyle}
        />
      ) : (
        <div style={fallbackLogoStyle}>
          {team.name[0]}
        </div>
      )}

      <span style={displayTextStyle}>
        {team.name} ({team.conference})
      </span>
    </div>
  );
}

// ---------- Styles ----------

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: 6,
  background: "#0f172a",
  color: "transparent", // hide text behind overlay
  border: "1px solid #334155",
  appearance: "none",
  position: "relative",
  zIndex: 2,
};

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  height: "100%",
  width: "100%",
  padding: "10px",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "white",
  zIndex: 3,
};

const displayContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const displayTextStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#e5e7eb",
};

const logoStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  objectFit: "cover",
};

const fallbackLogoStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  borderRadius: "50%",
  background: "#1e293b",
  border: "1px solid #334155",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  color: "#e5e7eb",
};
