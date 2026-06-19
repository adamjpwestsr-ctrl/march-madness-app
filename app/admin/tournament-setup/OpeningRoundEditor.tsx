"use client";

import { useState, useEffect } from "react";
import { saveOpeningRoundGames, loadOpeningRoundGames } from "./actions";

type Team = {
  id: number;
  name: string;
  logo: string;
  conference: string;
};

export default function OpeningRoundEditor({ allTeams }: { allTeams: Team[] }) {
  const [games, setGames] = useState(
    Array.from({ length: 12 }, () => ({ team1_id: null as number | null, team2_id: null as number | null }))
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const existing = await loadOpeningRoundGames();
      if (existing.length > 0) {
        const mapped = existing.map((g: any) => ({
          team1_id: g.team1_id || null,
          team2_id: g.team2_id || null,
        }));
        setGames(mapped);
      }
    })();
  }, []);

  const updateGame = (i: number, field: "team1_id" | "team2_id", value: string) => {
    setGames((prev) => {
      const copy = [...prev];
      copy[i][field] = value ? Number(value) : null;
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await saveOpeningRoundGames(games);
    setSaving(false);
    alert("Opening Round saved!");
  };

  return (
    <div style={{ padding: 20, background: "#1e293b", borderRadius: 10 }}>
      <h2 style={{ marginBottom: 10 }}>Opening Round (12 Games)</h2>

      {games.map((g, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <select
            value={g.team1_id ?? ""}
            onChange={(e) => updateGame(i, "team1_id", e.target.value)}
            style={dropdownStyle}
          >
            <option value="">Select Team 1</option>
            {allTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={g.team2_id ?? ""}
            onChange={(e) => updateGame(i, "team2_id", e.target.value)}
            style={dropdownStyle}
          >
            <option value="">Select Team 2</option>
            {allTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button onClick={handleSave} style={saveButtonStyle}>
        {saving ? "Saving..." : "Save Opening Round"}
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
  background: "#16a34a",
  borderRadius: 6,
  border: "none",
  color: "white",
  fontWeight: 600,
};

