import fs from "fs";
import path from "path";
import { cfbd } from "./client.js";

async function main() {
  console.log("Fetching ALL teams from CFBD...");
  const all = await cfbd.get("/teams");

  console.log("Filtering FBS + FCS...");
  const fbs = all.data.filter(t => t.classification === "fbs");
  const fcs = all.data.filter(t => t.classification === "fcs");

  const allTeams = [...fbs, ...fcs];

  const outputPath = path.join(process.cwd(), "data/cfbd/teams.json");
  fs.writeFileSync(outputPath, JSON.stringify(allTeams, null, 2));

  console.log(`Saved ${allTeams.length} total teams`);
}

main();
