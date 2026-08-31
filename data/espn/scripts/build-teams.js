const fs = require("fs");
const path = require("path");

const inputPath = path.join(process.cwd(), "data/espn/teams.json");
const outputPath = path.join(process.cwd(), "ncaaf_teams.csv");

// Load ESPN JSON
const raw = fs.readFileSync(inputPath, "utf8");
const json = JSON.parse(raw);

// Extract teams from all leagues
const teams = json.sports[0].leagues.flatMap((league) =>
  league.teams.map((t) => {
    const team = t.team;
    return {
      id: team.id.toString(),
      name: team.displayName,
      abbreviation: team.abbreviation || "",
      conference: league.name || "",
      logo_url: team.logos?.[0]?.href || "",
    };
  })
);

// Build CSV
const header = "id,name,abbreviation,conference,logo_url\n";

const rows = teams
  .map(
    (t) =>
      `${t.id},"${t.name}",${t.abbreviation},${t.conference},${t.logo_url}`
  )
  .join("\n");

// Write CSV
fs.writeFileSync(outputPath, header + rows);

console.log("Generated ncaaf_teams.csv with", teams.length, "teams");
