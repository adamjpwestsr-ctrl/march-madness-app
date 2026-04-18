"use client";

import { useState } from "react";

export default function PlayoffClient({ teams }) {
  // Bracket structure
  const [bracket, setBracket] = useState({
    wc_afc_1: null,
    wc_afc_2: null,
    wc_afc_3: null,
    wc_nfc_1: null,
    wc_nfc_2: null,
    wc_nfc_3: null,

    div_afc_1: null,
    div_afc_2: null,
    div_nfc_1: null,
    div_nfc_2: null,

    conf_afc: null,
    conf_nfc: null,

    super_bowl: null,
  });

  const handlePick = (slot, teamId) => {
    setBracket({ ...bracket, [slot]: teamId });
  };

  const renderTeamButton = (slot, team) => {
    const selected = bracket[slot] === team.id;

    return (
      <button
        key={team.id}
        onClick={() => handlePick(slot, team.id)}
        className={`
          flex items-center gap-3 w-full p-3 rounded-lg border transition
          ${
            selected
              ? "border-emerald-400 bg-emerald-500/20"
              : "border-slate-700 bg-slate-800 hover:border-emerald-400"
          }
        `}
      >
        {team.logo_url ? (
          <img
            src={team.logo_url}
            alt={team.name}
            className="h-8 w-8 object-contain"
          />
        ) : (
          <div className="text-2xl">{team.emoji}</div>
        )}
        <span className="font-semibold">{team.name}</span>
      </button>
    );
  };

  const afcTeams = teams.filter((t) => t.conference === "AFC");
  const nfcTeams = teams.filter((t) => t.conference === "NFC");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-10 text-center">
          NFL Playoff Bracket
        </h1>

        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* LEFT COLUMN — AFC */}
          <div className="space-y-10">

            {/* Wild Card */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-emerald-400">
                AFC Wild Card
              </h2>
              <div className="space-y-3">
                {afcTeams.map((team) =>
                  renderTeamButton("wc_afc_1", team)
                )}
              </div>
            </div>

            {/* Divisional */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-emerald-400">
                AFC Divisional
              </h2>
              <div className="space-y-3">
                {afcTeams.map((team) =>
                  renderTeamButton("div_afc_1", team)
                )}
              </div>
            </div>

            {/* Conference Championship */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-emerald-400">
                AFC Championship
              </h2>
              <div className="space-y-3">
                {afcTeams.map((team) =>
                  renderTeamButton("conf_afc", team)
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN — SUPER BOWL */}
          <div className="space-y-10">
            <div>
              <h2 className="text-xl font-bold mb-4 text-yellow-400 text-center">
                Super Bowl
              </h2>
              <div className="space-y-3">
                {teams.map((team) =>
                  renderTeamButton("super_bowl", team)
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — NFC */}
          <div className="space-y-10">

            {/* Wild Card */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-blue-400">
                NFC Wild Card
              </h2>
              <div className="space-y-3">
                {nfcTeams.map((team) =>
                  renderTeamButton("wc_nfc_1", team)
                )}
              </div>
            </div>

            {/* Divisional */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-blue-400">
                NFC Divisional
              </h2>
              <div className="space-y-3">
                {nfcTeams.map((team) =>
                  renderTeamButton("div_nfc_1", team)
                )}
              </div>
            </div>

            {/* Conference Championship */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-blue-400">
                NFC Championship
              </h2>
              <div className="space-y-3">
                {nfcTeams.map((team) =>
                  renderTeamButton("conf_nfc", team)
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
