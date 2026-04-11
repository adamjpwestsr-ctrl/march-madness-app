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
  // UPGRADED TEAM BUTTON
  // -----------------------------
  const renderTeamButton = (team: Team | null) => {
    if (!team) {
      return (
        <div className="text-xs text-slate-500 italic px-3 py-2 border border-dashed border-slate-700 rounded-md h-10 flex items-center">
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
        className={`
          relative flex items-center gap-3 px-3 h-10 rounded-md text-xs
          border transition-all w-full
          ${
            isSelected
              ? `
                bg-emerald-600/30 
                border-emerald-400 
                text-white 
                shadow-[0_0_12px_rgba(16,185,129,0.5)]
                `
              : `
                bg-white/5 
                border-white/10 
                text-slate-100 
                hover:bg-white/10 
                hover:scale-[1.02]
                `
          }
          ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        {logo && (
          <img
            src={logo}
            alt={team.name}
            className="w-6 h-6 rounded-full object-cover shadow-sm"
          />
        )}

        {team.seed !== null && (
          <span
            className={`
              text-[10px] font-bold px-1.5 py-0.5 rounded 
              ${
                isSelected
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-200"
              }
            `}
          >
            {team.seed}
          </span>
        )}

        <span className="flex-1 text-left text-sm tracking-wide">
          {team.name}
        </span>
      </button>
    );
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* ----------------------------- */}
      {/* PREMIUM HEADER */}
      {/* ----------------------------- */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🏆</span>

            <h2 className="text-2xl font-semibold tracking-wide text-slate-100">
              Championship
            </h2>
          </div>

          <div className="h-[3px] w-28 mt-1 rounded-full bg-yellow-400" />
        </div>

        <button
          onClick={() => setView("final-four")}
          className="
            flex items-center gap-2 px-3 py-1.5
            bg-white/5 border border-white/10 backdrop-blur-md
            text-slate-200 text-xs rounded-lg
            shadow-md shadow-black/40
            hover:ring-2 hover:ring-white/20 hover:scale-[1.03]
            transition-all duration-200
          "
        >
          <span className="text-sm">←</span>
          Back
        </button>
      </div>

      {/* ----------------------------- */}
      {/* FINAL MATCHUP CARD */}
      {/* ----------------------------- */}
      <div
        className="
          flex flex-col gap-3 p-5 rounded-xl
          bg-white/5 border border-white/10 backdrop-blur-sm
          shadow-lg shadow-black/40
          relative overflow-hidden
        "
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-xl" />

        <div className="relative z-10">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-300 mb-2">
            National Championship
          </div>

          <div className="flex flex-col gap-2">
            {renderTeamButton(team1)}
            {renderTeamButton(team2)}
          </div>
        </div>
      </div>

      {/* ----------------------------- */}
      {/* PREMIUM TIEBREAKER INPUT */}
      {/* ----------------------------- */}
      <div className="flex flex-col gap-3">
        <input
          type="number"
          placeholder="Championship total points tiebreaker"
          value={tiebreaker}
          onChange={(e) => setTiebreaker(e.target.value)}
          disabled={isLocked}
          className="
            px-3 py-2 text-sm rounded-lg
            bg-white/5 border border-white/10 backdrop-blur-sm
            text-slate-200 placeholder-slate-400
            shadow-inner shadow-black/20
            focus:outline-none focus:ring-2 focus:ring-yellow-300/40
            transition-all
          "
        />

        {/* ----------------------------- */}
        {/* PREMIUM SUBMIT BUTTON */}
        {/* ----------------------------- */}
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
          className="
            px-6 py-3 rounded-xl text-white font-semibold tracking-wide
            bg-gradient-to-br from-yellow-400 to-yellow-600
            shadow-lg shadow-yellow-900/40
            border border-white/10 backdrop-blur-md
            transition-all duration-300
            hover:scale-[1.04] hover:shadow-yellow-500/40 hover:ring-2 hover:ring-yellow-300/40
            active:scale-[0.97]
            flex items-center gap-2
          "
        >
          Submit Bracket
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
