import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function NcaafScoreboardPage() {
  const supabase = await createSupabaseServerClient();

  const seasonYear = new Date().getFullYear();

  // Load all games with team joins
  const { data: games } = await supabase
    .from("ncaaf_games")
    .select(`
      *,
      home_team:ncaaf_teams!ncaaf_games_home_team_id_fkey(*),
      away_team:ncaaf_teams!ncaaf_games_away_team_id_fkey(*)
    `)
    .eq("season_year", seasonYear)
    .order("start_time", { ascending: true });

  if (!games) {
    return (
      <div className="min-h-screen text-white p-6">
        <h1 className="text-xl font-semibold">NCAAF Scoreboard</h1>
        <p className="text-red-400 mt-2">Failed to load scoreboard.</p>
      </div>
    );
  }

  const now = new Date();

  const liveGames = games.filter(
    (g) =>
      g.home_team_score !== null &&
      g.away_team_score !== null &&
      new Date(g.start_time) <= now &&
      g.home_team_score === g.home_team_score // always true, just ensures numeric
  );

  const finalGames = games.filter(
    (g) =>
      g.home_team_score !== null &&
      g.away_team_score !== null &&
      new Date(g.start_time) < now
  );

  const upcomingGames = games.filter(
    (g) => new Date(g.start_time) > now
  );

  return (
    <div className="min-h-screen text-white p-6 space-y-10">
      <header>
        <h1 className="text-4xl font-bold">NCAAF Scoreboard</h1>
        <p className="text-slate-400">Season {seasonYear}</p>
      </header>

      {/* LIVE */}
      {liveGames.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-red-400">
            LIVE Games
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveGames.map((g) => (
              <ScoreCard key={g.game_id} game={g} status="LIVE" />
            ))}
          </div>
        </section>
      )}

      {/* FINAL */}
      {finalGames.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-green-400">
            Final Scores
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {finalGames.map((g) => (
              <ScoreCard key={g.game_id} game={g} status="FINAL" />
            ))}
          </div>
        </section>
      )}

      {/* UPCOMING */}
      {upcomingGames.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-yellow-400">
            Upcoming Games
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingGames.map((g) => (
              <ScoreCard key={g.game_id} game={g} status="UPCOMING" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ScoreCard({ game, status }) {
  const home = game.home_team;
  const away = game.away_team;

  return (
    <div className="rounded-xl bg-slate-900/40 border border-white/10 p-4 shadow-md hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-3">
        <span
          className={`text-xs font-bold ${
            status === "LIVE"
              ? "text-red-400"
              : status === "FINAL"
              ? "text-green-400"
              : "text-yellow-400"
          }`}
        >
          {status}
        </span>
        <span className="text-slate-400 text-xs">
          {new Date(game.start_time).toLocaleString()}
        </span>
      </div>

      {/* HOME */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={home.logo_url}
            className="w-10 h-10 rounded shadow"
            alt={home.name}
          />
          <span className="text-white font-semibold">{home.name}</span>
        </div>
        <span className="text-xl text-white">
          {game.home_team_score ?? "-"}
        </span>
      </div>

      <div className="text-center text-slate-400 my-2">vs</div>

      {/* AWAY */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={away.logo_url}
            className="w-10 h-10 rounded shadow"
            alt={away.name}
          />
          <span className="text-white font-semibold">{away.name}</span>
        </div>
        <span className="text-xl text-white">
          {game.away_team_score ?? "-"}
        </span>
      </div>
    </div>
  );
}
