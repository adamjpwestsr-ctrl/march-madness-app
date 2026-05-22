"use client";

import { useState, useEffect } from "react";
import { saveRoundOf64Games, loadRoundOf64Games } from "./actions";

const REGIONS = ["East", "West", "South", "Midwest"] as const;

export default function RoundOf64Editor({
  allTeams,
}: {
  allTeams: string[];
}) {
  const [region, setRegion] = useState<"East" | "West" | "South" | "Midwest">(
    "East"
  );
  const [games, setGames] = useState(
    Array.from({ length: 8 }, () => ({ team1: "", team2: "" }))
  );

  const openingRoundOptions = Array.from({ length: 12 }, (_, i) => ({
    label: `Opening Round Game ${i + 1} Winner`,
    value: `OR-${i + 1}`,
  }));

  useEffect(() => {
    (async () => {
      const existing = await loadRoundOf64Games(region);
      if (existing.length > 0) {
        const mapped = existing.map((g: any) => ({
          team1: g.team1 || "",
          team2: g.team2 || "",
        }));
        setGames(mapped);
      }
    })();
  }, [region]);

  const updateGame = (i: number, field: "team1" | "team2", value: string) => {
    setGames((prev) => {
      const copy = [...prev];
      copy[i][field] = value;
      return copy;
    });
  };

  const handleSave = async () => {
    await saveRoundOf64Games(region, games);
    alert(`${region} saved!`);
  };

  return (
    <div style={{ padding: 20, background: "#1e293b", borderRadius: 10 }}>
      <h2 style={{ marginBottom: 10 }}>Round of 64 — {region}</h2>

      <select
        value={region}
        onChange={(e) => setRegion(e.target.value as any)}
        style={dropdownStyle}
      >
        {REGIONS.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>

      {games.map((g, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 12,
          }}
        >
          <select
            value={g.team1}
            onChange={(e) => updateGame(i, "team1", e.target.value)}
            style={dropdownStyle}
          >
            <option value="">Team 1</option>
            {allTeams.map((t) => (
              <option key={t}>{t}</option>
            ))}
            {openingRoundOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={g.team2}
            onChange={(e) => updateGame(i, "team2", e.target.value)}
            style={dropdownStyle}
          >
            <option value="">Team 2</option>
            {allTeams.map((t) => (
              <option key={t}>{t}</option>
            ))}
            {openingRoundOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button onClick={handleSave} style={saveButtonStyle}>
        Save Region
      </button>
    </div>
  );
}

const dropdownStyle = {
  padding: 10,
  borderRadius: 6,
  background: "#0f172a",
  color: "white",
  border: "1px solid #334155",
};

const saveButtonStyle = {
  padding: "10px 20px",
  background: "#3b82f6",
  borderRadius: 6,
  border: "none",
  color: "white",
  fontWeight: 600,
};
