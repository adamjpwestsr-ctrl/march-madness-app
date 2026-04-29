/**
 * ------------------------------------------------------------
 *  TRIVIA MULTIPLE-CHOICE GENERATOR (FINAL PATCHED VERSION)
 * ------------------------------------------------------------
 *  Fixes included:
 *   ✔ Corrected detectType() (no more "what is" → rule)
 *   ✔ Added award category
 *   ✔ Added award distractor pool
 *   ✔ MLB/NBA never fall into quirky fallback
 *   ✔ Confidence-based regeneration
 *   ✔ Non-MLB/NBA rows preserved
 *   ✔ Sport-specific fallback pools (no more "Alabama everywhere")
 *   ✔ Normalized correct answers (Option D + V)
 *   ✔ Outputs EXACT Supabase column order
 * ------------------------------------------------------------
 */

import fs from "fs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

// ------------------------------------------------------------
// 1. Curated Distractor Pools
// ------------------------------------------------------------

// MLB Teams
const MLB_TEAMS = [
  "New York Yankees", "Boston Red Sox", "Chicago Cubs", "Los Angeles Dodgers",
  "San Francisco Giants", "Houston Astros", "St. Louis Cardinals",
  "Atlanta Braves", "New York Mets", "Philadelphia Phillies",
  "Cleveland Guardians", "Detroit Tigers", "Pittsburgh Pirates",
  "Milwaukee Brewers", "San Diego Padres", "Arizona Diamondbacks",
  "Colorado Rockies", "Miami Marlins", "Tampa Bay Rays",
  "Baltimore Orioles", "Kansas City Royals", "Minnesota Twins",
  "Texas Rangers", "Seattle Mariners", "Toronto Blue Jays",
  "Cincinnati Reds", "Chicago White Sox", "Oakland Athletics",
  "Washington Nationals", "Los Angeles Angels"
];

// NBA Teams
const NBA_TEAMS = [
  "Los Angeles Lakers", "Boston Celtics", "Chicago Bulls", "Golden State Warriors",
  "Miami Heat", "San Antonio Spurs", "Houston Rockets", "Dallas Mavericks",
  "Phoenix Suns", "Philadelphia 76ers", "Milwaukee Bucks", "Toronto Raptors",
  "Denver Nuggets", "Utah Jazz", "Portland Trail Blazers", "New York Knicks",
  "Brooklyn Nets", "Cleveland Cavaliers", "Atlanta Hawks", "Charlotte Hornets",
  "Indiana Pacers", "Detroit Pistons", "Orlando Magic", "Washington Wizards",
  "Memphis Grizzlies", "Minnesota Timberwolves", "New Orleans Pelicans",
  "Oklahoma City Thunder", "Sacramento Kings", "LA Clippers"
];

// Player Pool
const PLAYER_POOL = [
  "Barry Bonds", "Babe Ruth", "Hank Aaron", "Willie Mays", "Ted Williams",
  "Alex Rodriguez", "Ken Griffey Jr", "Mike Trout", "Derek Jeter",
  "Nolan Ryan", "Randy Johnson", "Roger Clemens", "Mariano Rivera",
  "LeBron James", "Michael Jordan", "Kobe Bryant", "Tim Duncan",
  "Shaquille O'Neal", "Stephen Curry", "Kevin Durant", "Magic Johnson",
  "Larry Bird", "Kareem Abdul-Jabbar", "Giannis Antetokounmpo",
  "Allen Iverson", "Charles Barkley", "Wilt Chamberlain"
];

// Rule definitions
const RULE_POOL = [
  "Illegal pitching motion advancing runners",
  "Walks and Hits per Inning Pitched",
  "Failure to shoot within 24 seconds",
  "Illegal movement without dribbling",
  "Offensive foul for running into a defender",
  "Forceful downward score into basket",
  "Returning ball to backcourt illegally",
  "Positioning to secure rebound"
];

// Nicknames
const NICKNAME_POOL = [
  "The Kid", "The Big Unit", "The Sultan of Swat", "The Iron Man",
  "The Splendid Splinter", "The Beard", "The Answer", "The Mailman",
  "The Admiral", "The Dream", "His Airness"
];

// Stadiums
const STADIUM_POOL = [
  "Fenway Park", "Wrigley Field", "Dodger Stadium", "Yankee Stadium",
  "Oracle Arena", "Madison Square Garden", "Chase Center", "Coors Field"
];

// Quirky facts
const QUIRKY_POOL = [
  "Dock Ellis pitched a no-hitter on LSD",
  "A can of corn is an easy fly ball",
  "Golden Sombrero means four strikeouts",
  "Immaculate Inning means 9 pitches, 3 strikeouts"
];

// Awards
const AWARD_POOL = [
  "Cy Young Award",
  "Silver Slugger",
  "Gold Glove",
  "Rookie of the Year",
  "Most Valuable Player",
  "Hank Aaron Award"
];

// Sport-specific fallback pools
const FALLBACK_POOLS = {
  "College Football": ["Clemson", "Ohio State", "Georgia"],
  "Soccer": ["Manchester City", "Real Madrid", "Barcelona"],
  "Tennis": ["Serena Williams", "Novak Djokovic", "Rafael Nadal"],
  "Golf": ["Tiger Woods", "Phil Mickelson", "Rory McIlroy"]
};

// ------------------------------------------------------------
// 2. Utility Functions
// ------------------------------------------------------------

function normalizeAnswer(answer) {
  if (!answer) return "";
  answer = answer.trim();
  answer = answer.replace(/ - /g, " – ");
  answer = answer.replace(/ points| HRs| wins| assists| rebounds/gi, "");
  return answer;
}

// Detect question type (PATCHED)
function detectType(question) {
  const q = question.toLowerCase();

  if (q.includes("what year") || q.includes("in what year") || q.includes("when"))
    return "year";

  if (q.startsWith("who") || q.includes("which player"))
    return "player";

  if (q.includes("which team") || q.includes("what team"))
    return "team";

  if (q.includes("most") || q.includes("record") || q.includes("stat"))
    return "stat";

  if (q.includes("award") || q.includes("trophy") || q.includes("mvp"))
    return "award";

  if (
    q.includes("what does") ||
    q.includes("stand for") ||
    q.includes("term for") ||
    q.includes("rule")
  )
    return "rule";

  if (q.includes("known as"))
    return "nickname";

  if (q.includes("stadium") || q.includes("park"))
    return "stadium";

  if (q.includes("won the") || q.includes("championship"))
    return "championship";

  return "quirky";
}

function pickRandom(pool, exclude, n) {
  const filtered = pool.filter((x) => x !== exclude);
  const result = [];
  while (result.length < n && filtered.length > 0) {
    const idx = Math.floor(Math.random() * filtered.length);
    result.push(filtered[idx]);
    filtered.splice(idx, 1);
  }
  return result;
}

// ------------------------------------------------------------
// 3. Distractor Generator
// ------------------------------------------------------------

function generateDistractors(type, sport, correct) {
  let distractors;

  switch (type) {
    case "year": {
      const year = parseInt(correct);
      distractors = !isNaN(year)
        ? [String(year - 10), String(year + 5), String(year - 20)]
        : ["1950", "1960", "1970"];
      break;
    }

    case "player":
      distractors = pickRandom(PLAYER_POOL, correct, 3);
      break;

    case "team":
      distractors = sport === "MLB"
        ? pickRandom(MLB_TEAMS, correct, 3)
        : pickRandom(NBA_TEAMS, correct, 3);
      break;

    case "stat":
      distractors = pickRandom(PLAYER_POOL, correct, 3);
      break;

    case "rule":
      distractors = pickRandom(RULE_POOL, correct, 3);
      break;

    case "nickname":
      distractors = pickRandom(NICKNAME_POOL, correct, 3);
      break;

    case "stadium":
      distractors = pickRandom(STADIUM_POOL, correct, 3);
      break;

    case "championship":
      distractors = sport === "MLB"
        ? pickRandom(MLB_TEAMS, correct, 3)
        : pickRandom(NBA_TEAMS, correct, 3);
      break;

    case "award":
      distractors = pickRandom(AWARD_POOL, correct, 3);
      break;

    default:
      distractors = pickRandom(QUIRKY_POOL, correct, 3);
  }

  // Fallback for other sports
  if (!distractors || distractors.length < 3) {
    distractors = FALLBACK_POOLS[sport] || ["Team A", "Team B", "Team C"];
  }

  return distractors;
}

// ------------------------------------------------------------
// 4. Main Pipeline
// ------------------------------------------------------------

function run() {
  const input = fs.readFileSync("sports_trivia_mc.csv", "utf8");
  const rows = parse(input, { columns: true });

  const output = [];

  for (const row of rows) {
    const normalizedCorrect = normalizeAnswer(row.correct_answer);
    let type = detectType(row.question);

    // MLB/NBA should NEVER fall into quirky unless truly quirky
    if ((row.sport === "MLB" || row.sport === "NBA") && type === "quirky") {
      type = "player"; // safe fallback
    }

    const CONFIDENT_TYPES = [
      "year", "player", "team", "stat", "rule",
      "nickname", "stadium", "championship", "award"
    ];

    const shouldRegenerate =
      (row.sport === "MLB" || row.sport === "NBA") &&
      CONFIDENT_TYPES.includes(type);

    if (shouldRegenerate) {
      const distractors = generateDistractors(type, row.sport, normalizedCorrect);

      output.push({
        id: row.id,
        sport: row.sport,
        question: row.question,
        correct_answer: normalizedCorrect,
        choice_a: normalizedCorrect,
        choice_b: distractors[0],
        choice_c: distractors[1],
        choice_d: distractors[2],
        difficulty: row.difficulty,
        points: row.points,
        category_tag: row.category_tag
      });
    } else {
      // Preserve original choices
      output.push({
        id: row.id,
        sport: row.sport,
        question: row.question,
        correct_answer: normalizedCorrect,
        choice_a: row.choice_a,
        choice_b: row.choice_b,
        choice_c: row.choice_c,
        choice_d: row.choice_d,
        difficulty: row.difficulty,
        points: row.points,
        category_tag: row.category_tag
      });
    }
  }

  const csv = stringify(output, { header: true });
  fs.writeFileSync("sports_trivia_mc_clean.csv", csv);

  console.log("✔ FINAL Patched Trivia MC generation complete!");
  console.log("✔ Output written to sports_trivia_mc_clean.csv");
}

run();
