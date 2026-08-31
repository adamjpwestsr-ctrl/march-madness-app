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

async function fetchPagedRefs(urlBase, label) {
  const refs = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const url = `${urlBase}?limit=${limit}&offset=${offset}`;
    console.log(`Fetching ${label} index offset=${offset}`);

    const page = await fetchJson(url);

    if (!page.items || page.items.length === 0) break;

    for (const item of page.items) {
      if (item.$ref) refs.push(item.$ref);
    }

    if (page.items.length < limit) break;
    offset += limit;
  }

  console.log(`${label} refs: ${refs.length}`);
  return refs;
}

async function fetchTeams(refs, label) {
  const teams = [];

  for (const ref of refs) {
    console.log(`Fetching ${label} team: ${ref}`);
    const team = await fetchJson(ref);
    teams.push(team);
  }

  console.log(`${label} teams fetched: ${teams.length}`);
  return teams;
}

async function main() {
  const fbsBase =
    "https://sports.core.api.espn.com/v2/sports/football/leagues/fbs/teams";
  const fcsBase =
    "https://sports.core.api.espn.com/v2/sports/football/leagues/fcs/teams";

  const fbsRefs = await fetchPagedRefs(fbsBase, "FBS");
  const fcsRefs = await fetchPagedRefs(fcsBase, "FCS");

  const fbsTeams = await fetchTeams(fbsRefs, "FBS");
  const fcsTeams = await fetchTeams(fcsRefs, "FCS");

  const merged = {
    sports: [
      {
        id: "20",
        leagues: [
          {
            abbreviation: "FBS",
            name: "NCAA Football Bowl Subdivision",
            teams: fbsTeams,
          },
          {
            abbreviation: "FCS",
            name: "NCAA Football Championship Subdivision",
            teams: fcsTeams,
          },
        ],
      },
    ],
  };

  const outputPath = path.join(process.cwd(), "data/espn/teams.json");
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));

  console.log("Saved full FBS + FCS teams.json");
}

main();
