"use client";

import { useState, useEffect } from "react";
import { submitBracket } from "./actions";
import RegionGrid from "./RegionGrid";
import RegionView from "./RegionView";
import FinalFourView from "./FinalFourView";
import ChampionshipView from "./ChampionshipView";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

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
  | "championship";

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
  bracket: { bracket_id: string; bracket_name: string };
  games: Game[];
  picks: Pick[];
  onPick: (gameId: number, teamId: string) => void;
  onReset: () => void;
}) {
  const [localPicks, setLocalPicks] = useState(picks);
  const [submittedBanner, setSubmittedBanner] = useState("");
  const [lockDate, setLockDate] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const [view, setView] = useState<BracketView>("grid");

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
  // PICK HANDLER
  // -----------------------------
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

  // -----------------------------
  // SUBMIT HANDLER (DIRECT ARGUMENTS + CONFETTI)
// -----------------------------
  const handleSubmitBracket = async (tiebreaker: number) => {
    if (isLocked) return;

    const result = await submitBracket(bracket.bracket_id, tiebreaker);

    if (result?.success) {
      setSubmittedBanner("Bracket Submitted!");

      // 🎉 CONFETTI BURST
      confetti({
        particleCount: 180,
        spread: 70,
        origin: { y: 0.6 },
        scalar: 1.1,
      });

      // 🎉 SECONDARY BURST FOR EXTRA PIZZAZZ
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.4 },
          scalar: 0.9,
        });
      }, 350);
    }
  };

  // -----------------------------
  // NAV ITEMS
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
      {/* SIDEBAR */}
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
            {bracket.bracket_name}
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
                      : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/10 hover:scale-[1.02]"
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
  onClick={async () => {
    if (isLocked) return;

    const confirmed = confirm("Are you sure you want to reset your bracket?");
    if (!confirmed) return;

    await onReset(); // BracketShell → handleReset()

    // Clear UI state
    setLocalPicks([]);
    setSubmittedBanner("");

    // Reload bracket from server
    window.location.reload();
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

  // Clear UI state
  setLocalPicks([]);
  setSubmittedBanner("");

  // Reload bracket from server
  window.location.reload();
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

      {/* MAIN CONTENT */}
      <main
        className="
          ml-[260px]
          w-full
          p-6
          overflow-x-hidden
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent
          hover:scrollbar-thumb-slate-600
          backdrop-blur-md bg-slate-900/20
        "
      >
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

        {/* Submitted Banner */}
        {submittedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-6 p-4 rounded-lg bg-emerald-600 text-white text-center shadow-xl"
          >
            {submittedBanner}
          </motion.div>
        )}

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
            {view === "grid" && (
              <RegionGrid
                setView={setView}
                picks={localPicks}
                games={games}
                isLocked={isLocked}
              />
            )}

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
                onPick={handlePick}
                onSubmit={handleSubmitBracket}
                setView={setView}
                submitted={submittedBanner !== ""}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
