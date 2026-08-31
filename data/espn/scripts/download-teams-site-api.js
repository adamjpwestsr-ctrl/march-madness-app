const fs = require("fs");
const path = require("path");
const https = require("https");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(JSON.parse(data)));
      res.on("error", reject);
    });
  });
}

async function main() {
  const allTeams = [];
  let offset = 0;

  while (true) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/football/college-football/teams?offset=${offset}`;
    console.log(`Fetching offset ${offset}`);

    const page = await fetchJson(url);

    if (!page.teams || page.teams.length === 0) {
      break;
    }

    allTeams.push(...page.teams);
    offset += 50;
  }

  console.log(`Total teams fetched: ${allTeams.length}`);

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

  console.log("Saved full teams.json");
}

main();
