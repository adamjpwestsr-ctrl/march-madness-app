"use client";

import { useState } from "react";

/**
 * Suggests a mapping based on true seed and geography.
 * This uses basic heuristics that can later be replaced with NCAA data logic.
 */
function suggestMapping(
  game: any,
  allTeams: any[],
  r64Games: any[]
) {
  const team1 = allTeams.find((t) => t.id === game.team1Id);
  const team2 = allTeams.find((t) => t.id === game.team2Id);

  const trueSeed = Math.min(team1?.true_seed ?? 76, team2?.true_seed ?? 76);

  // Suggest region based on geography or fallback
  const region = team1?.closest_region ?? "East";

  // Suggest seed based on true seed
  const seed = trueSeed <= 64 ? 12 : 16;

  // Suggest Round of 64 game based on seed
  const r64 = r64Games.find((g) => g.seed === seed);

  return {
    region,
    seed,
    r64GameId: r64?.id ?? "",
    slot: 1,
  };
}

/**
 * Opening Round Slot Editor — allows admin to assign region, seed, and Round of 64 slot.
 * Includes Auto‑Suggest button for NCAA‑style recommendations.
 */
export function OpeningRoundSlotEditor({
  game,
  r64Games,
  allTeams,
}: {
  game: any;
  r64Games: any[];
  allTeams: any[];
}) {
  const [region, setRegion] = useState("");
  const [seed, setSeed] = useState("");
  const [r64GameId, setR64GameId] = useState("");
  const [slot, setSlot] = useState(1);

  async function save(autoSuggested = false) {
    await fetch("/api/opening-round-slot", {
      method: "POST",
      body: JSON.stringify({
        opening_round_game_id: game.id,
        target_region: region,
        target_seed: Number(seed),
        round_of_64_game_id: r64GameId,
        slot_position: slot,
        auto_suggested: autoSuggested,
      }),
    });
  }

  return (
    <div className="p-4 border rounded-lg bg-slate-800/40">
      <h2 className="text-xl font-semibold mb-2">
        Map Opening Round Game {game.gameNumber}
      </h2>

      <select
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="block w-full mb-2 p-2 rounded bg-slate-700 text-white"
      >
        <option value="">Select Region</option>
        <option value="East">East</option>
        <option value="West">West</option>
        <option value="South">South</option>
        <option value="Midwest">Midwest</option>
      </select>

      <input
        type="number"
        placeholder="Seed"
        value={seed}
        onChange={(e) => setSeed(e.target.value)}
        className="block w-full mb-2 p-2 rounded bg-slate-700 text-white"
      />

      <select
        value={r64GameId}
        onChange={(e) => setR64GameId(e.target.value)}
        className="block w-full mb-2 p-2 rounded bg-slate-700 text-white"
      >
        <option value="">Select Round of 64 Game</option>
        {r64Games.map((g) => (
          <option key={g.id} value={g.id}>
            Game {g.gameNumber}
          </option>
        ))}
      </select>

      <select
        value={slot}
        onChange={(e) => setSlot(Number(e.target.value))}
        className="block w-full mb-4 p-2 rounded bg-slate-700 text-white"
      >
        <option value={1}>Team 1</option>
        <option value={2}>Team 2</option>
      </select>

      {/* Auto‑Suggest Button */}
      <button
        type="button"
        className="p-2 mb-2 bg-purple-600 rounded-lg w-full"
        onClick={() => {
const s = suggestMapping(game, allTeams, r64Games);
setRegion(s.region);
setSeed(String(s.seed)); // FIXED
setR64GameId(s.r64GameId);
setSlot(s.slot);
save(true);
        }}
      >
        Auto‑Suggest
      </button>

      {/* Save Button */}
      <button
        onClick={() => save(false)}
        className="p-2 bg-green-600 rounded-lg w-full"
      >
        Save Mapping
      </button>
    </div>
  );
}
