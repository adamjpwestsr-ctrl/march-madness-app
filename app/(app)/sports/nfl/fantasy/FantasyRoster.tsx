"use client";

import { useEffect, useState } from "react";
import { getTeamLogo } from "@/lib/getTeamLogo";

export default function FantasyRoster({ userId }: { userId: number }) {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<any[]>([]);
  const [roster, setRoster] = useState<any>(null);
  const [rosterPlayers, setRosterPlayers] = useState<any[]>([]);
  const [season] = useState(new Date().getFullYear());

  // Roster size limit
  const MAX_ROSTER_SIZE = 15;

  // Filters
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");
  const [teamFilter, setTeamFilter] = useState("ALL");

  // Weekly stats
  const [week, setWeek] = useState(1);
  const [weeklyStats, setWeeklyStats] = useState<any>({});
  const [statsLoading, setStatsLoading] = useState(false);

  // Projected points
  const [projections, setProjections] = useState<any>({});
  const [projLoading, setProjLoading] = useState(false);

  // Season totals
  const [seasonTotals, setSeasonTotals] = useState<any>({});
  const [seasonLoading, setSeasonLoading] = useState(false);

  // Bye weeks
  const [byeWeeks, setByeWeeks] = useState<any>({});

  // Player Detail Modal
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  // Filter logic
  const filteredPlayers = players.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase());

    const matchesPosition =
      positionFilter === "ALL" || p.position === positionFilter;

    const matchesTeam = teamFilter === "ALL" || p.team === teamFilter;

    return matchesSearch && matchesPosition && matchesTeam;
  });

  // Load roster + players
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Load roster
      const rosterRes = await fetch(`/api/fantasy/roster/get?userId=${userId}&season=${season}`);
      let rosterData = await rosterRes.json();

      // If no roster exists, create one
      if (!rosterData?.id) {
        const createRes = await fetch("/api/fantasy/roster/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, season }),
        });
        rosterData = await createRes.json();
      }

      setRoster(rosterData);

      // Load all NFL players
      const playersRes = await fetch("/api/fantasy/players");
      const playersJson = await playersRes.json();
      setPlayers(playersJson.players || []);

      // Load roster players
      const rosterPlayersRes = await fetch(`/api/fantasy/roster/players?rosterId=${rosterData.id}`);
      const rpData = await rosterPlayersRes.json();
      setRosterPlayers(rpData);

      // Load bye weeks
      const byeRes = await fetch("/api/nfl/weekly/byes");
      const byeJson = await byeRes.json();
      setByeWeeks(byeJson);

      setLoading(false);
    };

    loadData();
  }, [userId, season]);

  // Load weekly stats
  useEffect(() => {
    const loadStats = async () => {
      setStatsLoading(true);

      const res = await fetch(`https://api.sleeper.app/v1/stats/nfl/regular/${week}`);
      const stats = await res.json();

      const mapped: any = {};
      stats.forEach((s: any) => {
        mapped[s.player_id] = s;
      });

      setWeeklyStats(mapped);
      setStatsLoading(false);
    };

    loadStats();
  }, [week]);

  // Load projections for roster players only
  useEffect(() => {
    const loadProjections = async () => {
      setProjLoading(true);

      const mapped: any = {};

      for (const p of rosterPlayers) {
        try {
          const res = await fetch(
            `https://api.sleeper.app/v1/projections/nfl/player/${p.sleeper_id}?season_type=regular&week=${week}`
          );
          const proj = await res.json();

          if (proj && proj[0]) {
            mapped[p.sleeper_id] = proj[0];
          }
        } catch (err) {
          console.error("Projection error:", err);
        }
      }

      setProjections(mapped);
      setProjLoading(false);
    };

    if (rosterPlayers.length > 0) {
      loadProjections();
    }
  }, [week, rosterPlayers]);

  // Load season totals
  useEffect(() => {
    const loadSeasonTotals = async () => {
      setSeasonLoading(true);

      const mapped: any = {};

      for (const p of rosterPlayers) {
        try {
          const res = await fetch(
            `https://api.sleeper.app/v1/stats/nfl/player/${p.sleeper_id}?season_type=regular`
          );
          const totals = await res.json();

          if (totals && totals[0]) {
            mapped[p.sleeper_id] = totals[0];
          }
        } catch (err) {
          console.error("Season totals error:", err);
        }
      }

      setSeasonTotals(mapped);
      setSeasonLoading(false);
    };

    if (rosterPlayers.length > 0) {
      loadSeasonTotals();
    }
  }, [rosterPlayers]);

  // ADD PLAYER (with roster limit)
  const addPlayer = async (playerId: number) => {
    if (rosterPlayers.length >= MAX_ROSTER_SIZE) return;

    await fetch("/api/fantasy/roster/addPlayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rosterId: roster.id, playerId }),
    });

    const res = await fetch(`/api/fantasy/roster/players?rosterId=${roster.id}`);
    setRosterPlayers(await res.json());
  };

  // REMOVE PLAYER
  const removePlayer = async (playerId: number) => {
    await fetch("/api/fantasy/roster/removePlayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rosterId: roster.id, playerId }),
    });

    const res = await fetch(`/api/fantasy/roster/players?rosterId=${roster.id}`);
    setRosterPlayers(await res.json());
  };

  if (loading) {
    return <p className="text-slate-400">Loading roster...</p>;
  }

  return (
    <div className="space-y-8">

      {/* ROSTER HEADER */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Roster</h2>
        <p className="text-slate-400 text-sm">
          Season {season} • {rosterPlayers.length} / {MAX_ROSTER_SIZE} players selected
        </p>

        {rosterPlayers.length >= MAX_ROSTER_SIZE && (
          <p className="text-red-500 text-sm mt-1">
            Roster is full — remove a player to add more.
          </p>
        )}
      </div>

      {/* WEEK SELECTOR */}
      <div className="flex items-center gap-3">
        <p className="text-slate-300">Week:</p>
        <select
          value={week}
          onChange={(e) => setWeek(Number(e.target.value))}
          className="bg-slate-800 border border-slate-700 text-white p-2 rounded-lg"
        >
          {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={w}>
              Week {w}
            </option>
          ))}
        </select>
      </div>

      {/* ROSTER LIST */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
        {rosterPlayers.length === 0 ? (
          <p className="text-slate-500">No players added yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {rosterPlayers.map((p) => {
              const logo = getTeamLogo(p.team);
              const stats = weeklyStats[p.espn_id];
              const proj = projections[p.sleeper_id];
              const totals = seasonTotals[p.sleeper_id];
              const isBye = byeWeeks[week]?.includes(p.team);

              return (
                <div
                  key={p.id}
                  className="bg-slate-800 border border-slate-700 p-3 rounded-lg flex flex-col cursor-pointer"
                  onClick={() => setSelectedPlayer(p)}
                >
                  {/* TEAM LOGO */}
                  {logo && (
                    <img
                      src={logo as string}
                      alt={p.team}
                      className="w-12 h-12 object-contain mb-2"
                    />
                  )}

                  <p className="font-medium text-white">{p.name}</p>
                  <p className="text-slate-400 text-sm">{p.team} • {p.position}</p>

                  {/* BYE WEEK BADGE */}
                  {isBye && (
                    <p className="mt-2 text-red-400 text-xs font-semibold">
                      BYE WEEK
                    </p>
                  )}

                  {/* PROJECTED POINTS */}
                  {!isBye && (
                    <div className="mt-2 text-sm text-blue-300">
                      {projLoading ? (
                        <p className="text-slate-500">Loading projections...</p>
                      ) : proj ? (
                        <p className="font-semibold">
                          Projected: {proj.pts_ppr?.toFixed(1)} pts
                        </p>
                      ) : (
                        <p className="text-slate-500">No projection available</p>
                      )}
                    </div>
                  )}

                  {/* WEEKLY STATS */}
                  {!isBye && (
                    <div className="mt-3 text-sm text-slate-300">
                      {statsLoading ? (
                        <p className="text-slate-500">Loading stats...</p>
                      ) : stats ? (
                        <>
                          <p className="font-semibold text-emerald-400">
                            {stats.pts_ppr?.toFixed(1)} pts
                          </p>
                          <p>Pass: {stats.pass_yd || 0} yd • {stats.pass_td || 0} TD</p>
                          <p>Rush: {stats.rush_yd || 0} yd • {stats.rush_td || 0} TD</p>
                          <p>Rec: {stats.rec || 0} • {stats.rec_yd || 0} yd • {stats.rec_td || 0} TD</p>
                        </>
                      ) : (
                        <p className="text-slate-500">No stats for Week {week}</p>
                      )}
                    </div>
                  )}

                  {/* SEASON TOTALS PREVIEW */}
                  {totals && (
                    <p className="mt-2 text-xs text-slate-400">
                      Season: {totals.pts_ppr?.toFixed(1)} pts
                    </p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePlayer(p.id);
                    }}
                    className="mt-3 bg-red-600 hover:bg-red-500 text-sm px-3 py-1 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* PLAYER POOL */}
      <div>
        <h2 className="text-xl font-bold mb-3">Available Players</h2>

        {/* FILTERS */}
        <div className="mb-4 space-y-3">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search players..."
            className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* POSITION FILTERS */}
          <div className="flex flex-wrap gap-2">
            {["ALL", "QB", "RB", "WR", "TE", "K", "DEF"].map((pos) => (
              <button
                key={pos}
                onClick={() => setPositionFilter(pos)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  positionFilter === pos
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* TEAM FILTER */}
          <select
            className="w-full p-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="ALL">All Teams</option>
            {Array.from(new Set(players.map((p) => p.team)))
              .sort()
              .map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
          </select>
        </div>

        {/* FILTERED PLAYER LIST */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPlayers.map((p) => {
            const isFull = rosterPlayers.length >= MAX_ROSTER_SIZE;
            const logo = getTeamLogo(p.team);

            return (
              <div
                key={p.id}
                className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex flex-col cursor-pointer"
                onClick={() => setSelectedPlayer(p)}
              >
                {/* TEAM LOGO */}
                {logo && (
                  <img
                    src={logo as string}
                    alt={p.team}
                    className="w-12 h-12 object-contain mb-2"
                  />
                )}

                <p className="font-medium text-white">{p.name}</p>
                <p className="text-slate-400 text-sm">{p.team} • {p.position}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    !isFull && addPlayer(p.id);
                  }}
                  disabled={isFull}
                  className={`mt-3 text-sm px-3 py-1 rounded-lg ${
                    isFull
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {isFull ? "Roster Full" : "Add to Roster"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLAYER DETAIL MODAL */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedPlayer(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-4">
              {getTeamLogo(selectedPlayer.team) && (
                <img
                  src={getTeamLogo(selectedPlayer.team) as string}
                  alt={selectedPlayer.team}
                  className="w-14 h-14 object-contain"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-white">{selectedPlayer.name}</h3>
                <p className="text-slate-400 text-sm">
                  {selectedPlayer.team} • {selectedPlayer.position}
                </p>
              </div>
            </div>

            {/* BYE WEEK */}
            {byeWeeks[week]?.includes(selectedPlayer.team) && (
              <p className="text-red-400 font-semibold mb-3">BYE WEEK</p>
            )}

            {/* PROJECTED POINTS */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white mb-2">Projected Points</h4>

              {projLoading ? (
                <p className="text-slate-500">Loading projections...</p>
              ) : projections[selectedPlayer.sleeper_id] ? (
                <>
                  <p className="text-blue-300 font-bold text-lg">
                    {projections[selectedPlayer.sleeper_id].pts_ppr?.toFixed(1)} pts
                  </p>
                  <p className="text-slate-300">
                    Pass: {projections[selectedPlayer.sleeper_id].pass_yd || 0} yd •{" "}
                    {projections[selectedPlayer.sleeper_id].pass_td || 0} TD
                  </p>
                  <p className="text-slate-300">
                    Rush: {projections[selectedPlayer.sleeper_id].rush_yd || 0} yd •{" "}
                    {projections[selectedPlayer.sleeper_id].rush_td || 0} TD
                  </p>
                  <p className="text-slate-300">
                    Rec: {projections[selectedPlayer.sleeper_id].rec || 0} •{" "}
                    {projections[selectedPlayer.sleeper_id].rec_yd || 0} yd •{" "}
                    {projections[selectedPlayer.sleeper_id].rec_td || 0} TD
                  </p>
                </>
              ) : (
                <p className="text-slate-500">No projection available.</p>
              )}
            </div>

            {/* WEEKLY STATS */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white mb-2">Week {week} Stats</h4>

              {statsLoading ? (
                <p className="text-slate-500">Loading stats...</p>
              ) : weeklyStats[selectedPlayer.espn_id] ? (
                <>
                  <p className="text-emerald-400 font-bold text-lg">
                    {weeklyStats[selectedPlayer.espn_id].pts_ppr?.toFixed(1)} pts
                  </p>
                  <p className="text-slate-300">
                    Pass: {weeklyStats[selectedPlayer.espn_id].pass_yd || 0} yd •{" "}
                    {weeklyStats[selectedPlayer.espn_id].pass_td || 0} TD
                  </p>
                  <p className="text-slate-300">
                    Rush: {weeklyStats[selectedPlayer.espn_id].rush_yd || 0} yd •{" "}
                    {weeklyStats[selectedPlayer.espn_id].rush_td || 0} TD
                  </p>
                  <p className="text-slate-300">
                    Rec: {weeklyStats[selectedPlayer.espn_id].rec || 0} •{" "}
                    {weeklyStats[selectedPlayer.espn_id].rec_yd || 0} yd •{" "}
                    {weeklyStats[selectedPlayer.espn_id].rec_td || 0} TD
                  </p>
                </>
              ) : (
                <p className="text-slate-500">No stats available.</p>
              )}
            </div>

            {/* SEASON TOTALS */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-white mb-2">Season Totals</h4>

              {seasonLoading ? (
                <p className="text-slate-500">Loading season totals...</p>
              ) : seasonTotals[selectedPlayer.sleeper_id] ? (
                <>
                  <p className="text-emerald-400 font-bold text-lg">
                    {seasonTotals[selectedPlayer.sleeper_id].pts_ppr?.toFixed(1)} pts total
                  </p>

                  <p className="text-slate-300">
                    Games: {seasonTotals[selectedPlayer.sleeper_id].gp || 0}
                  </p>

                  <p className="text-slate-300">
                    Avg:{" "}
                    {(
                      (seasonTotals[selectedPlayer.sleeper_id].pts_ppr || 0) /
                      (seasonTotals[selectedPlayer.sleeper_id].gp || 1)
                    ).toFixed(1)}{" "}
                    pts/game
                  </p>

                  <p className="text-slate-300">
                    Pass: {seasonTotals[selectedPlayer.sleeper_id].pass_yd || 0} yd •{" "}
                    {seasonTotals[selectedPlayer.sleeper_id].pass_td || 0} TD
                  </p>

                  <p className="text-slate-300">
                    Rush: {seasonTotals[selectedPlayer.sleeper_id].rush_yd || 0} yd •{" "}
                    {seasonTotals[selectedPlayer.sleeper_id].rush_td || 0} TD
                  </p>

                  <p className="text-slate-300">
                    Rec: {seasonTotals[selectedPlayer.sleeper_id].rec_yd || 0} yd •{" "}
                    {seasonTotals[selectedPlayer.sleeper_id].rec_td || 0} TD
                  </p>
                </>
              ) : (
                <p className="text-slate-500">No season totals available.</p>
              )}
            </div>

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
