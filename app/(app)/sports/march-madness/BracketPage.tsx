"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { Game, Picks, MulliganState } from "@/lib/bracketTypes";

import { RoundOf64 } from "@/components/bracket/RoundOf64";
import { RoundOf32 } from "@/components/bracket/RoundOf32";
import { Sweet16 } from "@/components/bracket/Sweet16";
import { Elite8 } from "@/components/bracket/Elite8";
import { FinalFour } from "@/components/bracket/FinalFour";
import { Championship } from "@/components/bracket/Championship";
import { MulliganModal } from "@/components/bracket/MulliganModal";

export default function BracketPage() {
  const searchParams = useSearchParams();
  const bracketId = searchParams.get("bid");

  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<Picks>({});
  const [mulligans, setMulligans] = useState<MulliganState>({ remaining: 2 });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [bracketName, setBracketName] = useState("");
  const [tiebreaker, setTiebreaker] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const [mulliganGame, setMulliganGame] = useState<Game | null>(null);

  // -----------------------------------------------------
  // LOAD BRACKET METADATA + PICKS + GAMES + LOCK DATE
  // -----------------------------------------------------
  useEffect(() => {
    if (!bracketId) return;

    async function loadBracket() {
      setLoading(true);

      // 1. Load lock date
      const { data: settings } = await supabase
        .from("settings")
        .select("lock_date")
        .eq("id", 1)
        .single();

      if (settings?.lock_date) {
        const lockDate = new Date(settings.lock_date);
        const now = new Date();
        if (now > lockDate) setIsLocked(true);
      }

      // 2. Load bracket metadata
      const { data: bracket } = await supabase
        .from("brackets")
        .select("*")
        .eq("bracket_id", bracketId)
        .single();

      if (bracket) {
        setBracketName(bracket.bracket_name);
        setTiebreaker(bracket.tiebreaker_score ?? null);
        setMulligans({ remaining: bracket.mulligans_remaining ?? 2 });
      }

      // 3. Load existing picks
      const { data: existingPicks } = await supabase
        .from("picks")
        .select("*")
        .eq("bracket_id", bracketId);

      if (existingPicks) {
        const pickMap: Picks = {};
        existingPicks.forEach((p) => {
          pickMap[p.game_id] = p.selected_team;
        });
        setPicks(pickMap);
      }

      // 4. Load games
      const res = await fetch("/api/bracket/generate");
      const gameData = await res.json();
      setGames(gameData);

      setLoading(false);
    }

    loadBracket();
  }, [bracketId]);

  // -----------------------------------------------------
  // RENAME BRACKET
  // -----------------------------------------------------
  const handleRenameBracket = async () => {
    if (isLocked || isSubmitted) return;
    if (!bracketId) return;

    const res = await fetch("/api/bracket/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bracketId, bracketName }),
    });

    const data = await res.json();
    if (!res.ok) alert(data.error || "Failed to rename bracket");
  };

  // -----------------------------------------------------
  // USER SELECTS A TEAM
  // -----------------------------------------------------
  const handlePick = (gameId: number, team: string) => {
    if (isLocked || isSubmitted) return;
    setPicks((prev) => ({ ...prev, [gameId]: team }));
  };

  // -----------------------------------------------------
  // USER USES A MULLIGAN
  // -----------------------------------------------------
  const handleUseMulligan = (game: Game) => {
    if (isLocked || isSubmitted) return;
    setMulliganGame(game);
  };

  const handleApplyMulligan = (originalGameId: number, gameIdsToFix: number[]) => {
    if (isLocked || isSubmitted) return;

    const originalGame = games.find((g) => g.id === originalGameId);
    if (!originalGame || !originalGame.winner) return;

    const winner = originalGame.winner;

    setPicks((prev) => {
      const next = { ...prev };
      gameIdsToFix.forEach((gid) => (next[gid] = winner));
      return next;
    });

    setMulligans((prev) => ({
      ...prev,
      remaining: Math.max(0, prev.remaining - 1),
    }));

    setMulliganGame(null);
  };

  // -----------------------------------------------------
  // SUBMIT BRACKET
  // -----------------------------------------------------
  const handleSubmitBracket = async () => {
    if (isLocked || isSubmitted) return;
    if (!bracketId) return;

    const formattedPicks = Object.entries(picks).map(([gameId, team]) => ({
      game_id: Number(gameId),
      selected_team: team,
    }));

    const res = await fetch("/api/bracket/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bracketId, picks: formattedPicks, tiebreaker }),
    });

    const data = await res.json();
    if (res.ok) setIsSubmitted(true);
    else alert(data.error || "Failed to submit bracket");
  };

  // -----------------------------------------------------
  // ROUND FILTERS
  // -----------------------------------------------------
  const round1Games = games.filter((g) => g.round === 1);
  const round2Games = games.filter((g) => g.round === 2);
  const round3Games = games.filter((g) => g.round === 3);
  const round4Games = games.filter((g) => g.round === 4);
  const round5Games = games.filter((g) => g.round === 5);
  const round6Games = games.filter((g) => g.round === 6);

  if (loading) return <div className="bracket-page">Loading bracket…</div>;

  return (
    <div className="bracket-page">
      {/* BRACKET NAME */}
      <h1 className="bracket-title">{bracketName}</h1>

      {/* LOCKED BANNER */}
      {isLocked && (
        <div className="bracket-locked-banner">
          Bracket submissions are locked.
        </div>
      )}

      {/* RENAME UI */}
      <div className="bracket-rename">
        <input
          type="text"
          value={bracketName}
          onChange={(e) => setBracketName(e.target.value)}
          disabled={isLocked || isSubmitted}
          className="bracket-name-input"
        />
        <button
          type="button"
          onClick={handleRenameBracket}
          disabled={isLocked || isSubmitted}
          className="save-name-button"
        >
          Save Name
        </button>
      </div>

      {/* TIEBREAKER UI */}
      <div className="tiebreaker-section">
        <label className="tiebreaker-label">
          Championship Total Points (Tiebreaker)
        </label>
        <input
          type="number"
          value={tiebreaker ?? ""}
          onChange={(e) => setTiebreaker(Number(e.target.value))}
          disabled={isLocked || isSubmitted}
          className="tiebreaker-input"
          placeholder="Enter total points"
        />
      </div>

      {/* MULLIGAN COUNT */}
      <div className="mulligan-count">
        Mulligans remaining: {mulligans.remaining}
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="button"
        onClick={handleSubmitBracket}
        disabled={isLocked || isSubmitted}
        className="submit-bracket-button"
      >
        {isLocked
          ? "Bracket Locked"
          : isSubmitted
          ? "Bracket Submitted"
          : "Submit Bracket"}
      </button>

      {/* ROUND OF 64 */}
      <RoundOf64
        games={round1Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted || isLocked}
      />

      {/* ROUND OF 32 */}
      <RoundOf32
        games={round2Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted || isLocked}
      />

      {/* SWEET 16 */}
      <Sweet16
        games={round3Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted || isLocked}
      />

      {/* ELITE 8 */}
      <Elite8
        games={round4Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted || isLocked}
      />

      {/* FINAL FOUR */}
      <FinalFour
        games={round5Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted || isLocked}
      />

      {/* CHAMPIONSHIP */}
      <Championship
        games={round6Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted || isLocked}
      />

      {/* MULLIGAN MODAL */}
      {mulliganGame && !isLocked && !isSubmitted && (
        <MulliganModal
          game={mulliganGame}
          games={games}
          picks={picks}
          onApply={handleApplyMulligan}
          onClose={() => setMulliganGame(null)}
        />
      )}
    </div>
  );
}
