const fs = require("fs");
const path = require("path");
const https = require("https");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
        "Accept": "application/json",
      },
    };

    https.get(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
      res.on("error", reject);
    });
  });
}

async function main() {
  console.log("Fetching ESPN team index…");

  const indexUrl = "https://sports.core.api.espn.com/v2/sports/football/teams";
  const index = await fetchJson(indexUrl);

  if (!index.items) {
    console.error("ERROR: ESPN returned no items.");
    return;
  }

  const teamRefs = index.items.map((item) => item.$ref);
  console.log(`Found ${teamRefs.length} team refs`);

  const allTeams = [];

  for (const ref of teamRefs) {
    console.log(`Fetching team: ${ref}`);
    const team = await fetchJson(ref);
    allTeams.push(team);
  }

  const merged = {
    sports: [
      {
        id: "20",
        leagues: [
          {
            abbreviation: "NCAAF",
            name: "NCAA College Football",
            teams: allTeams,
          },
        ],
      },
    ],
  };

  const outputPath = path.join(process.cwd(), "data/espn/teams.json");
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));

  console.log(`Saved ${allTeams.length} total teams to teams.json`);
}

main();
