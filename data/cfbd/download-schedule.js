import fs from "fs";
import path from "path";
import { cfbd } from "./client.js";

async function main() {
  const year = 2026;

  console.log(`Fetching REGULAR SEASON schedule for ${year}...`);

  // ✅ Ask CFBD directly for only regular season games
  const games = await cfbd.get(`/games?year=${year}&seasonType=regular`);

  const outputPath = path.join(
    process.cwd(),
    `data/cfbd/schedule-${year}.json`
  );

  fs.writeFileSync(outputPath, JSON.stringify(games.data, null, 2));

  console.log(`Saved ${games.data.length} regular-season games for ${year}`);
}

main();
