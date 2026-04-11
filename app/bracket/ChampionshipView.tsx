"use client";

import { getTeamLogo } from "../../lib/getTeamLogo";

// -----------------------------
// INLINE TYPES
// -----------------------------
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
  winner: string | null;
  source_game1: number | null;
  source_game2: number | null;
};

type Pick = {
  bracket_id: string;
  game_id: number;
  selected_team: string;
};

// -----------------------------
// PROPS
// -----------------------------
type ChampionshipViewProps = {
  bracket: { bracket_id: string };
  games: Game[];
  picks: Pick[];
  isLocked: boolean;
  tiebreaker: string;
  setTiebreaker: (v: string) => void;
  setSubmittedBanner: (v: string) => void;
  formRef: any;
  onPick: (gameId: number, teamId: string) => void;
  setView: (view: any) => void;
};

// -----------------------------
// COMPONENT
// -----------------------------
export default function ChampionshipView({
  bracket,
  games,
  picks,
  isLocked,
  tiebreaker,
  setTiebreaker,
  setSubmittedBanner,
  formRef,
  onPick,
  setView,
}: ChampionshipViewProps) {
  const CHAMPIONSHIP_GAME_ID = 63;

  // -----------------------------
  // GET SEMIFINAL WINNERS
  // -----------------------------
  const semifinal1 = games.find((g) => g.game_id === 61);
  const semifinal2 = games.find((g) => g.game_id === 62);

  const getWinner = (game: Game | undefined): Team | null => {
    if (!game) return null;

    const pick = picks.find((p) => p.game_id === game.game_id);
    if (!pick) return null;

    return game.team1?.team_id === pick.selected_team
      ? game.team1
      : game.team2;
  };

  const team1 = getWinner(semifinal1);
  const team2 = getWinner(semifinal2);

  const selectedTeamId =
    picks.find((p) => p.game_id === CHAMPIONSHIP_GAME_ID)?.selected_team ||
    null;

  // -----------------------------
  // TEAM BUTTON
  // -----------------------------
  const renderTeamButton = (team: Team | null) => {
    if (!team) {
      return (
        <div className="text-xs text-slate-500 italic px-2 py-1 border border-dashed border-slate-700 rounded h-9 flex items-center">
          TBD
        </div>
      );
    }

    const isSelected = selectedTeamId === team.team_id;
    const logo = getTeamLogo(team.name);

    return (
      <button
        type="button"
        onClick={() => onPick(CHAMPIONSHIP_GAME_ID, team.team_id)}
        disabled={isLocked}
        className={`flex items-center gap-2 px-2 h-9 rounded text-xs border transition w-full
          ${
            isSelected
              ? "bg-emerald-600/80 border-emerald-400 text-white"
              : "bg-slate-900/60 border-slate-600 text-slate-100 hover:bg-slate-700/80"
          }
          ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        {logo && (
          <img
            src={logo}
            alt={team.name}
            className="w-5 h-5 rounded-full object-cover"
          />
        )}

        {team.seed !== null && (
          <span className="text-xs font-bold text-slate-100">{team.seed}</span>
        )}

        <span className="flex-1 text-left">{team.name}</span>
      </button>
    );
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">Championship</h2>

        <button
          onClick={() => setView("final-four")}
          className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs"
        >
          ← Back to Final Four
        </button>
      </div>

      {/* Matchup */}
      <div className="flex flex-col gap-2 bg-slate-800/60 rounded-md p-4 border border-slate-700">
        <div className="text-xs font-semibold text-slate-400 mb-1">
          National Championship
        </div>

        {renderTeamButton(team1)}
        {renderTeamButton(team2)}
      </div>

      {/* Tiebreaker */}
      <div className="flex flex-col gap-2">
        <input
          type="number"
          placeholder="Championship total points tiebreaker"
          value={tiebreaker}
          onChange={(e) => setTiebreaker(e.target.value)}
          disabled={isLocked}
          className="px-2 py-1 text-xs bg-slate-900/60 border border-slate-600 rounded text-slate-200"
        />

        <button
          disabled={isLocked}
          onClick={() => {
            if (!tiebreaker) {
              alert("Please enter a tiebreaker score.");
              return;
            }

            const form = formRef.current;
            if (!form) return;

            const fd = new FormData(form);
            fd.set("tiebreaker", tiebreaker);
            fd.set("bracketId", bracket.bracket_id);

            form.requestSubmit();
            setSubmittedBanner("Bracket submitted successfully.");
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
        >
          Submit Bracket →
        </button>
      </div>
    </div>
  );
}
