"use client";

import { useState, useEffect, useRef } from "react";
import { submitBracket } from "./actions";
import { getTeamLogo } from "../../lib/getTeamLogo";
import RegionGrid from "./RegionGrid";
import RegionView from "./RegionView";
import FinalFourView from "./FinalFourView";
import ChampionshipView from "./ChampionshipView";
import { AnimatePresence, motion } from "framer-motion";

// -----------------------------
// TYPES
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

type BracketView =
  | "grid"
  | "region-east"
  | "region-west"
  | "region-south"
  | "region-midwest"
  | "final-four"
  | "championship"
  | "legacy";

const CHAMPIONSHIP_GAME_ID = 63;

// -----------------------------
// ICONS
// -----------------------------
const BulldogIcon = () => <span className="ml-1 text-lg leading-none">🐶</span>;
const CrownIcon = () => <span className="ml-1 text-base leading-none">👑</span>;

// -----------------------------
// LEGEND
// -----------------------------
function BracketLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-slate-300 bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2">
      <div className="flex items-center gap-1">
        <span className="text-base">👑</span>
        <span>Champion Pick</span>
      </div>

      <div className="flex items-center gap-1">
        <span className="text-base">🐶</span>
        <span>Underdog (higher seed beats lower seed)</span>
      </div>

      <div className="flex items-center gap-1 opacity-70">
        <span className="text-base">🍀</span>
        <span>Mulligan (coming soon)</span>
      </div>
    </div>
  );
}

// -----------------------------
// MAIN COMPONENT
// -----------------------------
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
  const [submittedBanner, setSubmittedBanner] = useState("");
  const [lockDate, setLockDate] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const [view, setView] = useState<BracketView>("grid");

  const formRef = useRef<HTMLFormElement | null>(null);

  // -----------------------------
  // EFFECTS
  // -----------------------------
  useEffect(() => {
    setLocalPicks(picks);
  }, [picks]);

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
        setIsLocked(false);
      }
    }
    loadLockDate();
  }, []);

  // -----------------------------
  // HELPERS
  // -----------------------------
  const getSelectedTeamId = (game: Game): string | null => {
    const pick = localPicks.find((p) => p.game_id === game.game_id);
    return pick ? pick.selected_team : null;
  };

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

  // Group games by region
  const gamesByRegion: Record<string, Game[]> = {};
  games.forEach((g) => {
    if (!gamesByRegion[g.region]) gamesByRegion[g.region] = [];
    gamesByRegion[g.region].push(g);
  });

  // -----------------------------
  // RENDER REGION (legacy layout)
  // -----------------------------
  const renderRegion = (region: string, dir: "ltr" | "rtl" = "ltr") => {
    const regionGames = (gamesByRegion[region] || [])
      .slice()
      .sort((a, b) => a.round - b.round);

    if (!regionGames.length) return null;

    let rounds = Array.from(new Set(regionGames.map((g) => g.round))).sort(
      (a, b) => a - b
    );

    if (dir === "rtl") rounds = rounds.slice().reverse();

    const renderTeamButton = (
      game: Game,
      team: Team | null,
      selectedTeamId: string | null
    ) => {
      if (!team) {
        return (
          <div className="text-xs text-slate-500 italic px-2 py-1 border border-dashed border-slate-700 rounded h-9 flex items-center">
            TBD
          </div>
        );
      }

      const isSelected = selectedTeamId === team.team_id;
      const logo = getTeamLogo(team.name);

      let isUnderdog = false;
      if (game.team1 && game.team2 && isSelected) {
        const opponent =
          team.team_id === game.team1.team_id ? game.team2 : game.team1;
        if (team.seed !== null && opponent?.seed !== null) {
          isUnderdog = team.seed > opponent.seed;
        }
      }

      const isChampion = game.game_id === CHAMPIONSHIP_GAME_ID && isSelected;

      return (
        <button
          type="button"
          form="__none__"
          onClick={() => handlePick(game.game_id, team.team_id)}
          disabled={isLocked}
          className={`flex items-center justify-between px-2 h-9 rounded text-xs border transition
            ${
              isSelected
                ? "bg-emerald-600/80 border-emerald-400 text-white"
                : "bg-slate-900/60 border-slate-600 text-slate-100 hover:bg-slate-700/80"
            }
            ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
            ${
              isChampion
                ? "ring-2 ring-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.8)]"
                : ""
            }
          `}
        >
          <div
            className={`flex items-center gap-2 w-full ${
              dir === "rtl" ? "flex-row-reverse justify-end" : "flex-row"
            }`}
          >
            {logo && (
              <img
                src={logo}
                alt={team.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            )}

            {team.seed !== null && (
              <span className="text-xs font-bold text-slate-100">
                {team.seed}
              </span>
            )}

            <span
              className={`flex-1 ${
                dir === "rtl" ? "text-right" : "text-left"
              }`}
            >
              {team.name}
              {isUnderdog && <BulldogIcon />}
              {isChampion && <CrownIcon />}
            </span>
          </div>
        </button>
      );
    };

    // END OF renderRegion
  };

  // -----------------------------
  // SIDEBAR NAV ITEMS
  // -----------------------------
  const navItems = [
    { key: "grid", label: "Region Grid", icon: "🏠" },
    { key: "region-east", label: "East", icon: "🧭" },
    { key: "region-west", label: "West", icon: "🌄" },
    { key: "region-south", label: "South", icon: "☀️" },
    { key: "region-midwest", label: "Midwest", icon: "⭐" },
    { key: "final-four", label: "Final Four", icon: "🏀" },
    { key: "championship", label: "Championship", icon: "🏆" },
  ];

  // -----------------------------
  // ANIMATION CONFIG
  // -----------------------------
  const viewKey = view;
  const transitionVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="flex w-full relative">

      {/* ----------------------------- */}
      {/* FROSTED GLASS SIDEBAR */}
      {/* ----------------------------- */}
      <aside
        className="
          fixed left-0 top-0 bottom-0
          w-[260px] p-6
          bg-white/10 backdrop-blur-xl
          border-r border-white/10
          shadow-xl shadow-black/40
          flex flex-col
          z-20
        "
      >
        {/* Bracket Name */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white tracking-wide">
            {bracket.bracket_id}
          </h2>
          <div className="h-[3px] w-20 mt-2 rounded-full bg-emerald-400" />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key as BracketView)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                  transition-all
                  ${
                    active
                      ? "bg-emerald-500/30 text-white border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      : "bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10 hover:scale-[1.02]"
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Lock Status */}
        <div className="mt-6">
          {isLocked ? (
            <div className="px-3 py-2 rounded-md bg-red-900/40 border border-red-700/40 text-xs text-red-200">
              Bracket Locked
            </div>
          ) : lockDate ? (
            <div className="px-3 py-2 rounded-md bg-emerald-900/40 border border-emerald-700/40 text-xs text-emerald-200">
              Open Until Lock Date
            </div>
          ) : (
            <div className="px-3 py-2 rounded-md bg-slate-800/40 border border-slate-600 text-xs text-slate-200">
              No Lock Date Set
            </div>
          )}
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            if (isLocked) return;
            onReset();
            setLocalPicks([]);
            setTiebreaker("");
            setSubmittedBanner("");
          }}
          disabled={isLocked}
          className={`
            mt-auto px-4 py-2 rounded-lg text-sm text-white
            bg-red-600 hover:bg-red-700 transition
            ${isLocked ? "opacity-60 cursor-not-allowed" : ""}
          `}
        >
          Reset Bracket
        </button>
      </aside>

      {/* ----------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ----------------------------- */}
      <main className="ml-[260px] w-full p-6">
        {/* Hidden form for Championship submission */}
        <form ref={formRef} action={submitBracket} className="hidden">
          <input type="hidden" name="bracketId" value={bracket.bracket_id} />
          <input type="hidden" name="tiebreaker" value={tiebreaker} />
        </form>

        {/* Legend */}
        <div className="mb-6 flex gap-6 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-lg">👑</span> Champion Pick
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🐶</span> Underdog Pick
          </div>
          <div className="flex items-center gap-2 opacity-60">
            <span className="text-lg">🍀</span> Mulligan (coming soon)
          </div>
        </div>

        {/* Animated Router */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={transitionVariants}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            {view === "grid" && <RegionGrid setView={setView} />}

            {view === "region-east" && (
              <RegionView
                region="East"
                bracket={bracket}
                games={games}
                picks={localPicks}
                isLocked={isLocked}
                onPick={handlePick}
                setView={setView}
              />
            )}

            {view === "region-west" && (
              <RegionView
                region="West"
                bracket={bracket}
                games={games}
                picks={localPicks}
                isLocked={isLocked}
                onPick={handlePick}
                setView={setView}
              />
            )}

            {view === "region-south" && (
              <RegionView
                region="South"
                bracket={bracket}
                games={games}
                picks={localPicks}
                isLocked={isLocked}
                onPick={handlePick}
                setView={setView}
              />
            )}

            {view === "region-midwest" && (
              <RegionView
                region="Midwest"
                bracket={bracket}
                games={games}
                picks={localPicks}
                isLocked={isLocked}
                onPick={handlePick}
                setView={setView}
              />
            )}

            {view === "final-four" && (
              <FinalFourView
                bracket={bracket}
                games={games}
                picks={localPicks}
                isLocked={isLocked}
                onPick={handlePick}
                setView={setView}
              />
            )}

            {view === "championship" && (
              <ChampionshipView
                bracket={bracket}
                games={games}
                picks={localPicks}
                isLocked={isLocked}
                tiebreaker={tiebreaker}
                setTiebreaker={setTiebreaker}
                setSubmittedBanner={setSubmittedBanner}
                formRef={formRef}
                onPick={handlePick}
                setView={setView}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
