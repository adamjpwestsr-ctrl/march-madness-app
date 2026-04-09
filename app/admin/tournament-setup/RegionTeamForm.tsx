// app/admin/tournament-setup/RegionTeamForm.tsx
"use client";

import { useEffect, useState } from "react";
import { saveRegionTeams, clearRegion, loadRegionTeams } from "./actions";

const REGIONS = ["East", "West", "South", "Midwest"] as const;

type Region = (typeof REGIONS)[number];

type RegionTeam = {
  seed: number;
  team: string;
};

export default function RegionTeamForm() {
  const [region, setRegion] = useState<Region>("East");
  const [teams, setTeams] = useState<RegionTeam[]>(
    Array.from({ length: 16 }, (_, i) => ({
      seed: i + 1,
      team: "",
    }))
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const existing = await loadRegionTeams(region);

      if (existing.length > 0) {
        setTeams(existing.map((t: any) => ({ seed: t.seed, team: t.team })));
      } else {
        setTeams(
          Array.from({ length: 16 }, (_, i) => ({
            seed: i + 1,
            team: "",
          }))
        );
      }

      setLoading(false);
    })();
  }, [region]);

  const updateTeam = (index: number, value: string) => {
    const updated = [...teams];
    updated[index].team = value;
    setTeams(updated);
  };

  const handleSave = async () => {
    await saveRegionTeams(region, teams);
    alert(`Saved ${region} teams`);
  };

  const handleClear = async () => {
    if (!confirm(`Clear all teams for ${region}?`)) return;
    await clearRegion(region);
    setTeams(
      Array.from({ length: 16 }, (_, i) => ({
        seed: i + 1,
        team: "",
      }))
    );
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
        Enter Teams by Region
      </h3>

      <label style={{ fontSize: 14 }}>Region:</label>
      <select
        value={region}
        onChange={(e) => setRegion(e.target.value as Region)}
        style={{
          marginLeft: 10,
          padding: "6px 10px",
          borderRadius: 6,
          background: "#1e293b",
          color: "white",
        }}
      >
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <div style={{ marginTop: 20 }}>
        {loading && <div>Loading…</div>}

        {!loading &&
          teams.map((t, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 8,
                gap: 10,
              }}
            >
              <div style={{ width: 40, opacity: 0.8 }}>#{t.seed}</div>

              <input
                type="text"
                value={t.team}
                onChange={(e) => updateTeam(i, e.target.value)}
                placeholder={`Seed ${t.seed} team`}
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: "#0f172a",
                  border: "1px solid rgba(148,163,184,0.35)",
                  color: "white",
                }}
              />
            </div>
          ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button
          onClick={handleSave}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            background: "#16a34a",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Save Region
        </button>

        <button
          onClick={handleClear}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            background: "#dc2626",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Clear Region
        </button>
      </div>
    </div>
  );
}
