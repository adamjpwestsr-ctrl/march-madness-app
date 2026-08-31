import GameCard from "./GameCard";

export default function GameList({
  games,
  teamsById,
}: {
  games: any[];
  teamsById: Record<string, any>;
}) {
  return (
    <div className="grid gap-4">
      {games.map((g) => (
        <GameCard key={g.game_id} game={g} teamsById={teamsById} />
      ))}
    </div>
  );
}
