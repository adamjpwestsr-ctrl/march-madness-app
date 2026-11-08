"use client";

import React, { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseBrowserClient";
import { useRouter } from "next/navigation";
import CheatSheetPanel from "@/components/cheatsheet/CheatSheetPanel";

type Game = {
  id: string;
  game_number: number;
  round: number; // 0 = Opening, 1–4 = Region rounds, 5 = Final Four, 6 = Championship
  region: string | null; // West, East, South, Midwest or null for non-regional
  team1_id: string | null;
  team2_id: string | null;
};

type Team = {
  id: string;
  team_name: string;
  seed: number | null;
  region: string | null;
  logo_url?: string | null;
  conference?: string | null;
  record?: string | null;
  sos?: string | null;
  vs_top_10?: string | null;
  last_10?: string | null;
  espn_id?: string | null;
};

type RegionName =
  | "Opening Round"
  | "West"
  | "East"
  | "South"
  | "Midwest"
  | "Final Four"
  | "Championship";

type MatchupContext = {
  game: Game;
  team1: Team | undefined;
  team2: Team | undefined;
  team1IsOpeningRoundTeam: boolean;
  team2IsOpeningRoundTeam: boolean;
};

export default function DynamicBracketBuilder({
  params,
}: {
  params: Promise<{ bracketId: string }>;
}) {
  const { bracketId } = React.use(params);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [activeRegion, setActiveRegion] = useState<RegionName>("Opening Round");
  const [showOpeningInfo, setShowOpeningInfo] = useState(false);
  const [selectedMatchup, setSelectedMatchup] =
    useState<MatchupContext | null>(null);

  const [userName, setUserName] = useState("");
  const [bracketName, setBracketName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const { data: bracket } = await supabase
      .from("brackets")
      .select("*")
      .eq("bracket_id", bracketId)
      .single();

    setUserName(bracket?.user_name || "");
    setBracketName(bracket?.bracket_name || "");

    const { data: gameData } = await supabase
      .from("tournament_games")
      .select("*")
      .order("round", { ascending: true })
      .order("game_number", { ascending: true });

    const { data: teamData } = await supabase
      .from("tournament_teams")
      .select("*");

    const { data: pickData } = await supabase
      .from("bracket_picks")
      .select("*")
      .eq("bracket_id", bracketId);

    const pickMap: Record<string, string> = {};
    pickData?.forEach((p) => {
      pickMap[p.game_id] = p.picked_team;
    });

    setGames(gameData || []);
    setTeams(teamData || []);
    setPicks(pickMap);
    setLoading(false);
  }

  function getTeam(id: string | null) {
    if (!id) return undefined;
    return teams.find((t) => t.id === id);
  }

  function getLogoUrl(team: Team | undefined) {
    if (!team) return "/images/logos/default.png";
    if (team.logo_url) return team.logo_url;
    return "/images/logos/default.png";
  }

  function advanceWinner(game: Game, winnerTeamId: string) {
    const nextRound = game.round + 1;
    if (nextRound > 6) return;

    setGames((prev) => {
      const updated = [...prev];

      const isRegional = game.round >= 0 && game.round <= 4 && game.region;
      const isFinalFour = game.round === 5;

      if (isRegional) {
        const nextGameNumber = Math.floor((game.game_number - 1) / 2) + 1;
        const idx = updated.findIndex(
          (g) =>
            g.region === game.region &&
            g.round === nextRound &&
            g.game_number === nextGameNumber
        );
        if (idx !== -1) {
          const nextGame = updated[idx];
          const isOdd = game.game_number % 2 === 1;
          updated[idx] = {
            ...nextGame,
            [isOdd ? "team1_id" : "team2_id"]: winnerTeamId,
          };
        }
      } else if (isFinalFour) {
        const nextGameNumber = 1;
        const idx = updated.findIndex(
          (g) => g.round === 6 && g.game_number === nextGameNumber
        );
        if (idx !== -1) {
          const nextGame = updated[idx];
          const isOdd = game.game_number % 2 === 1;
          updated[idx] = {
            ...nextGame,
            [isOdd ? "team1_id" : "team2_id"]: winnerTeamId,
          };
        }
      }

      return updated;
    });
  }

  function handlePick(gameId: string, teamId: string | null | undefined) {
    if (!teamId) return;
    setPicks((prev) => ({
      ...prev,
      [gameId]: teamId,
    }));

    const game = games.find((g) => g.id === gameId);
    if (game) {
      advanceWinner(game, teamId);
    }
  }

  function handleMatchupInfo(game: Game) {
  const team1 = getTeam(game.team1_id);
  const team2 = getTeam(game.team2_id);

  const team1IsOpeningRoundTeam =
    game.round === 1 &&
    !!game.team1_id &&
    game.team1_id.startsWith("opening-");

  const team2IsOpeningRoundTeam =
    game.round === 1 &&
    !!game.team2_id &&
    game.team2_id.startsWith("opening-");

  setSelectedMatchup({
    game,
    team1,
    team2,
    team1IsOpeningRoundTeam,
    team2IsOpeningRoundTeam,
  });
}

  function closeMatchupInfo() {
    setSelectedMatchup(null);
  }

  async function saveBracket() {
    const rows = Object.entries(picks).map(([game_id, picked_team]) => ({
      bracket_id: bracketId,
      game_id,
      picked_team,
    }));

    if (rows.length === 0) {
      router.push(`/sports/march-madness-v2/bracket/view/${bracketId}`);
      return;
    }

    const { error } = await supabase
      .from("bracket_picks")
      .upsert(rows, { onConflict: "bracket_id,game_id" });

    if (error) {
      console.error("Error saving picks:", error);
      return;
    }

    router.push(`/sports/march-madness-v2/bracket/view/${bracketId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-gray-300">
        Loading bracket...
      </div>
    );
  }

  const regions: RegionName[] = [
    "Opening Round",
    "West",
    "East",
    "South",
    "Midwest",
    "Final Four",
    "Championship",
  ];

  const regionRounds: Record<
    "West" | "East" | "South" | "Midwest",
    Record<number, Game[]>
  > = {
    West: {},
    East: {},
    South: {},
    Midwest: {},
  };
  (["West", "East", "South", "Midwest"] as const).forEach((r) => {
    for (let round = 1; round <= 4; round++) {
      regionRounds[r][round] = games.filter(
        (g) => g.region === r && g.round === round
      );
    }
  });

  const openingRoundGames = games.filter((g) => g.round === 0);
  const finalFourGames = games.filter((g) => g.round === 5);
  const championshipGame = games.find((g) => g.round === 6);

  const elite8Games = games.filter((g) => g.round === 4);
  const allElite8Picked = elite8Games.every((g) => picks[g.id]);
  const finalFourPicked = finalFourGames.every((g) => picks[g.id]);

  function canActivateTab(region: RegionName) {
    if (region === "Final Four") {
      return allElite8Picked;
    }
    if (region === "Championship") {
      return finalFourPicked;
    }
    return true;
  }

  function handleTabClick(region: RegionName) {
    if (!canActivateTab(region)) return;
    setActiveRegion(region);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex flex-col">
      <header className="w-full border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
              March Madness • 2026–2027
            </span>
            <h1 className="text-2xl font-bold tracking-wide">
              Bracket Builder
            </h1>
            <p className="text-[0.7rem] text-slate-400 mt-1">
              Opening Round • Regional Brackets • Final Four • Championship
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right leading-tight">
              <div className="text-sm font-semibold text-white/90">
                {userName}
              </div>
              <div className="text-xs text-slate-400">{bracketName}</div>
            </div>

            <button
              onClick={saveBracket}
              className="px-5 py-2.5 bg-green-400 text-black font-semibold rounded-lg shadow-sm hover:bg-green-300 transition-all text-sm"
            >
              Save Picks
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[95vw] px-4 lg:px-8 py-6 flex gap-8 items-start justify-center">
          <div className="flex-1 flex flex-col">
            <div className="mb-4 border-b border-slate-800 flex gap-4">
              {regions.map((region) => {
                const locked = !canActivateTab(region);
                return (
                  <button
                    key={region}
                    onClick={() => handleTabClick(region)}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide border-b-2 transition-all ${
                      activeRegion === region
                        ? "border-yellow-400 text-yellow-300"
                        : locked
                        ? "border-transparent text-slate-500 cursor-not-allowed"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                    title={
                      locked
                        ? region === "Final Four"
                          ? "Complete all Elite 8 games to unlock Final Four."
                          : "Select Final Four winners to unlock Championship."
                        : ""
                    }
                  >
                    {region}
                  </button>
                );
              })}
            </div>

            {activeRegion === "Opening Round" && (
              <div className="mb-4 flex items-start gap-2">
                <button
                  onClick={() =>
                    setShowOpeningInfo((prev) => !prev)
                  }
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-slate-100"
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-500 text-[0.7rem]">
                    i
                  </span>
                  <span>About the new Opening Round</span>
                </button>
                {showOpeningInfo && (
                  <div className="mt-2 bg-slate-900/70 border border-slate-700 rounded-md p-3 text-xs text-slate-200 max-w-xl shadow-sm">
                    <p className="font-semibold mb-1">
                      Opening Round (2026–2027 and beyond)
                    </p>
                    <p>
                      Starting in the 2026–2027 season, March Madness will
                      include an Opening Round with 12 games—24 teams
                      competing to move on to the traditional Round of 64.
                      These games determine which teams advance into the
                      main bracket, adding an extra layer of strategy and
                      excitement before the field is set.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 flex flex-col gap-6">
              {activeRegion === "Opening Round" && (
                <OpeningRoundBlock
                  title="Opening Round"
                  games={openingRoundGames}
                  picks={picks}
                  getTeam={getTeam}
                  getLogoUrl={getLogoUrl}
                  onPick={handlePick}
                  onInfo={handleMatchupInfo}
                />
              )}

              {["West", "East", "South", "Midwest"].includes(
                activeRegion
              ) && (
                <RegionBracket
                  title={
                    activeRegion as
                      | "West"
                      | "East"
                      | "South"
                      | "Midwest"
                  }
                  rounds={
                    regionRounds[
                      activeRegion as
                        | "West"
                        | "East"
                        | "South"
                        | "Midwest"
                    ]
                  }
                  picks={picks}
                  getTeam={getTeam}
                  getLogoUrl={getLogoUrl}
                  onPick={handlePick}
                  onInfo={handleMatchupInfo}
                />
              )}

              {activeRegion === "Final Four" && (
                <FinalFourBlock
                  games={finalFourGames}
                  picks={picks}
                  getTeam={getTeam}
                  getLogoUrl={getLogoUrl}
                  onPick={handlePick}
                  onInfo={handleMatchupInfo}
                />
              )}

              {activeRegion === "Championship" && (
                <ChampionshipBlock
                  game={championshipGame}
                  picks={picks}
                  getTeam={getTeam}
                  getLogoUrl={getLogoUrl}
                  onPick={handlePick}
                  onInfo={handleMatchupInfo}
                />
              )}
            </div>
          </div>

          <div className="w-96">
            <CheatSheetPanel
              selectedMatchup={selectedMatchup}
              onClose={closeMatchupInfo}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* --- REGION BRACKET --- */
function RegionBracket({
  title,
  rounds,
  picks,
  getTeam,
  getLogoUrl,
  onPick,
  onInfo,
}: {
  title: "West" | "East" | "South" | "Midwest";
  rounds: Record<number, Game[]>;
  picks: Record<string, string>;
  getTeam: (id: string | null) => Team | undefined;
  getLogoUrl: (team: Team | undefined) => string;
  onPick: (gameId: string, teamId: string | null | undefined) => void;
  onInfo: (game: Game) => void;
}) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-4 uppercase tracking-wide text-center">
        {title} Region
      </h2>

      <div className="grid grid-cols-4 gap-6">
        {([1, 2, 3, 4] as const).map((round) => {
          const games = rounds[round] || [];
          const roundLabel =
            round === 1
              ? "Round of 64"
              : round === 2
              ? "Round of 32"
              : round === 3
              ? "Sweet 16"
              : "Elite 8";

          return (
            <div key={round} className="space-y-3 relative">
              <h3 className="text-xs font-semibold text-gray-300 mb-2 text-center uppercase">
                {roundLabel}
              </h3>
              {games.length === 0 ? (
                <div className="text-[0.7rem] text-slate-600 text-center">
                  Awaiting winners from previous round
                </div>
              ) : (
                games.map((g) => {
                  const t1 = getTeam(g.team1_id);
                  const t2 = getTeam(g.team2_id);
                  const winnerId = picks[g.id];

                  return (
                    <MatchupCard
                      key={g.id}
                      game={g}
                      team1={t1}
                      team2={t2}
                      winnerId={winnerId}
                      getLogoUrl={getLogoUrl}
                      onPick={onPick}
                      onInfo={onInfo}
                    />
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- OPENING ROUND --- */
function OpeningRoundBlock({
  title,
  games,
  picks,
  getTeam,
  getLogoUrl,
  onPick,
  onInfo,
}: {
  title: string;
  games: Game[];
  picks: Record<string, string>;
  getTeam: (id: string | null) => Team | undefined;
  getLogoUrl: (team: Team | undefined) => string;
  onPick: (gameId: string, teamId: string | null | undefined) => void;
  onInfo: (game: Game) => void;
}) {
  if (games.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 w-full shadow-sm">
      <h2 className="text-lg font-bold mb-4 uppercase tracking-wide text-center">
        {title}
      </h2>
      <div className="grid grid-cols-3 gap-4">
        {games.map((g) => {
          const t1 = getTeam(g.team1_id);
          const t2 = getTeam(g.team2_id);
          const winnerId = picks[g.id];

          return (
            <MatchupCard
              key={g.id}
              game={g}
              team1={t1}
              team2={t2}
              winnerId={winnerId}
              getLogoUrl={getLogoUrl}
              onPick={onPick}
              onInfo={onInfo}
            />
          );
        })}
      </div>
    </div>
  );
}

/* --- MATCHUP CARD --- */
function MatchupCard({
  game,
  team1,
  team2,
  winnerId,
  getLogoUrl,
  onPick,
  onInfo,
}: {
  game: Game;
  team1: Team | undefined;
  team2: Team | undefined;
  winnerId: string | undefined;
  getLogoUrl: (team: Team | undefined) => string;
  onPick: (gameId: string, teamId: string | null | undefined) => void;
  onInfo: (game: Game) => void;
}) {
  return (
    <div className="bg-slate-800 rounded-lg p-3 space-y-2 flex flex-col gap-2 border border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] text-slate-300">
          Game {game.game_number}
        </span>
        <button
          onClick={() => onInfo(game)}
          className="inline-flex items-center gap-1 text-[0.7rem] text-slate-200 hover:text-white"
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-400 text-[0.6rem]">
            i
          </span>
          <span>Matchup info</span>
        </button>
      </div>
      <TeamPickRow
        team={team1}
        isWinner={winnerId === team1?.id}
        logoUrl={getLogoUrl(team1)}
        onPick={() => onPick(game.id, team1?.id)}
      />
      <TeamPickRow
        team={team2}
        isWinner={winnerId === team2?.id}
        logoUrl={getLogoUrl(team2)}
        onPick={() => onPick(game.id, team2?.id)}
      />
    </div>
  );
}

/* --- TEAM PICK ROW --- */
function TeamPickRow({
  team,
  isWinner,
  logoUrl,
  onPick,
}: {
  team: Team | undefined;
  isWinner: boolean;
  logoUrl: string;
  onPick: () => void;
}) {
  const label = team
    ? `${team.seed ? `${team.seed} ` : ""}${team.team_name}`
    : "TBD";

  return (
    <button
      onClick={onPick}
      className={`flex items-center justify-between px-3 py-2 rounded-md transition-all ${
        isWinner
          ? "bg-green-400 text-black shadow-lg shadow-green-500/40"
          : "bg-slate-700 text-gray-100 hover:bg-slate-600 hover:shadow-md hover:shadow-slate-700/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <img
          src={logoUrl}
          alt={team?.team_name || "Team logo"}
          className="h-5 w-5 rounded-full object-cover border border-slate-600"
        />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      {isWinner && <span className="text-xs font-bold">WIN</span>}
    </button>
  );
}

/* --- FINAL FOUR --- */
function FinalFourBlock({
  games,
  picks,
  getTeam,
  getLogoUrl,
  onPick,
  onInfo,
}: {
  games: Game[];
  picks: Record<string, string>;
  getTeam: (id: string | null) => Team | undefined;
  getLogoUrl: (team: Team | undefined) => string;
  onPick: (gameId: string, teamId: string | null | undefined) => void;
  onInfo: (game: Game) => void;
}) {
  if (games.length === 0) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 w-full shadow-sm">
      <h2 className="text-lg font-bold mb-4 text-center uppercase tracking-wide">
        Final Four
      </h2>
      <div className="space-y-4">
        {games.map((g) => {
          const t1 = getTeam(g.team1_id);
          const t2 = getTeam(g.team2_id);
          const winnerId = picks[g.id];

          return (
            <MatchupCard
              key={g.id}
              game={g}
              team1={t1}
              team2={t2}
              winnerId={winnerId}
              getLogoUrl={getLogoUrl}
              onPick={onPick}
              onInfo={onInfo}
            />
          );
        })}
      </div>
    </div>
  );
}

/* --- CHAMPIONSHIP --- */
function ChampionshipBlock({
  game,
  picks,
  getTeam,
  getLogoUrl,
  onPick,
  onInfo,
}: {
  game: Game | undefined;
  picks: Record<string, string>;
  getTeam: (id: string | null) => Team | undefined;
  getLogoUrl: (team: Team | undefined) => string;
  onPick: (gameId: string, teamId: string | null | undefined) => void;
  onInfo: (game: Game) => void;
}) {
  if (!game) return null;

  const t1 = getTeam(game.team1_id);
  const t2 = getTeam(game.team2_id);
  const winnerId = picks[game.id];

  return (
    <div className="bg-slate-900/80 border border-yellow-500 rounded-xl p-4 w-full shadow-sm">
      <h2 className="text-lg font-bold mb-4 text-center uppercase tracking-wide text-yellow-400">
        Championship
      </h2>
      <MatchupCard
        game={game}
        team1={t1}
        team2={t2}
        winnerId={winnerId}
        getLogoUrl={getLogoUrl}
        onPick={onPick}
        onInfo={onInfo}
      />
    </div>
  );
}
