import fs from "fs";
import csv from "csv-parser";

const byeWeeks = {
  5: ["CAR", "KC"],
  6: ["CIN", "DET", "MIA", "MIN"],
  7: ["BUF", "JAX", "LAC", "WAS"],
  8: ["HOU", "NO", "NYG", "SF"],
  9: ["PIT", "TEN"],
  10: ["CHI", "DEN", "PHI", "TB"],
  11: ["ATL", "CLE", "GB", "LAR", "NE", "SEA"],
  13: ["BAL", "IND", "LV", "NYJ"],
  14: ["ARI", "DAL"]
};

const scheduleFile = "NFL_Schedule.csv";

const violations = [];

fs.createReadStream(scheduleFile)
  .pipe(csv())
  .on("data", (row) => {
    const week = Number(row.week_number);
    const home = row.home_team_id;
    const away = row.away_team_id;

    const byes = byeWeeks[week] || [];

    if (byes.includes(home)) {
      violations.push(`Week ${week}: ${home} played but is on bye`);
    }
    if (byes.includes(away)) {
      violations.push(`Week ${week}: ${away} played but is on bye`);
    }
  })
  .on("end", () => {
    if (violations.length === 0) {
      console.log("✔ No bye-week violations found.");
    } else {
      console.log("❌ Bye-week violations detected:");
      violations.forEach((v) => console.log(" - " + v));
    }
  });
