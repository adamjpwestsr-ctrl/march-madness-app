// MLB 2026 Series CSV Generator (Fantasy Week Logic)
// Run: node scripts/generate-mlb-2026-series.js
// Output: mlb_2026_series.csv in project root

import fs from "fs";
import path from "path";
import fetch from "node-fetch";

(async () => {
  const season = 2026;
  const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${season}`;

  console.log(`Fetching MLB ${season} schedule from Stats API...`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error("Failed to fetch schedule:", res.status, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  const games = data.dates
    .flatMap((d) => d.games)
    .filter((g) => g.gameType === "R");

  if (games.length === 0) {
    console.error("No regular-season games found.");
    process.exit(1);
  }

  // Opening Day = earliest gameDate
  const openingDay = new Date(
    games
      .map((g) => g.gameDate)
      .sort((a, b) => new Date(a) - new Date(b))[0]
  );
  console.log(`Opening Day detected: ${openingDay.toISOString().slice(0, 10)}`);

  const seriesMap = new Map();

  for (const g of games) {
    const homeId = g.teams.home.team.id;
    const awayId = g.teams.away.team.id;
    const seriesNumber = g.seriesNumber;
    const key = `${seriesNumber}-${homeId}-${awayId}`;
    const gameDate = new Date(g.gameDate);
    const dateStr = g.gameDate.slice(0, 10);

    let s = seriesMap.get(key);
    if (!s) {
      const diffDays = Math.floor(
        (gameDate - openingDay) / (1000 * 60 * 60 * 24)
      );
      const weekNumber = Math.floor(diffDays / 7) + 1;

      s = {
        seriesId: seriesNumber,
        homeTeamId: homeId,
        awayTeamId: awayId,
        startDate: dateStr,
        endDate: dateStr,
        seriesLength: g.gamesInSeries,
        weekNumber,
      };
      seriesMap.set(key, s);
    } else {
      if (dateStr < s.startDate) s.startDate = dateStr;
      if (dateStr > s.endDate) s.endDate = dateStr;
      if (g.gamesInSeries > s.seriesLength) s.seriesLength = g.gamesInSeries;
    }
  }

  const seriesList = Array.from(seriesMap.values()).sort((a, b) => {
    if (a.weekNumber !== b.weekNumber) return a.weekNumber - b.weekNumber;
    if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
    return a.seriesId - b.seriesId;
  });

  const outPath = path.join(process.cwd(), "mlb_2026_series.csv");
  const header =
    "series_id,week_number,start_date,end_date,home_team_id,away_team_id,series_length\n";
  const rows = seriesList
    .map(
      (s) =>
        `${s.seriesId},${s.weekNumber},${s.startDate},${s.endDate},${s.homeTeamId},${s.awayTeamId},${s.seriesLength}`
    )
    .join("\n");

  fs.writeFileSync(outPath, header + rows, "utf8");
  console.log(`✅ Wrote ${seriesList.length} series to ${outPath}`);
})();
