"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { Game, Picks, MulliganState } from "@/lib/bracketTypes";

import { RoundOf64 } from "@/components/bracket/RoundOf64";
import { RoundOf32 } from "@/components/bracket/RoundOf32";
import { Sweet16 } from "@/components/bracket/Sweet16";
import { Elite8 } from "@/components/bracket/Elite8";
import { FinalFour } from "@/components/bracket/FinalFour";
import { Championship } from "@/components/bracket/Championship";
import { MulliganModal } from "@/components/bracket/MulliganModal";

export default function BracketPage({ bracketId }: { bracketId: string }) {
  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<Picks>({});
  const [mulligans, setMulligans] = useState<MulliganState>({ remaining: 2 });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [bracketName, setBracketName] = useState("");
  const [tiebreaker, setTiebreaker] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mulliganGame, setMulliganGame] = useState<Game | null>(null);

  // -----------------------------------------------------
  // LOAD BRACKET METADATA + PICKS + GAMES + LOCK DATE
  // -----------------------------------------------------
  useEffect(() => {
    if (!bracketId) {
      setError("No bracket selected.");
      setLoading(false);
      return;
    }

    async function loadBracket() {
      setLoading(true);
      setError(null);

      try {
        // 1. Load lock date
        const { data: lockSettings } = await supabase
          .from("settings")
          .select("lock_date")
          .eq("id", 1)
          .single();

        if (lockSettings?.lock_date) {
          const lockDate = new Date(lockSettings.lock_date);
          if (new Date() > lockDate) setIsLocked(true);
        }

        // 2. Load bracket metadata
        const { data: bracketData, error: bracketError } = await supabase
          .from("brackets")
          .select("*")
          .eq("bracket_id", bracketId)
          .single();

        if (bracketError) {
          console.error("Error loading bracket:", bracketError);
          setError("Failed to load bracket metadata.");
        }

        if (bracketData) {
          setBracketName(bracketData.bracket_name);
          setTiebreaker(bracketData.tiebreaker_score ?? null);
          setMulligans({ remaining: bracketData.mulligans_remaining ?? 2 });
        }

        // 3. Load existing picks
        const { data: picksData } = await supabase
          .from("picks")
          .select("*")
          .eq("bracket_id", bracketId);

        if (picksData) {
          const pickMap: Picks = {};
          picksData.forEach((p) => {
            pickMap[p.game_id] = p.selected_team;
          });
          setPicks(pickMap);
        }

        // 4. Load games from DB (NOT from /api/bracket/generate)
        const { data: gameData, error: gameError } = await supabase
          .from("games")
          .select("*")
          .order("round", { ascending: true })
          .order("game_id", { ascending: true });

        if (gameError) {
          console.error("Error loading games:", gameError);
          setError("Failed to load games.");
          setGames([]);
        } else {
          setGames(gameData || []);
        }
      } catch (e) {
        console.error("Unexpected error loading bracket:", e);
        setError("Unexpected error loading bracket.");
      } finally {
        setLoading(false);
      }
    }

    loadBracket();
  }, [bracketId]);

  // -----------------------------------------------------
  // RENAME BRACKET
  // -----------------------------------------------------
  const handleRenameBracket = async () => {
    if (isLocked || isSubmitted) return;

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

  const handleApplyMulligan = (
    originalGameId: number,
    gameIdsToFix: number[]
  ) => {
    if (isLocked || isSubmitted) return;

    const originalGame = games.find((g) => g.game_id === originalGameId);
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

  if (error) {
    return (
      <div className="bracket-page">
        <h1>March Madness Bracket</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="bracket-page">
      {/* BRACKET NAME */}
      <h1 className="bracket-title">{bracketName || "March Madness Bracket"}</h1>

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
