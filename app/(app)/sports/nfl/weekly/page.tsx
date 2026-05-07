"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Team = {
  id: number;
  name: string;
  abbreviation: string;
  logo_url: string | null;
};

type Game = {
  id: number;
  week: number;
  home_team: number;
  away_team: number;
  game_date: string;
};

export default function NFLWeeklyPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const { data: teamData } = await supabase
        .from("nfl_teams")
        .select("*")
        .order("name", { ascending: true });

      const { data: gameData } = await supabase
        .from("nfl_weekly_games")
        .select("*")
        .eq("active", true)
        .order("game_date", { ascending: true });

      setTeams(teamData || []);
      setGames(gameData || []);
      setLoading(false);
    }

    loadData();
  }, []);

  const getTeamName = (id: number) =>
    teams.find((t) => t.id === id)?.name || "Unknown";

  const getTeamLogo = (id: number) =>
    teams.find((t) => t.id === id)?.logo_url || null;

  return (
    <div className="space-y-10">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-semibold mb-2">NFL Weekly Challenge</h1>
        <p className="text-slate-400 max-w-2xl">
          Predict winners for this week’s NFL slate. Earn points for correct
          picks and climb the leaderboard.
        </p>
      </section>

      {/* CTA */}
      <section>
        <Link
          href="/sports/nfl/weekly/picks"
          className="inline-block px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          Make Your Picks
        </Link>
      </section>

      {/* Games List */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">This Week’s Games</h2>
        {loading && <p className="text-slate-400">Loading games…</p>}
        {!loading && games.length > 0 && (
          <ul className="space-y-3">
            {games.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between border border-slate-800 rounded-lg p-3 hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-3">
                  {getTeamLogo(g.away_team) && (
                    <img
                      src={getTeamLogo(g.away_team)!}
                      alt={getTeamName(g.away_team)}
                      className="w-6 h-6 rounded-full border border-slate-700"
                    />
                  )}
                  <span className="text-white font-medium">
                    {getTeamName(g.away_team)}
                  </span>
                </div>

                <span className="text-slate-400">at</span>

                <div className="flex items-center gap-3">
                  {getTeamLogo(g.home_team) && (
                    <img
                      src={getTeamLogo(g.home_team)!}
                      alt={getTeamName(g.home_team)}
                      className="w-6 h-6 rounded-full border border-slate-700"
                    />
                  )}
                  <span className="text-white font-medium">
                    {getTeamName(g.home_team)}
                  </span>
                </div>

                <span className="text-slate-500 text-sm">
                  {new Date(g.game_date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
        {!loading && games.length === 0 && (
          <p className="text-slate-400">No active games found.</p>
        )}
      </section>

      {/* Scoring */}
      <section className="rounded-xl border border-slate-800 p-6 bg-slate-900/40">
        <h2 className="text-xl font-semibold mb-4">Scoring</h2>
        <ul className="text-slate-400 list-disc pl-6 space-y-2">
          <li>1 point per correct pick</li>
          <li>Bonus points for perfect weeks</li>
          <li>Leaderboard updates after each game</li>
        </ul>
      </section>
    </div>
  );
}
