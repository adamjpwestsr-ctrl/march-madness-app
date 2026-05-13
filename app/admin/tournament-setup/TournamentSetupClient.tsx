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

type Region = (typeof REGIONS)[number];

type RegionTeamState = {
  team: string;
  record?: string;
  conference?: string;
  bid_type?: "AQ" | "AT_LARGE" | "";
  opening_round?: boolean;
  advances_to_game?: number | null;
};

export default function TournamentSetupClient() {
  const [region, setRegion] = useState<Region>("East");

  const [teams, setTeams] = useState<{
    [seed: number]: RegionTeamState;
  }>({});

  const [lockTime, setLockTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    PAIRS.map(() => [null, null])
  );

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load teams when region changes
  useEffect(() => {
    (async () => {
      const data = await loadRegionTeams(region);
      const map: { [seed: number]: RegionTeamState } = {};

      data.forEach((t: any) => {
        map[t.seed] = {
          team: t.team || "",
          record: t.record || "",
          conference: t.conference || "",
          bid_type: (t.bid_type as "AQ" | "AT_LARGE") || "",
          opening_round: t.opening_round ?? false,
          advances_to_game: t.advances_to_game ?? null,
        };
      });

      setTeams(map);
    })();
  }, [region]);

  const autoSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);

    const rows = Object.entries(teams).map(([seed, data]) => ({
      seed: Number(seed),
      team: data.team,
      record: data.record,
      conference: data.conference,
      bid_type: data.bid_type || null,
      opening_round: data.opening_round ?? false,
      advances_to_game: data.advances_to_game ?? null,
    }));

    await saveRegionTeams(region, rows as any);

    setSaving(false);
    setSaved(true);

    setTimeout(() => setSaved(false), 1500);
  }, [teams, region]);

  const triggerDebounceSave = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(autoSave, 500);
  };

  const updateTeam = (seed: number, field: keyof RegionTeamState, value: any) => {
    setTeams((prev) => ({
      ...prev,
      [seed]: {
        ...prev[seed],
        [field]: value,
      },
    }));
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

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    const maxRow = PAIRS.length - 1;

    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        if (col === 1) inputRefs.current[row][0]?.focus();
        else if (row > 0) inputRefs.current[row - 1][1]?.focus();
      } else {
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

      <div style={{ textAlign: "center", height: 20, marginBottom: 10 }}>
        {saving && <span style={{ color: "#38bdf8" }}>Saving…</span>}
        {saved && <span style={{ color: "#4ade80" }}>Saved ✓</span>}
      </div>

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
              <LogoCircle team={teams[s1]?.team} />

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 14, opacity: 0.8 }}>#{s1}</label>

                {/* TEAM NAME */}
                <input
                  ref={(el) => {
                    inputRefs.current[row][0] = el;
                  }}
                  type="text"
                  value={teams[s1]?.team || ""}
                  onChange={(e) => updateTeam(s1, "team", e.target.value)}
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
                {/* RECORD */}
                <input
                  type="text"
                  value={teams[s1]?.record || ""}
                  onChange={(e) => updateTeam(s1, "record", e.target.value)}
                  placeholder="Record (e.g. 28-4)"
                  style={{
                    width: "100%",
                    padding: 8,
                    marginTop: 6,
                    borderRadius: 6,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#e5e7eb",
                    fontSize: 13,
                  }}
                />

                {/* CONFERENCE */}
                <select
                  value={teams[s1]?.conference || ""}
                  onChange={(e) => updateTeam(s1, "conference", e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    marginTop: 6,
                    borderRadius: 6,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#e5e7eb",
                    fontSize: 13,
                  }}
                >
                  <option value="">Conference</option>
                  <option value="ACC">ACC</option>
                  <option value="SEC">SEC</option>
                  <option value="Big Ten">Big Ten</option>
                  <option value="Big 12">Big 12</option>
                  <option value="Pac-12">Pac-12</option>
                  <option value="Big East">Big East</option>
                  <option value="AAC">AAC</option>
                  <option value="Mountain West">Mountain West</option>
                  <option value="A-10">A-10</option>
                  <option value="WCC">WCC</option>
                  <option value="MVC">MVC</option>
                  <option value="Ivy League">Ivy League</option>
                  <option value="Other">Other</option>
                </select>

                {/* BID TYPE */}
                <select
                  value={teams[s1]?.bid_type || ""}
                  onChange={(e) =>
                    updateTeam(
                      s1,
                      "bid_type",
                      e.target.value as "AQ" | "AT_LARGE" | ""
                    )
                  }
                  style={{
                    width: "100%",
                    padding: 8,
                    marginTop: 6,
                    borderRadius: 6,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#e5e7eb",
                    fontSize: 13,
                  }}
                >
                  <option value="">Bid Type</option>
                  <option value="AQ">Automatic Qualifier</option>
                  <option value="AT_LARGE">At-Large</option>
                </select>

                {/* OPENING ROUND FLAG */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 6,
                    fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={teams[s1]?.opening_round ?? false}
                    onChange={(e) =>
                      updateTeam(s1, "opening_round", e.target.checked)
                    }
                  />
                  Opening Round
                </label>

                {/* ADVANCES TO GAME (ROUND OF 64 GAME ID) */}
                <input
                  type="number"
                  value={teams[s1]?.advances_to_game ?? ""}
                  onChange={(e) =>
                    updateTeam(
                      s1,
                      "advances_to_game",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  placeholder="Advances to Game ID (Round of 64)"
                  style={{
                    width: "100%",
                    padding: 8,
                    marginTop: 6,
                    borderRadius: 6,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#e5e7eb",
                    fontSize: 13,
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
              <LogoCircle team={teams[s2]?.team} />

              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 14, opacity: 0.8 }}>#{s2}</label>

                {/* TEAM NAME */}
                <input
                  ref={(el) => {
                    inputRefs.current[row][1] = el;
                  }}
                  type="text"
                  value={teams[s2]?.team || ""}
                  onChange={(e) => updateTeam(s2, "team", e.target.value)}
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

                {/* RECORD */}
                <input
                  type="text"
                  value={teams[s2]?.record || ""}
                  onChange={(e) => updateTeam(s2, "record", e.target.value)}
                  placeholder="Record (e.g. 28-4)"
                  style={{
                    width: "100%",
                    padding: 8,
                    marginTop: 6,
                    borderRadius: 6,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#e5e7eb",
                    fontSize: 13,
                  }}
                />

                {/* CONFERENCE */}
                <select
                  value={teams[s2]?.conference || ""}
                  onChange={(e) => updateTeam(s2, "conference", e.target.value)}
                  style={{
                    width: "100%",
                    padding: 8,
                    marginTop: 6,
                    borderRadius: 6,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#e5e7eb",
                    fontSize: 13,
                  }}
                >
                  <option value="">Conference</option>
                  <option value="ACC">ACC</option>
                  <option value="SEC">SEC</option>
                  <option value="Big Ten">Big Ten</option>
                  <option value="Big 12">Big 12</option>
                  <option value="Pac-12">Pac-12</option>
                  <option value="Big East">Big East</option>
                  <option value="AAC">AAC</option>
                  <option value="Mountain West">Mountain West</option>
                  <option value="A-10">A-10</option>
                  <option value="WCC">WCC</option>
                  <option value="MVC">MVC</option>
                  <option value="Ivy League">Ivy League</option>
                  <option value="Other">Other</option>
                </select>

                {/* BID TYPE */}
                <select
                  value={teams[s2]?.bid_type || ""}
                  onChange={(e) =>
                    updateTeam(
                      s2,
                      "bid_type",
                      e.target.value as "AQ" | "AT_LARGE" | ""
                    )
                  }
                  style={{
                    width: "100%",
                    padding: 8,
                    marginTop: 6,
                    borderRadius: 6,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#e5e7eb",
                    fontSize: 13,
                  }}
                >
                  <option value="">Bid Type</option>
                  <option value="AQ">Automatic Qualifier</option>
                  <option value="AT_LARGE">At-Large</option>
                </select>

                {/* OPENING ROUND FLAG */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 6,
                    fontSize: 13,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={teams[s2]?.opening_round ?? false}
                    onChange={(e) =>
                      updateTeam(s2, "opening_round", e.target.checked)
                    }
                  />
                  Opening Round
                </label>

                {/* ADVANCES TO GAME (ROUND OF 64 GAME ID) */}
                <input
                  type="number"
                  value={teams[s2]?.advances_to_game ?? ""}
                  onChange={(e) =>
                    updateTeam(
                      s2,
                      "advances_to_game",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  placeholder="Advances to Game ID (Round of 64)"
                  style={{
                    width: "100%",
                    padding: 8,
                    marginTop: 6,
                    borderRadius: 6,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    color: "#e5e7eb",
                    fontSize: 13,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

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
