import fs from "fs";
import path from "path";

// Load the filtered teams.json you just generated
const teams = JSON.parse(
  fs.readFileSync("data/cfbd/teams.json", "utf8")
);

// CSV header
const header = "id,name,abbreviation,conference,logo_url\n";

// Build rows
const rows = teams
  .map((t) => {
    return `${t.id},"${t.school}",${t.abbreviation || ""},${t.conference || ""},${t.logos?.[0] || ""}`;
  })
  .join("\n");

// Write CSV
const outputPath = path.join(process.cwd(), "data/cfbd/ncaaf_teams.csv");
fs.writeFileSync(outputPath, header + rows);

console.log("Generated ncaaf_teams.csv");
