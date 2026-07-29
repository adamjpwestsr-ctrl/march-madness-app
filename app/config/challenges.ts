// Allowed status values for all challenges
export type ChallengeStatus = "Open" | "Coming Soon";

// Shape of each challenge entry
export type ChallengeConfig = {
  id: string;
  title: string;
  sport: string;
  description: string;
  difficulty: string;
  status: ChallengeStatus;
  href: string | null;
};

// Unified challenge + sports configuration
export const CHALLENGES: ChallengeConfig[] = [
  {
    id: "trivia",
    title: "Trivia",
    sport: "Trivia",
    description: "Daily & weekly trivia challenges",
    difficulty: "Easy",
    status: "Open",
    href: "/trivia",
  },

  // Golf
  {
    id: "golf",
    title: "Golf",
    sport: "Golf",
    description: "Explore all golf challenges.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/golf",
  },
  {
    id: "golf-weekly",
    title: "Golf Weekly",
    sport: "Golf",
    description: "Pick winners for this week's PGA event.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/golf/weekly",
  },

  // MLB
  {
    id: "mlb",
    title: "MLB",
    sport: "MLB",
    description: "Explore all MLB challenges.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/mlb",
  },
  {
    id: "mlb-weekly",
    title: "MLB Weekly",
    sport: "MLB",
    description: "Pick winners for each weekly MLB series.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/mlb/weekly",
  },
  {
    id: "mlb-derby",
    title: "MLB Homerun Derby",
    sport: "MLB",
    description: "Predict home run leaders in a derby-style challenge.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/mlb/derby",
  },

  // NFL
  {
    id: "nfl",
    title: "NFL",
    sport: "NFL",
    description: "Explore all NFL challenges.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/nfl",
  },
  {
    id: "nfl-weekly",
    title: "NFL Weekly",
    sport: "NFL",
    description: "Predict winners for the upcoming NFL slate.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/nfl/weekly",
  },
  {
    id: "nfl-player",
    title: "NFL Player Challenge",
    sport: "NFL",
    description: "Pick top performers by position for weekly points.",
    difficulty: "Hard",
    status: "Coming Soon",
    href: null,
  },
  {
    id: "nfl-fantasy",
    title: "NFL Fantasy Football",
    sport: "NFL",
    description: "Full fantasy football experience (coming 2027).",
    difficulty: "Hard",
    status: "Coming Soon",
    href: null,
  },

  // NBA
  {
    id: "nba",
    title: "NBA",
    sport: "NBA",
    description: "Explore all NBA challenges.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/nba",
  },
  {
    id: "nba-weekly",
    title: "NBA Weekly",
    sport: "NBA",
    description: "Compete in weekly basketball challenges.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/nba/weekly",
  },

  // NHL
  {
    id: "nhl",
    title: "NHL",
    sport: "NHL",
    description: "Explore all NHL challenges.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/nhl",
  },
  {
    id: "nhl-weekly",
    title: "NHL Weekly",
    sport: "NHL",
    description: "Predict winners for the weekly hockey slate.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/nhl/weekly",
  },

  // NASCAR
  {
    id: "nascar",
    title: "NASCAR",
    sport: "NASCAR",
    description: "Explore all NASCAR challenges.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/nascar",
  },
  {
    id: "nascar-weekly",
    title: "NASCAR Weekly",
    sport: "NASCAR",
    description: "Predict top finishers for each race.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/nascar/weekly",
  },

  // College
  {
    id: "march-madness",
    title: "College Basketball",
    sport: "College Basketball",
    description: "Enter your March Madness Bracket.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/march-madness",
  },
  {
    id: "college-football",
    title: "College Football",
    sport: "College Football",
    description: "Join the playoff challenge and pick your champions.",
    difficulty: "Medium",
    status: "Coming Soon",
    href: null,
  },
];
