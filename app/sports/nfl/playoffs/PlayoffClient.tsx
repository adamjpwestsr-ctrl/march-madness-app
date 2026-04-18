"use client";

import { useState } from "react";
import Image from "next/image";

/* ---------------- TYPES ---------------- */

interface Team {
  id: number;
  name: string;
  logo: string;
  [key: string]: any;
}

interface PlayoffBracket {
  [key: string]: number | null;
}

interface PlayoffClientProps {
  teams: Team[];
  initialBracket: PlayoffBracket;
  onSave: (bracket: PlayoffBracket) => void;
}

/* ---------------- MAIN COMPONENT ---------------- */

export default function PlayoffClient({
  teams,
  initialBracket,
  onSave,
}: PlayoffClientProps) {
  const [bracket, setBracket] = useState<PlayoffBracket>(initialBracket);

  const handleSelect = (slot: string, teamId: number) => {
    setBracket((prev) => ({
      ...prev,
      [slot]: teamId,
    }));
  };

  const getTeam = (id: number | null) =>
    teams.find((t) => t.id === id) || null;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-6 flex flex-col gap-10">
      <h1 className="text-3xl font-bold text-center mb-4">
        NFL Playoff Bracket
      </h1>

      {/* DESKTOP BRACKET */}
      <div className="hidden lg:grid grid-cols-5 gap-6 items-center">
        {/* AFC SIDE */}
        <RoundColumn
          title="AFC Wild Card"
          matchups={[
            ["wc_afc_1", "wc_afc_2"],
            ["wc_afc_3", null],
          ]}
          bracket={bracket}
          getTeam={getTeam}
          onSelect={handleSelect}
          color="emerald"
        />

        <RoundColumn
          title="AFC Divisional"
          matchups={[["div_afc_1", "div_afc_2"]]}
          bracket={bracket}
          getTeam={getTeam}
          onSelect={handleSelect}
          color="emerald"
        />

        {/* SUPER BOWL */}
        <div className="flex flex-col items-center gap-4">
          <div className="text-xl font-bold text-yellow-400">Super Bowl</div>
          <Matchup
            slot="super_bowl"
            teamA={getTeam(bracket.conf_afc)}
            teamB={getTeam(bracket.conf_nfc)}
            onSelect={handleSelect}
            color="yellow"
          />
        </div>

        {/* NFC SIDE */}
        <RoundColumn
          title="NFC Divisional"
          matchups={[["div_nfc_1", "div_nfc_2"]]}
          bracket={bracket}
          getTeam={getTeam}
          onSelect={handleSelect}
          color="blue"
        />

        <RoundColumn
          title="NFC Wild Card"
          matchups={[
            ["wc_nfc_1", "wc_nfc_2"],
            ["wc_nfc_3", null],
          ]}
          bracket={bracket}
          getTeam={getTeam}
          onSelect={handleSelect}
          color="blue"
        />
      </div>

      {/* MOBILE BRACKET */}
      <div className="lg:hidden flex flex-col gap-10">
        <MobileRound
          title="AFC Wild Card"
          slots={["wc_afc_1", "wc_afc_2", "wc_afc_3"]}
          bracket={bracket}
          getTeam={getTeam}
          onSelect={handleSelect}
          color="emerald"
        />

        <MobileRound
          title="AFC Divisional"
          slots={["div_afc_1", "div_afc_2"]}
          bracket={bracket}
          getTeam={getTeam}
          onSelect={handleSelect}
          color="emerald"
        />

        <MobileRound
          title="NFC Wild Card"
          slots={["wc_nfc_1", "wc_nfc_2", "wc_nfc_3"]}
          bracket={bracket}
          getTeam={getTeam}
          onSelect={handleSelect}
          color="blue"
        />

        <MobileRound
          title="NFC Divisional"
          slots={["div_nfc_1", "div_nfc_2"]}
          bracket={bracket}
          getTeam={getTeam}
          onSelect={handleSelect}
          color="blue"
        />

        <MobileRound
          title="Super Bowl"
          slots={["super_bowl"]}
          bracket={bracket}
          getTeam={getTeam}
          onSelect={handleSelect}
          color="yellow"
        />
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-center">
        <button
          onClick={() => onSave(bracket)}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 transition font-semibold rounded-sm"
        >
          Save Bracket
        </button>
      </div>
    </div>
  );
}

/* ---------------- MATCHUP COMPONENT ---------------- */

interface MatchupProps {
  slot: string;
  teamA: Team | null;
  teamB: Team | null;
  onSelect: (slot: string, teamId: number) => void;
  color: string;
}

function Matchup({ slot, teamA, teamB, onSelect, color }: MatchupProps) {
  const glow =
    color === "emerald"
      ? "shadow-[0_0_12px_rgba(16,185,129,0.5)]"
      : color === "blue"
      ? "shadow-[0_0_12px_rgba(59,130,246,0.5)]"
      : "shadow-[0_0_12px_rgba(234,179,8,0.5)]";

  return (
    <div className="flex flex-col gap-2">
      {[teamA, teamB].map((team, idx) => (
        <button
          key={idx}
          onClick={() => team && onSelect(slot, team.id)}
          className={`
            w-48 h-16 px-3 flex items-center gap-3
            bg-white/5 backdrop-blur-md border border-slate-700/60
            hover:${glow} hover:border-${color}-400
            transition rounded-sm
          `}
        >
          {team ? (
            <>
              <Image
                src={team.logo}
                alt={team.name}
                width={32}
                height={32}
                className="rounded-sm"
              />
              <span className="text-sm">{team.name}</span>
            </>
          ) : (
            <span className="text-slate-500 text-sm">TBD</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------------- ROUND COLUMN (DESKTOP) ---------------- */

interface RoundColumnProps {
  title: string;
  matchups: (string | null)[][];
  bracket: PlayoffBracket;
  getTeam: (id: number | null) => Team | null;
  onSelect: (slot: string, teamId: number) => void;
  color: string;
}

function RoundColumn({
  title,
  matchups,
  bracket,
  getTeam,
  onSelect,
  color,
}: RoundColumnProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className={`text-lg font-semibold text-${color}-400`}>{title}</div>

      {matchups.map(([slotA, slotB], idx) => (
        <Matchup
          key={idx}
          slot={slotA as string}
          teamA={getTeam(bracket[slotA as string])}
          teamB={slotB ? getTeam(bracket[slotB]) : null}
          onSelect={onSelect}
          color={color}
        />
      ))}
    </div>
  );
}

/* ---------------- MOBILE ROUND ---------------- */

interface MobileRoundProps {
  title: string;
  slots: string[];
  bracket: PlayoffBracket;
  getTeam: (id: number | null) => Team | null;
  onSelect: (slot: string, teamId: number) => void;
  color: string;
}

function MobileRound({
  title,
  slots,
  bracket,
  getTeam,
  onSelect,
  color,
}: MobileRoundProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className={`text-xl font-semibold text-${color}-400`}>{title}</div>

      {slots.map((slot) => (
        <Matchup
          key={slot}
          slot={slot}
          teamA={getTeam(bracket[slot])}
          teamB={null}
          onSelect={onSelect}
          color={color}
        />
      ))}
    </div>
  );
}
