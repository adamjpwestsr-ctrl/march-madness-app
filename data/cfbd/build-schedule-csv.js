import fs from "fs";
import path from "path";

const year = 2026;

// Load full schedule JSON
const schedule = JSON.parse(
  fs.readFileSync(`data/cfbd/schedule-${year}.json`, "utf8")
);

// Filter: ONLY FBS + FCS games
const filtered = schedule.filter(
  (g) =>
    (g.homeClassification === "fbs" || g.homeClassification === "fcs") &&
    (g.awayClassification === "fbs" || g.awayClassification === "fcs")
);

// CSV header matching Supabase schema
const header = [
  "season_year",
  "week",
  "game_id",
  "home_team_id",
  "away_team_id",
  "home_team_score",
  "away_team_score",
  "start_time",
  "conference",
  "is_top25",
  "home_rank",
  "away_rank"
].join(",") + "\n";

// Build rows
const rows = filtered
  .map((g) => {
    return [
      g.season,
      g.week,
      g.id,
      g.homeId,
      g.awayId,
      g.homePoints ?? "",
      g.awayPoints ?? "",
      g.startDate,
      g.homeConference || g.awayConference || "",
      false, // is_top25 default
      "",    // home_rank
      ""     // away_rank
    ].join(",");
  })
  .join("\n");

// Write CSV
const outputPath = path.join(
  process.cwd(),
  `data/cfbd/ncaaf_schedule_${year}.csv`
);

fs.writeFileSync(outputPath, header + rows);

console.log(
  `Generated ncaaf_schedule_${year}.csv with ${filtered.length} FBS/FCS games`
);
