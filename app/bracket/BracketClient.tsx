"use client";

import { useState, useEffect } from "react";

type Team = {
  team_id: string;
  name: string;
  seed: number | null;
};

type Game = {
  game_id: number;
  round: number;
  region: string;
  team1: Team | null;
  team2: Team | null;
  winner_team_id: string | null;
  source_game1: number | null;
  source_game2: number | null;
};

type Pick = {
  bracket_id: string;
  game_id: number;
  selected_team: string;
};

const CHAMPIONSHIP_GAME_ID = 63;

// ⭐ Bulldog SVG (inline)
const BulldogIcon = () => (
  <span className="ml-1 text-lg leading-none">🐶</span>
);

export default function BracketClient({
  bracket,
  games,
  picks,
  onPick,
  onReset,
}: {
  bracket: { bracket_id: string };
  games: Game[];
  picks: Pick[];
  onPick: (gameId: number, teamId: string) => void;
  onReset: () => void;
}) {
  const [localPicks, setLocalPicks] = useState(picks);
  const [tiebreaker, setTiebreaker] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Sync local picks when server refreshes
  useEffect(() => {
    setLocalPicks(picks);
  }, [picks]);

  const getSelectedTeamId = (game: Game): string | null => {
    const pick = localPicks.find((p) => p.game_id === game.game_id);
    return pick ? pick.selected_team : null;
  };

  // ⭐ Instant UI update wrapper
  const handlePick = (gameId: number, teamId: string) => {
    // Update local picks immediately
    setLocalPicks((prev) => {
      const filtered = prev.filter((p) => p.game_id !== gameId);
      return [...filtered, { bracket_id: bracket.bracket_id, game_id: gameId, selected_team: teamId }];
    });

    // Trigger backend
    onPick(gameId, teamId);
  };

  const renderTeamButton = (
    game: Game,
    team: Team | null,
    selectedTeamId: string | null
  ) => {
    if (!team) {
      return (
        <div className="text-xs text-slate-500 italic px-2 py-1 border border-dashed border-slate-700 rounded">
          TBD
        </div>
      );
    }

    const isSelected = selectedTeamId === team.team_id;

    // Determine underdog
    let isUnderdog = false;
    if (game.team1 && game.team2 && isSelected) {
      const opponent = team.team_id === game.team1.team_id ? game.team2 : game.team1;
      if (team.seed !== null && opponent?.seed !== null) {
        isUnderdog = team.seed > opponent.seed;
      }
    }

    return (
      <button
        type="button"
        form="__none__"
        onClick={() => handlePick(game.game_id, team.team_id)}
        className={`flex items-center justify-between px-2 py-1 rounded text-xs border transition
          ${
            isSelected
              ? "bg-emerald-600/80 border-emerald-400 text-white"
              : "bg-slate-900/60 border-slate-600 text-slate-100 hover:bg-slate-700/80"
          }`}
      >
        <span className="mr-2 text-slate-300 flex items-center">
          {team.seed !== null ? `${team.seed}. ` : ""}
          {team.name}
          {isUnderdog && <BulldogIcon />}
        </span>
      </button>
    );
  };

  const roundLabel = (round: number) => {
    switch (round) {
      case 1:
        return "Round of 64";
      case 2:
        return "Round of 32";
      case 3:
        return "Sweet 16";
      case 4:
        return "Elite 8";
      case 5:
        return "Final Four";
      case 6:
        return "Championship";
      default:
        return `Round ${round}`;
    }
  };

  const gamesByRegion: Record<string, Game[]> = {};
  games.forEach((g) => {
    if (!gamesByRegion[g.region]) gamesByRegion[g.region] = [];
    gamesByRegion[g.region].push(g);
  });

  const renderRegion = (region: string) => {
    const regionGames = (gamesByRegion[region] || []).slice().sort((a, b) => a.round - b.round);
    if (!regionGames.length) return null;

    const rounds = Array.from(new Set(regionGames.map((g) => g.round))).sort(
      (a, b) => a - b
    );

    return (
      <div className="flex gap-4">
        {rounds.map((round) => {
          const roundGames = regionGames.filter((g) => g.round === round);
          return (
            <div key={`${region}-round-${round}`} className="flex flex-col gap-2">
              <div className="text-xs font-semibold text-slate-400 mb-1">
                {roundLabel(round)}
              </div>
              {roundGames.map((game) => {
                const selectedTeamId = getSelectedTeamId(game);
                return (
                  <div
                    key={game.game_id}
                    className="flex flex-col gap-1 bg-slate-800/60 rounded-md p-2"
                  >
                    {renderTeamButton(game, game.team1, selectedTeamId)}
                    {renderTeamButton(game, game.team2, selectedTeamId)}

                    {/* ⭐ Tiebreaker UI under Championship */}
                    {game.game_id === CHAMPIONSHIP_GAME_ID && (
                      <div className="mt-2 flex flex-col gap-2">
                        <input
                          type="number"
                          placeholder="Championship total points tiebreaker"
                          value={tiebreaker}
                          onChange={(e) => setTiebreaker(e.target.value)}
                          className="px-2 py-1 text-xs bg-slate-900/60 border border-slate-600 rounded text-slate-200"
                        />

                        <button
                          disabled={submitting}
                          onClick={async () => {
                            setSubmitting(true);
                            const res = await fetch("/api/bracket/submit", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                bracketId: bracket.bracket_id,
                                tiebreaker: Number(tiebreaker),
                              }),
                            });
                            setSubmitting(false);
                            if (res.ok) alert("Bracket submitted!");
                            else alert("Submission failed");
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                        >
                          {submitting ? "Submitting..." : "Submit Bracket"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        form="__none__"
        onClick={onReset}
        className="self-start px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm"
      >
        Reset Bracket
      </button>

      <div className="flex gap-4 overflow-x-auto">
        <div className="flex flex-col gap-6 min-w-[480px]">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-200">East</h3>
            {renderRegion("East")}
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-200">South</h3>
            {renderRegion("South")}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-6 min-w-[320px]">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-200">Final Four</h3>
            {renderRegion("Final Four")}
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-200">Championship</h3>
            {renderRegion("Championship")}
          </div>
        </div>

        <div className="flex flex-col gap-6 min-w-[480px]">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-200">West</h3>
            {renderRegion("West")}
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-200">Midwest</h3>
            {renderRegion("Midwest")}
          </div>
        </div>
      </div>
    </div>
  );
}
