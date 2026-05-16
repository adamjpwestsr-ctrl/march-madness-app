"use client";

import { useMemo, useState } from "react";
import { Game, Picks, DownstreamRoundOption } from "@/lib/bracketTypes";

type Props = {
  game: Game;
  games: Game[];
  picks: Picks;
  onApply: (gameId: number, roundsToFix: number[]) => void;
  onClose: () => void;
};

export function MulliganModal({ game, games, picks, onApply, onClose }: Props) {
  const actualWinner = game.winner;
  const userPick = picks[game.game_id];

  const downstreamOptions = useMemo<DownstreamRoundOption[]>(() => {
    if (!actualWinner || !userPick) return [];

    const options: DownstreamRoundOption[] = [];

    // Always include the current game (required)
    options.push({
      round: game.round,
      gameId: game.game_id,
      label: `Round of ${Math.pow(2, 7 - (game.round ?? 0))} (this game)`,
    });

    // Find all future games where the user picked this losing team
    games
      .filter((g) => (g.round ?? 0) > (game.round ?? 0))
      .forEach((g) => {
        const pick = picks[g.game_id];
        if (pick === userPick) {
          const label = (() => {
            switch (g.round) {
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
                return `Round ${g.round}`;
            }
          })();

          options.push({
            round: g.round!,
            gameId: g.game_id,
            label,
          });
        }
      });

    return options;
  }, [actualWinner, userPick, game, games, picks]);

  const [selectedGameIds, setSelectedGameIds] = useState<number[]>(
    downstreamOptions.length ? [downstreamOptions[0].gameId] : []
  );

  if (!actualWinner || !userPick) return null;

  const handleToggle = (gameId: number) => {
    // First option (index 0) is required (the original game)
    if (gameId === downstreamOptions[0].gameId) return;

    setSelectedGameIds((prev) =>
      prev.includes(gameId)
        ? prev.filter((id) => id !== gameId)
        : [...prev, gameId]
    );
  };

  const handleConfirm = () => {
    const requiredId = downstreamOptions[0].gameId;

    if (!selectedGameIds.includes(requiredId)) {
      const updated = [requiredId, ...selectedGameIds];
      setSelectedGameIds(updated);
      onApply(game.game_id, updated);
    } else {
      onApply(game.game_id, selectedGameIds);
    }
  };

  return (
    <div className="mulligan-backdrop">
      <div className="mulligan-modal">
        <h2>Use a Mulligan?</h2>
        <p style={{ marginTop: 8, marginBottom: 12 }}>
          Oops! That pick didn&apos;t age well.
        </p>
        <p style={{ marginBottom: 16 }}>
          Use a mulligan to switch your pick to{" "}
          <strong>{actualWinner}</strong>?
        </p>

        {downstreamOptions.length > 0 && (
          <div className="mulligan-rounds">
            <p style={{ marginBottom: 8, fontWeight: 600 }}>
              Where do you want to apply this correction?
            </p>
            {downstreamOptions.map((opt, idx) => (
              <label
                key={opt.gameId}
                className="mulligan-round-option"
                style={{ opacity: idx === 0 ? 0.9 : 1 }}
              >
                <input
                  type="checkbox"
                  checked={selectedGameIds.includes(opt.gameId)}
                  disabled={idx === 0} // original game is required
                  onChange={() => handleToggle(opt.gameId)}
                />
                <span>
                  {opt.label}
                  {idx === 0 ? " (required)" : ""}
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="mulligan-actions">
          <button className="mulligan-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="mulligan-confirm" onClick={handleConfirm}>
            Apply Mulligan
          </button>
        </div>
      </div>
    </div>
  );
}
