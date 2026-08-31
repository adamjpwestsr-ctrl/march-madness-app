const fs = require("fs");
const path = require("path");

const fbsPath = path.join(process.cwd(), "data/espn/teams-fbs.json");
const fcsPath = path.join(process.cwd(), "data/espn/teams-fcs.json");
const outputPath = path.join(process.cwd(), "data/espn/teams.json");

// Load both JSON files
const fbs = JSON.parse(fs.readFileSync(fbsPath, "utf8"));
const fcs = JSON.parse(fs.readFileSync(fcsPath, "utf8"));

// Merge leagues
const merged = {
  sports: [
    {
      id: "20",
      leagues: [...fbs.sports[0].leagues, ...fcs.sports[0].leagues],
    },
  ],
};

// Write merged file
fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
console.log("Merged FBS + FCS into teams.json");
