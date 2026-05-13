import type { Game } from '@/lib/bracket/types';
import TeamCard from './TeamCard';

export default function OpeningRound({
  games,
  picks,
  onPick
}: {
  games: Game[];
  picks: Record<string, string>;
  onPick: (gameId: string, teamId: string) => void;
}) {
  return (
    <section className="round opening-round">
      <h2>Opening Round</h2>
      <div className="games-grid">
        {games.map(game => {
          const selectedTeam = picks[game.id];

          return (
            <div key={game.id} className="game-connector-wrapper">
              <div className="game-card">

                <div
                  className={`team-select ${selectedTeam === game.team1?.id ? 'selected' : ''}`}
                  onClick={() => onPick(game.id, game.team1?.id)}
                >
                  <TeamCard team={game.team1} />
                </div>

                <div className="vs">vs</div>

                <div
                  className={`team-select ${selectedTeam === game.team2?.id ? 'selected' : ''}`}
                  onClick={() => onPick(game.id, game.team2?.id)}
                >
                  <TeamCard team={game.team2} />
                </div>

              </div>

              <div className="connector-line"></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
