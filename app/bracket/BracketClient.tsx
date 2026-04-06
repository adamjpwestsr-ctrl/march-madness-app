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

// ⭐ Champion crown
const CrownIcon = () => (
  <span className="ml-1 text-base leading-none">👑</span>
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
  const [submittedBanner, setSubmittedBanner] = useState("");
  const [lockDate, setLockDate] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Sync local picks when server refreshes
  useEffect(() => {
    setLocalPicks(picks);
  }, [picks]);

  // Fetch lock date and compute locked state
  useEffect(() => {
    async function loadLockDate() {
      try {
        const res = await fetch("/api/settings/lock-date/get");
        const data = await res.json();
        if (data.lock_date) {
          setLockDate(data.lock_date);
          const lock = new Date(data.lock_date);
          const now = new Date();
          setIsLocked(now > lock);
        } else {
          setLockDate(null);
          setIsLocked(false);
        }
      } catch {
        // If lock date fails to load, default to unlocked
        setIsLocked(false);
      }
    }
    loadLockDate();
  }, []);

  const getSelectedTeamId = (game: Game): string | null => {
    const pick = localPicks.find((p) => p.game_id === game.game_id);
    return pick ? pick.selected_team : null;
  };

  // ⭐ Instant UI update wrapper (respects lock)
  const handlePick = (gameId: number, teamId: string) => {
    if (isLocked) return;

    setLocalPicks((prev) => {
      const filtered = prev.filter((p) => p.game_id !== gameId);
      return [
        ...filtered,
        { bracket_id: bracket.bracket_id, game_id: gameId, selected_team: teamId },
      ];
    });

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
      const opponent =
        team.team_id === game.team1.team_id ? game.team2 : game.team1;
      if (team.seed !== null && opponent?.seed !== null) {
        isUnderdog = team.seed > opponent.seed;
      }
    }

    // Champion highlight
    const isChampionshipGame = game.game_id === CHAMPIONSHIP_GAME_ID;
    const isChampion = isChampionshipGame && isSelected;

    return (
      <button
        type="button"
        form="__none__"
        onClick={() => handlePick(game.game_id, team.team_id)}
        disabled={isLocked}
        className={`flex items-center justify-between px-2 py-1 rounded text-xs border transition
          ${
            isSelected
              ? "bg-emerald-600/80 border-emerald-400 text-white"
              : "bg-slate-900/60 border-slate-600 text-slate-100 hover:bg-slate-700/80"
          }
          ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
          ${isChampion ? "ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)]" : ""}
        `}
      >
        <span className="mr-2 text-slate-300 flex items-center">
          {team.seed !== null ? `${team.seed}. ` : ""}
          {team.name}
          {isUnderdog && <BulldogIcon />}
          {isChampion && <CrownIcon />}
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
    const regionGames = (gamesByRegion[region] || [])
      .slice()
      .sort((a, b) => a.round - b.round);
    if (!regionGames.length) return null;

    const rounds = Array.from(new Set(regionGames.map((g) => g.round))).sort(
      (a, b) => a - b
    );

    return (
      <div className="flex gap-4">
        {rounds.map((round) => {
          const roundGames = regionGames.filter((g) => g.round === round);
          return (
            <div
              key={`${region}-round-${round}`}
              className="flex flex-col gap-2"
            >
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

                    {/* ⭐ Tiebreaker + Submit under Championship */}
                    {game.game_id === CHAMPIONSHIP_GAME_ID && (
                      <div className="mt-2 flex flex-col gap-2">
                        <input
                          type="number"
                          placeholder="Championship total points tiebreaker"
                          value={tiebreaker}
                          onChange={(e) => setTiebreaker(e.target.value)}
                          disabled={isLocked}
                          className={`px-2 py-1 text-xs bg-slate-900/60 border border-slate-600 rounded text-slate-200
                            ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
                          `}
                        />

                        <button
                          disabled={submitting || isLocked}
                          onClick={async () => {
                            if (!tiebreaker) {
                              alert("Please enter a tiebreaker score.");
                              return;
                            }

                            setSubmitting(true);
                            setSubmittedBanner("");
                            const res = await fetch("/api/bracket/submit", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                bracketId: bracket.bracket_id,
                                tiebreaker: Number(tiebreaker),
                                picks: localPicks,
                              }),
                            });
                            setSubmitting(false);

                            if (res.ok) {
                              setSubmittedBanner("Bracket submitted!");
                              setTimeout(() => setSubmittedBanner(""), 4000);
                            } else {
                              const data = await res.json().catch(() => null);
                              alert(
                                data?.error || "Submission failed. Please try again."
                              );
                            }
                          }}
                          className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs
                            ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
                          `}
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
    <div className="flex flex-col gap-4">
      {/* Top status bar */}
      <div className="flex flex-col gap-2">
        {isLocked ? (
          <div className="px-3 py-2 rounded-md bg-red-900/60 border border-red-500/60 text-xs text-red-100">
            Bracket Locked — submissions are closed.
          </div>
        ) : lockDate ? (
          <div className="px-3 py-2 rounded-md bg-emerald-900/40 border border-emerald-500/60 text-xs text-emerald-100">
            Bracket Open — changes allowed until lock date.
          </div>
        ) : (
          <div className="px-3 py-2 rounded-md bg-slate-800/60 border border-slate-600 text-xs text-slate-200">
            No lock date set — brackets are currently open.
          </div>
        )}

        {submittedBanner && (
          <div className="px-3 py-2 rounded-md bg-blue-900/60 border border-blue-500/60 text-xs text-blue-100">
            {submittedBanner}
          </div>
        )}
      </div>

      <button
        type="button"
        form="__none__"
        onClick={onReset}
        disabled={isLocked}
        className={`self-start px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm
          ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
        `}
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
            <h3 className="text-sm font-semibold mb-2 text-slate-200">
              Final Four
            </h3>
            {renderRegion("Final Four")}
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-200">
              Championship
            </h3>
            {renderRegion("Championship")}
          </div>
        </div>

        <div className="flex flex-col gap-6 min-w-[480px]">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-200">West</h3>
            {renderRegion("West")}
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-2 text-slate-200">
              Midwest
            </h3>
            {renderRegion("Midwest")}
          </div>
        </div>
      </div>
    </div>
  );
}
