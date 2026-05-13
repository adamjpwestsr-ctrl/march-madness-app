"use client";

import { Game, Picks } from "@/lib/bracketTypes";

type Props = {
  games: Game[];
  picks: Picks;
  onPick: (gameId: number, team: string) => void;
};

export default function OpeningRound({ games, picks, onPick }: Props) {
  return (
    <div className="opening-round">
      <h2>Opening Round</h2>

      <div className="games-grid">
        {games.map((game) => {
          const selectedTeam = picks[game.id];

          return (
            <div key={game.id} className="game-connector-wrapper">
              <div className="team-select">
                <button
                  type="button"
                  className={
                    "team-button" +
                    (selectedTeam === game.team1 ? " selected" : "")
                  }
                  onClick={() => game.team1 && onPick(game.id, game.team1)}
                >
                  {game.team1 || "TBD"}
                </button>
              </div>

              <div className="team-select">
                <button
                  type="button"
                  className={
                    "team-button" +
                    (selectedTeam === game.team2 ? " selected" : "")
                  }
                  onClick={() => game.team2 && onPick(game.id, game.team2)}
                >
                  {game.team2 || "TBD"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
