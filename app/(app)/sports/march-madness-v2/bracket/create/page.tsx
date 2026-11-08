'use client';

import { useEffect, useState } from 'react';

type Game = {
  id: string;
  game_number: number;
  round: number;
  region: string | null;
  team1_id: string | null;
  team2_id: string | null;
  winner_to_game_id: string | null;
  winner: string | null;
  team1?: any;
  team2?: any;
};

type Team = {
  id: string;
  team_name: string;
  seed: number;
  region: string;
};

export default function CreateBracketPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Load tournament structure + teams
  useEffect(() => {
    async function load() {
      try {
        const [gamesRes, teamsRes] = await Promise.all([
          fetch('/api/march-madness/tournament/games'),
          fetch('/api/march-madness/tournament/teams'),
        ]);

        const gamesJson = await gamesRes.json();
        const teamsJson = await teamsRes.json();

        setGames(gamesJson.games);
        setTeams(teamsJson.teams);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Helper: get team object
  function getTeam(id: string | null) {
    return teams.find((t) => t.id === id);
  }

  // Player chooses winner
  function pickWinner(gameId: string, teamId: string) {
    setGames((prev) => {
      const updated = [...prev];
      const game = updated.find((g) => g.id === gameId);
      if (!game) return prev;

      game.winner = teamId;

      // Propagate winner to next game
      if (game.winner_to_game_id) {
        const nextGame = updated.find((g) => g.id === game.winner_to_game_id);
        if (nextGame) {
          if (!nextGame.team1_id) nextGame.team1_id = teamId;
          else nextGame.team2_id = teamId;
        }
      }

      return updated;
    });
  }

  async function saveBracket() {
    try {
      setSaving(true);
      setMessage(null);

      const payload = games
        .filter((g) => g.winner)
        .map((g) => ({
          game_id: g.id,
          winner_team_id: g.winner,
        }));

      const res = await fetch('/api/march-madness/brackets/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picks: payload }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage(`❌ Error saving bracket: ${json.error}`);
      } else {
        setMessage('✅ Bracket saved successfully!');
      }
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-gray-100">
        Loading bracket builder...
      </div>
    );
  }

  return (
    <div className="p-10 text-gray-100 bg-slate-900 min-h-screen">
      <h1 className="text-4xl font-bold mb-6">Create Your Bracket</h1>

      {message && (
        <div className="mb-4 text-yellow-300 font-mono">{message}</div>
      )}

      {/* ROUNDS */}
      {[1, 2, 3, 4, 5, 6].map((round) => {
        const roundGames = games.filter((g) => g.round === round);

        return (
          <div key={round} className="mb-10">
            <h2 className="text-2xl font-bold mb-4">
              {round === 1 && 'Round of 64'}
              {round === 2 && 'Round of 32'}
              {round === 3 && 'Sweet 16'}
              {round === 4 && 'Elite 8'}
              {round === 5 && 'Final Four'}
              {round === 6 && 'Championship'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roundGames.map((g) => {
                const t1 = getTeam(g.team1_id);
                const t2 = getTeam(g.team2_id);

                return (
                  <div
                    key={g.id}
                    className="bg-slate-800 border border-slate-700 rounded-xl p-4"
                  >
                    <h3 className="text-lg font-semibold mb-3">
                      Game {g.game_number}
                    </h3>

                    {/* TEAM 1 */}
                    <button
                      disabled={!t1}
                      onClick={() => pickWinner(g.id, t1?.id!)}
                      className={`w-full text-left p-3 rounded-lg mb-2 ${
                        g.winner === t1?.id
                          ? 'bg-green-600 text-black'
                          : 'bg-slate-700 text-gray-200'
                      }`}
                    >
                      {t1 ? `${t1.team_name} (Seed ${t1.seed})` : 'TBD'}
                    </button>

                    {/* TEAM 2 */}
                    <button
                      disabled={!t2}
                      onClick={() => pickWinner(g.id, t2?.id!)}
                      className={`w-full text-left p-3 rounded-lg ${
                        g.winner === t2?.id
                          ? 'bg-green-600 text-black'
                          : 'bg-slate-700 text-gray-200'
                      }`}
                    >
                      {t2 ? `${t2.team_name} (Seed ${t2.seed})` : 'TBD'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        onClick={saveBracket}
        disabled={saving}
        className="px-6 py-3 bg-yellow-500 text-black rounded-lg"
      >
        {saving ? 'Saving...' : 'Save Bracket'}
      </button>
    </div>
  );
}
