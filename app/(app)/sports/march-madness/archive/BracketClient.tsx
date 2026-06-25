"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Legacy rendering engine (now moved into this folder)
import BracketShell from "./bracket/BracketShell";

import { Game, Picks, MulliganState } from "@/lib/bracketTypes";

export default function BracketClient({ bracketId }: { bracketId: string }) {
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
        // Load lock date
        const { data: lockSettings } = await supabase
          .from("settings")
          .select("lock_date")
          .eq("id", 1)
          .maybeSingle();

        if (lockSettings?.lock_date) {
          const lockDate = new Date(lockSettings.lock_date);
          if (new Date() > lockDate) setIsLocked(true);
        }

        // Load bracket metadata
        const { data: bracketData } = await supabase
          .from("brackets")
          .select("*")
          .eq("bracket_id", bracketId)
          .maybeSingle();

        if (bracketData) {
          setBracketName(bracketData.bracket_name);
          setTiebreaker(bracketData.tiebreaker_score ?? null);
          setMulligans({ remaining: bracketData.mulligans_remaining ?? 2 });
        }

        // Load picks
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

        // Load games
        const { data: gameData } = await supabase
          .from("games")
          .select("*")
          .order("round", { ascending: true })
          .order("game_id", { ascending: true });

        setGames(gameData || []);
      } catch (e) {
        console.error("Unexpected error loading bracket:", e);
        setError("Unexpected error loading bracket.");
      } finally {
        setLoading(false);
      }
    }

    loadBracket();
  }, [bracketId]);

  // --- Interaction handlers (unchanged) ---

  const handlePick = (gameId: number, team: string) => {
    if (isLocked || isSubmitted) return;
    setPicks((prev) => ({ ...prev, [gameId]: team }));
  };

  const handleUseMulligan = (game: Game) => {
    if (isLocked || isSubmitted) return;
    setMulliganGame(game);
  };

const handleApplyMulligan = (gameId: number, newTeam: string) => {
  if (isLocked || isSubmitted) return;

  setPicks((prev) => ({
    ...prev,
    [gameId]: newTeam,
  }));

  setMulligans((prev) => ({
    ...prev,
    remaining: Math.max(0, prev.remaining - 1),
  }));

  setMulliganGame(null);
};

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

  if (loading) return <div>Loading bracket…</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  // --- Render using the legacy shell ---
  return (
    <BracketShell
      games={games}
      picks={picks}
      mulligans={mulligans}
      bracketName={bracketName}
      tiebreaker={tiebreaker}
      isLocked={isLocked}
      isSubmitted={isSubmitted}
      mulliganGame={mulliganGame}
      onPick={handlePick}
      onUseMulligan={handleUseMulligan}
      onApplyMulligan={handleApplyMulligan}
      onSubmit={handleSubmitBracket}
      onRename={setBracketName}
      onSetTiebreaker={setTiebreaker}
      onCloseMulligan={() => setMulliganGame(null)}
    />
  );
}
