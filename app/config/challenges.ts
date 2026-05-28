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
  {
    id: "golf-weekly",
    title: "Golf Weekly",
    sport: "Golf",
    description: "Pick winners for this week's PGA event.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/golf/weekly",
  },

  // ✅ Correct MLB entry (only one, fully typed)
  {
    id: "mlb-weekly",
    title: "MLB Weekly",
    sport: "MLB",
    description: "Pick winners for each weekly MLB series.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/mlb",
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
    id: "march-madness",
    title: "College Basketball",
    sport: "College Basketball",
    description: "Enter your March Madness Bracket.",
    difficulty: "Medium",
    status: "Open",
    href: "/sports/march-madness",
  },
  {
    id: "nba-daily",
    title: "NBA Daily",
    sport: "NBA",
    description: "Compete in daily and weekly basketball challenges.",
    difficulty: "Medium",
    status: "Coming Soon",
    href: null,
  },
  {
    id: "nhl-weekly",
    title: "NHL Weekly",
    sport: "NHL",
    description: "Predict winners for the weekly hockey slate.",
    difficulty: "Medium",
    status: "Coming Soon",
    href: null,
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
