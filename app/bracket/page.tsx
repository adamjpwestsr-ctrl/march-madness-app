"use client";

import { useEffect, useState } from "react";
import { Game, Picks, MulliganState } from "@/lib/bracketTypes";

import { RoundOf64 } from "@/components/bracket/RoundOf64";
import { RoundOf32 } from "@/components/bracket/RoundOf32";
import { Sweet16 } from "@/components/bracket/Sweet16";
import { Elite8 } from "@/components/bracket/Elite8";
import { FinalFour } from "@/components/bracket/FinalFour";
import { Championship } from "@/components/bracket/Championship";

import { MulliganModal } from "@/components/bracket/MulliganModal";

export default function BracketPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<Picks>({});
  const [mulligans, setMulligans] = useState<MulliganState>({ remaining: 2 });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [mulliganGame, setMulliganGame] = useState<Game | null>(null);

  // TODO: load games + picks from Supabase
  useEffect(() => {
    // fetch games + picks here
  }, []);

  // User selects a team
  const handlePick = (gameId: number, team: string) => {
    setPicks((prev) => ({ ...prev, [gameId]: team }));
  };

  // User clicks the 🩹 icon
  const handleUseMulligan = (game: Game) => {
    setMulliganGame(game);
  };

  // Apply mulligan to selected rounds
  const handleApplyMulligan = (originalGameId: number, gameIdsToFix: number[]) => {
    const originalGame = games.find((g) => g.id === originalGameId);
    if (!originalGame || !originalGame.winner) return;

    const winner = originalGame.winner;

    setPicks((prev) => {
      const next = { ...prev };
      gameIdsToFix.forEach((gid) => {
        next[gid] = winner;
      });
      return next;
    });

    setMulligans((prev) => ({
      ...prev,
      remaining: Math.max(0, prev.remaining - 1),
    }));

    setMulliganGame(null);
  };

  // Submit bracket
  const handleSubmitBracket = async () => {
    // POST picks to /api/bracket/submit
    setIsSubmitted(true);
  };

  // Round filters
  const round1Games = games.filter((g) => g.round === 1);
  const round2Games = games.filter((g) => g.round === 2);
  const round3Games = games.filter((g) => g.round === 3);
  const round4Games = games.filter((g) => g.round === 4);
  const round5Games = games.filter((g) => g.round === 5);
  const round6Games = games.filter((g) => g.round === 6);

  return (
    <div className="bracket-page">
      {/* Mulligan count */}
      <div className="mulligan-count">
        Mulligans remaining: {mulligans.remaining}
      </div>

      {/* Submit button */}
      <button
        type="button"
        onClick={handleSubmitBracket}
        disabled={isSubmitted}
        className="submit-bracket-button"
      >
        {isSubmitted ? "Bracket Submitted" : "Submit Bracket"}
      </button>

      {/* ROUND OF 64 */}
      <RoundOf64
        games={round1Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted}
      />

      {/* ROUND OF 32 */}
      <RoundOf32
        games={round2Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted}
      />

      {/* SWEET 16 */}
      <Sweet16
        games={round3Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted}
      />

      {/* ELITE 8 */}
      <Elite8
        games={round4Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted}
      />

      {/* FINAL FOUR */}
      <FinalFour
        games={round5Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted}
      />

      {/* CHAMPIONSHIP */}
      <Championship
        games={round6Games}
        picks={picks}
        mulligans={mulligans}
        onPick={handlePick}
        onUseMulligan={handleUseMulligan}
        isSubmitted={isSubmitted}
      />

      {/* MULLIGAN MODAL */}
      {mulliganGame && (
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
