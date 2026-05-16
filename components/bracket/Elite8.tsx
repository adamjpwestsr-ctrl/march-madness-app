"use client";

import { Game, Picks, MulliganState } from "@/lib/bracketTypes";

type Props = {
  games: Game[];
  picks: Picks;
  mulligans: MulliganState;
  onPick: (gameId: number, team: string) => void;
  onUseMulligan: (game: Game) => void;
  isSubmitted: boolean;
};

export function Elite8(props: Props) {
  return <RoundTemplate {...props} />;
}

function RoundTemplate({
  games,
  picks,
  mulligans,
  onPick,
  onUseMulligan,
  isSubmitted,
}: Props) {
  // Only rounds 1–3 allow mulligans
  const mulliganEligibleRounds = [1, 2, 3];

  return (
    <div className="round elite-8">
      {games.map((game) => {
        const userPick = picks[game.game_id];
        const actualWinner = game.winner;

        const userPickedWrong =
          isSubmitted &&
          actualWinner &&
          userPick &&
          userPick !== actualWinner;

        const canUseMulligan =
          userPickedWrong &&
          mulliganEligibleRounds.includes(game.round ?? 0) &&
          mulligans.remaining > 0;

        const team1IsLosing =
          userPickedWrong &&
          userPick === game.team1 &&
          actualWinner === game.team2;

        const team2IsLosing =
          userPickedWrong &&
          userPick === game.team2 &&
          actualWinner === game.team1;

        return (
          <div key={game.game_id} className="game-row">
            {/* TEAM 1 */}
            <div className={"team-select" + (team1IsLosing ? " losing" : "")}>
              <button
                type="button"
                className={
                  "team-button" + (userPick === game.team1 ? " selected" : "")
                }
                onClick={() =>
                  !isSubmitted && game.team1 && onPick(game.game_id, game.team1)
                }
                disabled={isSubmitted}
              >
                {game.team1 || "TBD"}
              </button>

              {canUseMulligan && team1IsLosing && (
                <button
                  type="button"
                  className="mulligan-button"
                  onClick={() => onUseMulligan(game)}
                >
                  🩹
                </button>
              )}
            </div>

            {/* TEAM 2 */}
            <div className={"team-select" + (team2IsLosing ? " losing" : "")}>
              <button
                type="button"
                className={
                  "team-button" + (userPick === game.team2 ? " selected" : "")
                }
                onClick={() =>
                  !isSubmitted && game.team2 && onPick(game.game_id, game.team2)
                }
                disabled={isSubmitted}
              >
                {game.team2 || "TBD"}
              </button>

              {canUseMulligan && team2IsLosing && (
                <button
                  type="button"
                  className="mulligan-button"
                  onClick={() => onUseMulligan(game)}
                >
                  🩹
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
