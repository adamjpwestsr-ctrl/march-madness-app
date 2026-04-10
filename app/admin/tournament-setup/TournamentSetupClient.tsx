//app/admin/tournament-setup/TournamentSetupClient.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  saveRegionTeams,
  clearRegion,
  loadRegionTeams,
  generateBracket,
  publishTournament,
  updateLockTime,
} from "./actions";

import { getTeamLogo } from "@/lib/getTeamLogo";

const REGIONS = ["East", "West", "South", "Midwest"] as const;

const PAIRS = [
  [1, 16],
  [2, 15],
  [3, 14],
  [4, 13],
  [5, 12],
  [6, 11],
  [7, 10],
  [8, 9],
];

export default function TournamentSetupClient() {
  const [region, setRegion] = useState<"East" | "West" | "South" | "Midwest">("East");
  const [teams, setTeams] = useState<{ [seed: number]: string }>({});
  const [lockTime, setLockTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refs for keyboard navigation
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    PAIRS.map(() => [null, null])
  );

  // Debounce timer
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load teams when region changes
  useEffect(() => {
    (async () => {
      const data = await loadRegionTeams(region);
      const map: any = {};
      data.forEach((t: any) => (map[t.seed] = t.team));
      setTeams(map);
    })();
  }, [region]);

  // Auto-save function
  const autoSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);

    const rows = Object.entries(teams).map(([seed, team]) => ({
      seed: Number(seed),
      team,
    }));

    await saveRegionTeams(region, rows);

    setSaving(false);
    setSaved(true);

    setTimeout(() => setSaved(false), 1500);
  }, [teams, region]);

  // Debounced auto-save
  const triggerDebounceSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(autoSave, 500);
  };

  const updateTeam = (seed: number, value: string) => {
    setTeams((prev) => ({ ...prev, [seed]: value }));
    triggerDebounceSave();
  };

  const handleBlurSave = () => {
    autoSave();
  };

  const handleRegionChange = async (newRegion: any) => {
    await autoSave();
    setRegion(newRegion);
  };

  const handleClear = async () => {
    await clearRegion(region);
    setTeams({});
    autoSave();
  };

  const handleGenerate = async () => {
    setLoading(true);
    const res = await generateBracket();
    setLoading(false);
    alert(res.message);
  };

  const handlePublish = async () => {
    const res = await publishTournament();
    alert(res.message);
  };

  const handleLockSave = async () => {
    await updateLockTime(lockTime);
    alert("Lock time updated!");
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    const maxRow = PAIRS.length - 1;

    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        // Previous input
        if (col === 1) inputRefs.current[row][0]?.focus();
        else if (row > 0) inputRefs.current[row - 1][1]?.focus();
      } else {
        // Next input
        if (col === 0) inputRefs.current[row][1]?.focus();
        else if (row < maxRow) inputRefs.current[row + 1][0]?.focus();
      }
    }

    if (e.key === "ArrowDown" && row < maxRow) {
      e.preventDefault();
      inputRefs.current[row + 1][col]?.focus();
    }

    if (e.key === "ArrowUp" && row > 0) {
      e.preventDefault();
      inputRefs.current[row - 1][col]?.focus();
    }

    if (e.key === "ArrowRight" && col === 0) {
      e.preventDefault();
      inputRefs.current[row][1]?.focus();
    }

    if (e.key === "ArrowLeft" && col === 1) {
      e.preventDefault();
      inputRefs.current[row][0]?.focus();
    }
  };

  return (
    <div
      style={{
        padding: 30,
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: "#0f172a",
        minHeight: "100vh",
        color: "#e5e7eb",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>
        Tournament Builder
      </h1>

      <p style={{ textAlign: "center", marginBottom: 20, opacity: 0.8 }}>
        Enter teams by region, generate the full tournament bracket, set the lock time, and publish the tournament.
      </p>

      {/* Auto-save indicator */}
      <div style={{ textAlign: "center", height: 20, marginBottom: 10 }}>
        {saving && <span style={{ color: "#38bdf8" }}>Saving…</span>}
        {saved && <span style={{ color: "#4ade80" }}>Saved ✓</span>}
      </div>

      {/* REGION SELECT */}
      <div style={{ marginBottom: 20, textAlign: "center" }}>
        <label style={{ marginRight: 10 }}>Region:</label>
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 6,
            background: "#1e293b",
            color: "#e5e7eb",
            border: "1px solid #334155",
          }}
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* MATCHUP GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 20,
          maxWidth: 700,
          margin: "0 auto 30px auto",
        }}
      >
        {PAIRS.map(([s1, s2], row) => (
          <div
            key={s1}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 40px 1fr",
              alignItems: "center",
              gap: 10,
              padding: 15,
              background: "rgba(30,41,59,0.6)",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.25)",
              position: "relative",
            }}
          >
            {/* LEFT INPUT */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Logo */}
              <LogoCircle team={teams[s1]} />

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 14, opacity: 0.8 }}>#{s1}</label>
                <input
                  ref={(el) => (inputRefs.current[row][0] = el)}
                  type="text"
                  value={teams[s1] || ""}
                  onChange={(e) => updateTeam(s1, e.target.value)}
                  onBlur={handleBlurSave}
                  onKeyDown={(e) => handleKeyDown(e, row, 0)}
                  placeholder={`Seed ${s1} team`}
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 5,
                    borderRadius: 6,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#e5e7eb",
                  }}
                />
              </div>
            </div>

            {/* BRACKET LINE */}
            <div
              style={{
                width: "100%",
                height: 2,
                background: "#ffffff33",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -20,
                  top: "50%",
                  width: 20,
                  height: 2,
                  background: "#ffffff33",
                }}
              />
            </div>

            {/* RIGHT INPUT */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LogoCircle team={teams[s2]} />

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 14, opacity: 0.8 }}>#{s2}</label>
                <input
                  ref={(el) => (inputRefs.current[row][1] = el)}
                  type="text"
                  value={teams[s2] || ""}
                  onChange={(e) => updateTeam(s2, e.target.value)}
                  onBlur={handleBlurSave}
                  onKeyDown={(e) => handleKeyDown(e, row, 1)}
                  placeholder={`Seed ${s2} team`}
                  style={{
                    width: "100%",
                    padding: 10,
                    marginTop: 5,
                    borderRadius: 6,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#e5e7eb",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CLEAR BUTTON */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <button
          onClick={handleClear}
          style={{
            padding: "10px 20px",
            background: "#dc2626",
            borderRadius: 6,
            border: "none",
            color: "white",
            fontWeight: 600,
          }}
        >
          Clear Region
        </button>
      </div>

      {/* LOCK TIME */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h3 style={{ marginBottom: 10 }}>Tournament Lock Time</h3>
        <input
          type="datetime-local"
          value={lockTime}
          onChange={(e) => setLockTime(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 6,
            background: "#1e293b",
            border: "1px solid #334155",
            color: "#e5e7eb",
            marginRight: 10,
          }}
        />
        <button
          onClick={handleLockSave}
          style={{
            padding: "10px 20px",
            background: "#16a34a",
            borderRadius: 6,
            border: "none",
            color: "white",
            fontWeight: 600,
          }}
        >
          Save Lock Time
        </button>
      </div>

      {/* GENERATE + PUBLISH */}
      <div style={{ textAlign: "center" }}>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: "#3b82f6",
            borderRadius: 6,
            border: "none",
            color: "white",
            fontWeight: 600,
            marginRight: 10,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Generating..." : "Generate Bracket"}
        </button>

        <button
          onClick={handlePublish}
          style={{
            padding: "12px 24px",
            background: "#9333ea",
            borderRadius: 6,
            border: "none",
            color: "white",
            fontWeight: 600,
          }}
        >
          Publish Tournament
        </button>
      </div>
    </div>
  );
}

/* LOGO CIRCLE COMPONENT */
function LogoCircle({ team }: { team: string | undefined }) {
  const logo = team ? getTeamLogo(team) : null;

  if (logo) {
    return (
      <img
        src={logo}
        alt={team || ""}
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          objectFit: "cover",
          background: "#0f172a",
        }}
      />
    );
  }

  // Fallback initials
  const initials =
    team
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "?";

  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: "50%",
        background: "#1e293b",
        border: "1px solid #334155",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        color: "#e5e7eb",
      }}
    >
      {initials}
    </div>
  );
}
